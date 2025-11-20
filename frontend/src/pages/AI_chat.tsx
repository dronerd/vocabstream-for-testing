import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Types and category/lesson metadata ---
type ConversationMode = "choice" | "casual" | "lesson";
type ConversationStep =
  | "initial"
  | "level"
  | "topic"
  | "confirm"
  | "test"
  | "skills"
  | "duration"
  | "components"
  | "vocab-category"
  | "structure"
  | "chatting";

interface ChatEntry {
  sender: "user" | "llm";
  text: string;
}

const CATEGORIES: Record<string, string> = {
  "business-entry": "Business (Entry)",
  "business-global": "Business (Global)",
  "business-intermediate": "Business (Intermediate)",
  "computer-science": "Computer Science",
  "economics-business": "Economics & Business",
  "engineering": "Engineering",
  "environment": "Environment",
  "idioms-advanced": "Idioms (Advanced)",
  "idioms-high-intermediate": "Idioms (High-Intermediate)",
  "idioms-intermediate": "Idioms (Intermediate)",
  "idioms-proficiency": "Idioms (Proficiency)",
  "law": "Law",
  "medicine": "Medicine",
  "politics": "Politics",
  "word-advanced": "Words (Advanced)",
  "word-high-intermediate": "Words (High-Intermediate)",
  "word-intermediate": "Words (Intermediate)",
  "word-proficiency": "Words (Proficiency)",
};

const LESSON_COUNTS: Record<string, number> = {
  "business-entry": 50,
  "business-global": 60,
  "business-intermediate": 48,
  "computer-science": 40,
  "economics-business": 36,
  "engineering": 71,
  "environment": 30,
  "idioms-advanced": 28,
  "idioms-high-intermediate": 32,
  "idioms-intermediate": 34,
  "idioms-proficiency": 26,
  "law": 22,
  "medicine": 18,
  "politics": 71,
  "word-advanced": 44,
  "word-high-intermediate": 50,
  "word-intermediate": 64,
  "word-proficiency": 40,
};

const TOPICS = [
  "Computer Science & Technology",
  "Medicine & Health",
  "Business & Economics",
  "Environmental Science & Sustainability",
  "Law & Politics",
  "Engineering",
];

const TESTS = ["英検", "TOEFL", "TOEIC", "IELTS", "ケンブリッジ英検", "特になし"];
const SKILLS = ["リーディング", "リスニング", "ライティング", "スピーキング"];
const COMPONENTS = [
  "単語練習",
  "文章読解",
  "会話練習",
  "文法練習",
];

export default function AI_chat() {
  const navigate = useNavigate();

  // UI styling helpers and global background
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#d8f3dc";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  // Disclaimer banner for development stage
  const disclaimerBanner = (
    <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b-2 border-yellow-400 px-6 py-2 z-50">
      <p className="text-sm text-yellow-900 text-center">
        ⚠️ <strong>：</strong> 本機能は現在まだ開発実験段階であり、機能がまだ不安定です。今後の開発を楽しみにしていてください。
      </p>
    </div>
  );

  const containerClass = "min-h-screen flex items-start justify-center p-6"; 
  const contentClass = "w-full max-w-2xl p-6 bg-transparent mx-auto"; 
  const btnPrimary = "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:opacity-95 hover:scale-102 transform transition";
  const btnSecondary = "bg-gray-700 text-white font-semibold px-5 py-2 rounded-full shadow-md hover:opacity-95 hover:shadow-lg transform transition";
  const btnAccent = "bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-3 rounded-full shadow-xl hover:scale-105 transition transform";
  const btnStart = "bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full shadow-2xl text-lg transition transform hover:scale-105";

  // Overall conversation state
  const [mode, setMode] = useState<ConversationMode>("choice");
  const [step, setStep] = useState<ConversationStep>("initial");

  // Common settings
  const [level, setLevel] = useState("A1");
  const [levelConfirmed, setLevelConfirmed] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Computer Science & Technology"]);
  const [customTopic, setCustomTopic] = useState("");

  // Lesson settings
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("15");
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [vocabCategory, setVocabCategory] = useState("word-intermediate");
  const [vocabLessonType, setVocabLessonType] = useState<"range" | "individual">("range");
  const [vocabRangeStart, setVocabRangeStart] = useState("1");
  const [vocabRangeEnd, setVocabRangeEnd] = useState("5");
  const [vocabIndividualLessons, setVocabIndividualLessons] = useState<string[]>(["1"]);

  // Timer state for lessons
  const [lessonStartTime, setLessonStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentComponent, setCurrentComponent] = useState(0);

  // Chat state
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);

  // Timer effect for lessons - MUST be at top level, not inside conditional
  useEffect(() => {
    if (mode !== "lesson" || !lessonStartTime || step !== "chatting") return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lessonStartTime) / 1000);
      setTimeElapsed(elapsed);

      // Calculate component timing
      const structure = generateLessonStructure();
      let cumulativeTime = 0;
      
      for (let i = 0; i < structure.length; i++) {
        const componentTime = structure[i].minutes * 60;
            if (elapsed >= cumulativeTime + componentTime && currentComponent === i) {
          // Time to move to next component
          if (i < structure.length - 1) {
              const nextIndex = i + 1;
              setCurrentComponent(nextIndex);
              // Auto-advance to next component with announcement
              const nextComponent = structure[nextIndex];
              const movePrompt = `次は「${nextComponent.name}」に移ってください。`;
              setChatLog((prev) => {
                // avoid duplicating the same move prompt
                if (prev.some((e) => e.text === `⏱️ ${movePrompt}`)) return prev;
                return [
                  ...prev,
                  { sender: "llm", text: `⏱️ ${movePrompt}` },
                ];
              });
              // Send the next component's prompt to AI
              setTimeout(() => {
                handleLessonStart(generateComponentContent(nextComponent.name));
              }, 100);
          }
        }
        cumulativeTime += componentTime;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lessonStartTime, currentComponent, mode, step, selectedDuration, selectedComponents]);

  // Helper functions
  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleComponentToggle = (component: string) => {
    if (selectedComponents.includes(component)) {
      setSelectedComponents(selectedComponents.filter((c) => c !== component));
    } else {
      setSelectedComponents([...selectedComponents, component]);
    }
  };

  const handleTestToggle = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter((t) => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleVocabLessonToggle = (lesson: string) => {
    if (vocabIndividualLessons.includes(lesson)) {
      setVocabIndividualLessons(vocabIndividualLessons.filter((l) => l !== lesson));
    } else {
      setVocabIndividualLessons([...vocabIndividualLessons, lesson]);
    }
  };

  const topicsToPass = selectedTopics.concat(customTopic ? [customTopic] : []);
  const maxLessonsForCategory = LESSON_COUNTS[vocabCategory] || 64;

  // Helper for generating lesson numbers for individual selection
  const generateLessonNumbers = () => {
    const max = LESSON_COUNTS[vocabCategory] || 64;
    return Array.from({ length: max }, (_, i) => (i + 1).toString());
  };

  // Helper for generating lesson numbers for range selection
  const getLessonNumbersFromRange = () => {
    const start = Math.max(1, parseInt(vocabRangeStart) || 1);
    const end = Math.min(maxLessonsForCategory, parseInt(vocabRangeEnd) || 5);
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
  };

  // Helper to generate component timing schedule
  const generateComponentTiming = () => {
    const structure = generateLessonStructure();
    let cumulativeTime = 0;
    return structure.map((item) => {
      const startTime = cumulativeTime;
      const endTime = cumulativeTime + item.minutes * 60;
      cumulativeTime = endTime;
      return {
        component: item.name,
        startSeconds: startTime,
        endSeconds: endTime,
        durationSeconds: item.minutes * 60,
      };
    });
  };

  // NOTE: Removed previous post-processing of trailing question marks per user request.

  // Generate AI system prompt for a given lesson component
  // These prompts instruct the AI to generate the lesson content and questions
  const generateComponentContent = (componentName: string) => {
    switch (componentName) {
      case "単語練習":
        return (
          `You are an English teacher conducting a vocabulary lesson. ` +
          `Start by saying a brief greeting (e.g., "Hi! Let's start with vocabulary practice."). ` +
          `Then, introduce 5 vocabulary words related to the student's interests (${selectedTopics.join(", ")}). ` +
          `For each word, provide the word, its meaning/definition, and an example sentence. ` +
          `After presenting all 5 words, ask the student one comprehension question to test their understanding ` +
          `(e.g., ask them to use one of the words in a sentence, or ask what a specific word means). ` +
          `Keep the tone friendly and encouraging.`
        );
      case "文章読解":
        return (
          `You are an English teacher conducting a reading comprehension lesson. ` +
          `Start by saying a brief greeting (e.g., "Hi! Let's do a reading comprehension activity."). ` +
          `Then, present a short, interesting text (3-5 sentences) on a topic related to the student's interests (${selectedTopics.join(", ")}). ` +
          `The text should be appropriate for the student's level (${level}). ` +
          `After presenting the text, ask one comprehension question to test the student's understanding of the main idea or details. ` +
          `Keep the tone friendly and encouraging.`
        );
      case "会話練習":
        return (
          `You are an English teacher conducting a conversation practice lesson. ` +
          `Start by saying a brief greeting (e.g., "Hi! Let's practice conversation."). ` +
          `Then, ask the student an open-ended question related to their interests (${selectedTopics.join(", ")}) ` +
          `that encourages them to have a natural conversation. ` +
          `Make sure the question is appropriate for the student's level (${level}). ` +
          `After the student responds, continue the conversation naturally by asking follow-up questions or commenting on their response. ` +
          `Keep the tone friendly, natural, and encouraging.`
        );
      case "文法練習":
        return (
          `You are an English teacher conducting a grammar lesson. ` +
          `Start by saying a brief greeting (e.g., "Hi! Let's practice grammar."). ` +
          `Then, present a grammar concept or exercise appropriate for the student's level (${level}). ` +
          `For example, you could: (1) provide a sentence with a blank and ask the student to fill it with the correct grammar form, ` +
          `or (2) ask the student to correct a sentence with a grammar error, or (3) ask them to write a sentence using a specific grammar pattern. ` +
          `After the student responds, provide feedback and explain the grammar rule briefly. ` +
          `Keep the tone friendly and encouraging.`
        );
      default:
        return `You are an English teacher. Start with a brief greeting and help the student learn English in a friendly way.`;
    }
  };

  // Lesson structure preview
  const generateLessonStructure = () => {
    const durationMin = parseInt(selectedDuration);
    const componentCount = selectedComponents.length || 1;
    const timePerComponent = Math.floor(durationMin / componentCount);

    return selectedComponents.map((comp) => ({
      name: comp,
      minutes: timePerComponent,
    }));
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newLog: ChatEntry[] = [...chatLog, { sender: "user", text: userInput }];
    setChatLog(newLog);
    const inputText = userInput;
    setUserInput("");

    // Determine API URL with fallback to local development server
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    
    try {
      const testsToPass = selectedTests.length > 0 
        ? selectedTests.map(t => t === "Other" ? customTest : t)
        : [];

      const vocabLessonsToPass = vocabLessonType === "range" 
        ? getLessonNumbersFromRange()
        : vocabIndividualLessons;

      const componentTiming = generateComponentTiming();

      const payload =
        mode === "casual"
          ? {
              message: inputText,
              level,
              topics: topicsToPass,
              mode: "casual",
            }
          : {
              message: inputText,
              level,
              topics: topicsToPass,
              tests: testsToPass,
              skills: selectedSkills,
              duration: parseInt(selectedDuration),
              durationMinutes: parseInt(selectedDuration),
              currentComponent: currentComponent,
              currentComponentName: selectedComponents[currentComponent] || null,
              components: selectedComponents,
              componentTiming: componentTiming,
              totalTimeElapsed: timeElapsed,
              timeElapsedSeconds: timeElapsed,
              vocabCategory: selectedComponents.includes("Vocab Practice") ? vocabCategory : null,
              vocabLessons: selectedComponents.includes("Vocab Practice") ? vocabLessonsToPass : null,
              mode: "lesson",
            };

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      let replyText: string = data.reply || "No response";
      const llmResponse: ChatEntry = { sender: "llm", text: replyText };
      setChatLog((prev) => [...prev, llmResponse]);
    } catch (error) {
      console.error(error);
      setChatLog((prev) => [
        ...prev,
        { sender: "llm", text: "エラー: レスポンスを取得できませんでした。" },
      ]);
    }
  };

  // Helper to start a lesson by sending the first component prompt to the AI
  const handleLessonStart = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Determine API URL with fallback to local development server
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
    
    try {
      const testsToPass = selectedTests.length > 0 
        ? selectedTests.map(t => t === "Other" ? customTest : t)
        : [];

      const vocabLessonsToPass = vocabLessonType === "range" 
        ? getLessonNumbersFromRange()
        : vocabIndividualLessons;

      const componentTiming = generateComponentTiming();

      const payload = {
        message: prompt,
        level,
        topics: topicsToPass,
        tests: testsToPass,
        skills: selectedSkills,
        duration: parseInt(selectedDuration),
        durationMinutes: parseInt(selectedDuration),
        currentComponent: currentComponent,
        currentComponentName: selectedComponents[currentComponent] || null,
        components: selectedComponents,
        componentTiming: componentTiming,
        totalTimeElapsed: timeElapsed,
        timeElapsedSeconds: timeElapsed,
        vocabCategory: selectedComponents.includes("Vocab Practice") ? vocabCategory : null,
        vocabLessons: selectedComponents.includes("Vocab Practice") ? vocabLessonsToPass : null,
        mode: "lesson",
      };

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      let replyText: string = data.reply || "No response";
      const llmResponse: ChatEntry = { sender: "llm", text: replyText };
      setChatLog((prev) => [...prev, llmResponse]);
    } catch (error) {
      console.error(error);
      setChatLog((prev) => [
        ...prev,
        { sender: "llm", text: "エラー: レスポンスを取得できませんでした。" },
      ]);
    }
  };

  // Choice screen
  if (mode === "choice") {
    return (
      <>
        <main className={containerClass} style={{ paddingTop: '92px' }}>
           {disclaimerBanner}
          <div className={contentClass}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">AIと何をしたいですか？</h1>
              <p className="text-gray-600">今日のあなたの目的を選んでください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onMouseEnter={() => {}}
                onClick={() => {
                  setMode("casual");
                  setStep("level");
                  setChatLog([]);
                  setSelectedTopics(["Computer Science & Technology"]);
                  setCustomTopic("");
                  setLevelConfirmed(false);
                }}
                className={`${btnPrimary} h-24 flex items-center justify-center hover:scale-105`}
              >
                楽しく会話したい
              </button>
              <button
                onClick={() => {
                  setMode("lesson");
                  setStep("level");
                  setChatLog([]);
                  setSelectedTopics(["Computer Science & Technology"]);
                  setCustomTopic("");
                  setSelectedSkills([]);
                  setSelectedComponents([]);
                  setLevelConfirmed(false);
                }}
                className={`${btnSecondary} h-24 flex items-center justify-center hover:scale-105`} 
              >
                英語レッスンを受けたい
              </button>
            </div>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className={`${btnSecondary}`}
              >
                ← 戻る
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Setup steps - Level selection
  if (step === "level") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-2">英語レベルの設定</h1>
          <p className="text-gray-600 mb-4">あなたの現在の英語レベルを選んでください</p>

          <div className="mb-4">
            <span className="text-sm text-gray-700">選択： </span>
            <span className="font-bold text-lg text-indigo-700">{level}</span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  setLevelConfirmed(true);
                }}
                className={`py-6 px-6 rounded-lg font-bold transition duration-200 transform hover:scale-105 ${
                  level === lvl
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="text-2xl mb-1">{lvl}</div>
                <div className="text-xs opacity-75">
                  {lvl === "A1" && "初級"}
                  {lvl === "A2" && "初中級"}
                  {lvl === "B1" && "中級"}
                  {lvl === "B2" && "中上級"}
                  {lvl === "C1" && "上級"}
                  {lvl === "C2" && "最上級"}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => setMode("choice")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                if (!levelConfirmed) {
                  alert("レベルを選択してください（選択中が表示されます）");
                  return;
                }
                setStep("topic");
              }}
              className={`px-6 py-3 rounded-lg font-bold ${levelConfirmed ? btnPrimary : "bg-gray-300 text-gray-600"}`}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Topic selection
  if (step === "topic") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-2">興味の設定</h1>
          <p className="text-gray-600 mb-6">興味のあるトピックを選択してください。（＊複数選択可能です）</p>

          <div className="flex flex-col gap-3 mb-6">
            {TOPICS.map((topic) => (
              <label key={topic} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => handleTopicToggle(topic)}
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">{topic}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2">その他のトピック (自由記入):</label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="カスタムトピックを入力..."
              className="w-full border rounded-lg p-3 bg-white"
            />
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("level")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                if (selectedTopics.length === 0 && !customTopic) {
                  alert("少なくとも1つのトピックを選択してください");
                  return;
                }
                if (mode === "casual") {
                  setStep("confirm");
                } else {
                  setStep("test");
                }
              }}
              className={btnPrimary}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Helper to start casual conversation by sending a prompt to the AI
  const handleCasualStart = async () => {
    const casualPrompt = `You are a friendly English conversation partner. Start the conversation with a warm greeting and ask the user a simple, open-ended question to get them talking. For example, you could ask "How are you today?" or "What have you been up to?" based on their interests (${selectedTopics.join(", ")}). Keep the tone natural, friendly, and encouraging. The user is at level ${level}.`;
    
    setChatLog([]);
    setStep("chatting");
    
    // Send the casual start prompt to AI
    setTimeout(() => {
      handleLessonStart(casualPrompt);
    }, 50);
  };

  // Casual mode confirmation
  if (mode === "casual" && step === "confirm") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-6">設定の確認</h1>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">英語レベル:</h3>
            <p className="text-lg font-bold">{level}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">トピック:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {topicsToPass.map((topic) => (
                <span key={topic} className="bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep("topic")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            ← 編集
          </button>
          <button
            onClick={handleCasualStart}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg"
          >
            会話を開始する
          </button>
        </div>
      </main>
    );
  }

  // Lesson mode - Test type selection
  if (mode === "lesson" && step === "test") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-6">英語試験への対策の設定</h1>
          <p className="text-sm text-gray-600 mb-6">受験予定の英語試験を選択してください （＊複数選択可能です）</p>

          <div className="flex flex-col gap-3 mb-6">
            {TESTS.map((test) => (
              <label key={test} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test)}
                  onChange={() => handleTestToggle(test)}
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">{test}</span>
              </label>
            ))}
          </div>

          {selectedTests.includes("Other") && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">その他の試験名:</label>
              <input
                type="text"
                value={customTest}
                onChange={(e) => setCustomTest(e.target.value)}
                placeholder="試験名を入力..."
                className="w-full border rounded-lg p-3 bg-white"
              />
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("topic")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                if (selectedTests.length === 0) {
                  alert("少なくとも1つの試験を選択してください");
                  return;
                }
                setStep("skills");
              }}
              className={btnPrimary}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Lesson mode - Skills selection
  if (mode === "lesson" && step === "skills") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-6">伸ばしたいスキルを選択してください</h1>

          <div className="flex flex-col gap-3 mb-6">
            {SKILLS.map((skill) => (
              <label key={skill} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">{skill}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("test")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                if (selectedSkills.length === 0) {
                  alert("少なくとも1つのスキルを選択してください");
                  return;
                }
                setStep("duration");
              }}
              className={btnPrimary}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Lesson mode - Duration selection
  if (mode === "lesson" && step === "duration") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-2">レッスンの希望時間を選択してください</h1>
          <p className="text-gray-600 mb-8">レッスンに費やしたい時間を選んでください</p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[5, 10, 15, 20, 25, 30].map((min) => (
              <button
                key={min}
                onClick={() => setSelectedDuration(min.toString())}
                className={`p-6 rounded-lg font-bold transition duration-200 transform hover:scale-105 ${
                  selectedDuration === min.toString()
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{min}</div>
                <div className="text-sm opacity-75">分</div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center">
            <p className="text-sm text-gray-600">選択中: <span className="font-bold text-lg text-blue-600">{selectedDuration}分</span></p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("skills")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => setStep("components")}
              className={btnPrimary}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Lesson mode - Components selection
  if (mode === "lesson" && step === "components") {
    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
          <h1 className="text-2xl font-bold mb-6">レッスンに含める内容を選択してください</h1>

          <div className="flex flex-col gap-3 mb-6">
            {COMPONENTS.map((component) => (
              <label key={component} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:bg-gray-50 transition">
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(component)}
                  onChange={() => handleComponentToggle(component)}
                  className="w-5 h-5 mr-3"
                />
                <span className="font-medium">{component}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep("duration")}
              className={btnSecondary}
            >
              ← 戻る
            </button>
            <button
              onClick={() => {
                if (selectedComponents.length === 0) {
                  alert("少なくとも1つのコンポーネントを選択してください");
                  return;
                }
                if (selectedComponents.includes("Vocab Practice")) {
                  setStep("vocab-category");
                } else {
                  setStep("structure");
                }
              }}
              className={btnPrimary}
            >
              次へ →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Lesson mode - Vocab category selection
  if (mode === "lesson" && step === "vocab-category") {
    const vocabCategories = Object.entries(CATEGORIES).filter(([key]) =>
      key.includes("word") || key.includes("idioms") || key.includes("business")
    );

    const allLessons = generateLessonNumbers();

    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className="w-full max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-6">練習するカテゴリーを選択してください</h1>

        <div className="flex flex-col gap-3 mb-8">
          {vocabCategories.map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setVocabCategory(key);
                setVocabLessonType("range");
                setVocabRangeStart("1");
                setVocabRangeEnd("5");
                setVocabIndividualLessons(["1"]);
              }}
              className={`p-4 rounded-lg font-semibold transition text-left border border-gray-200 ${
                vocabCategory === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-800 hover:shadow-sm hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold">{value}</div>
              <div className="text-sm opacity-75">({LESSON_COUNTS[key]}レッスン)</div>
            </button>
          ))}
        </div>

        {/* Lesson selection mode */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">レッスン選択方法</h2>

          <div className="flex gap-4 mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="lessonSelectType"
                value="range"
                checked={vocabLessonType === "range"}
                onChange={() => setVocabLessonType("range")}
                className="w-4 h-4 mr-2"
              />
              <span className="font-medium">範囲で選択 (例: Lesson 1～10)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="lessonSelectType"
                value="individual"
                checked={vocabLessonType === "individual"}
                onChange={() => setVocabLessonType("individual")}
                className="w-4 h-4 mr-2"
              />
              <span className="font-medium">個別に選択</span>
            </label>
          </div>

          {/* Range selection */}
          {vocabLessonType === "range" && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">開始レッスン:</label>
                <input
                  type="number"
                  min="1"
                  max={maxLessonsForCategory}
                  value={vocabRangeStart}
                  onChange={(e) => setVocabRangeStart(e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">終了レッスン:</label>
                <input
                  type="number"
                  min="1"
                  max={maxLessonsForCategory}
                  value={vocabRangeEnd}
                  onChange={(e) => setVocabRangeEnd(e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm">
                  選択中: Lesson {vocabRangeStart} ～ {vocabRangeEnd} 
                  ({Math.max(0, parseInt(vocabRangeEnd) - parseInt(vocabRangeStart) + 1)}レッスン)
                </p>
              </div>
            </div>
          )}

          {/* Individual selection */}
          {vocabLessonType === "individual" && (
            <div>
              <p className="font-semibold mb-4">個別にレッスンを選択してください</p>
              <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto border rounded-lg p-4 bg-white">
                {allLessons.map((lesson) => (
                  <label key={lesson} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vocabIndividualLessons.includes(lesson)}
                      onChange={() => handleVocabLessonToggle(lesson)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm">L{lesson}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                選択中: {vocabIndividualLessons.length}レッスン
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep("components")}
            className={btnSecondary}
          >
            ← 戻る
          </button>
          <button
            onClick={() => {
              if (vocabLessonType === "range") {
                const start = parseInt(vocabRangeStart);
                const end = parseInt(vocabRangeEnd);
                if (start < 1 || end > maxLessonsForCategory || start > end) {
                  alert(`レッスン番号は1～${maxLessonsForCategory}の範囲で、開始≤終了となるように入力してください`);
                  return;
                }
              } else if (vocabIndividualLessons.length === 0) {
                alert("少なくとも1つのレッスンを選択してください");
                return;
              }
              setStep("structure");
            }}
            className={btnPrimary}
          >
            次へ →
          </button>
        </div>
        </div>
      </main>
    );
  }

  // Lesson mode - Lesson structure preview
  if (mode === "lesson" && step === "structure") {
    const structure = generateLessonStructure();
    const testsDisplay = selectedTests.map(t => t === "Other" ? customTest : t).join(", ");
    
    let vocabDisplay = "";
    if (selectedComponents.includes("Vocab Practice")) {
      if (vocabLessonType === "range") {
        vocabDisplay = `${CATEGORIES[vocabCategory as keyof typeof CATEGORIES]} - Lesson ${vocabRangeStart} ～ ${vocabRangeEnd}`;
      } else {
        vocabDisplay = `${CATEGORIES[vocabCategory as keyof typeof CATEGORIES]} - ${vocabIndividualLessons.length}レッスン`;
      }
    }

    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
        <div className={contentClass}>
        <h1 className="text-2xl font-bold mb-6">レッスン構成を確認してください</h1>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">英語レベル:</h3>
            <p className="text-lg font-bold">{level}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">トピック:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {topicsToPass.map((topic) => (
                <span key={topic} className="bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">試験:</h3>
            <p className="text-lg font-bold">{testsDisplay}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">スキル:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map((skill) => (
                <span key={skill} className="bg-green-200 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">レッスン時間と構成</h2>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">希望時間:</h3>
            <p className="text-lg font-bold">{selectedDuration}分</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">内容構成:</h3>
            <div className="space-y-2">
              {structure.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-semibold">{item.name}</span>
                  <span className="bg-green-200 px-3 py-1 rounded-full font-bold">{item.minutes}分</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {vocabDisplay && (
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <p className="text-sm">
              <strong>単語練習:</strong> {vocabDisplay}
            </p>
          </div>
        )}

          <div className="flex justify-center gap-6">
            <button
              onClick={() => {
                if (selectedComponents.includes("Vocab Practice")) {
                  setStep("vocab-category");
                } else {
                  setStep("components");
                }
              }}
              className={btnSecondary}
            >
              ← 編集
            </button>
            <button
              onClick={() => {
                  // Start lesson: initialize state and then send the first component prompt
                  const firstComp = selectedComponents && selectedComponents.length > 0 ? selectedComponents[0] : null;
                  if (firstComp) {
                    const prompt = generateComponentContent(firstComp);
                    setChatLog([]);
                    setLessonStartTime(Date.now());
                    setTimeElapsed(0);
                    setCurrentComponent(0);
                    setStep("chatting");
                    // Send the component prompt to AI in a setTimeout to ensure state updates
                    setTimeout(() => {
                      handleLessonStart(prompt);
                    }, 50);
                  }
                }}
              className={btnStart}
            >
              レッスンを開始する
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Chat interface (both modes)
  if (step === "chatting") {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const structure = generateLessonStructure();
    const componentTiming = generateComponentTiming();
    const totalLessonTime = parseInt(selectedDuration) * 60;

    let currentComponentInfo = null;
    if (mode === "lesson" && currentComponent < componentTiming.length) {
      currentComponentInfo = componentTiming[currentComponent];
    }

    return (
      <main className={containerClass} style={{ paddingTop: '92px' }}>
         {disclaimerBanner}
        <div className={contentClass}>
          <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-2xl font-bold">{mode === "casual" ? "AIとの会話" : "AIによるレッスン"}</h1>
                <p className="text-sm text-gray-600">レベル: {level}</p>
              </div>
              {mode === "lesson" && lessonStartTime && (
                <div className="text-right bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">経過時間：{formatTime(timeElapsed)}</p>
                  <p className="text-xs text-gray-500">合計: {selectedDuration}分</p>
                </div>
              )}
            </div>

            {mode === "lesson" && selectedComponents.length > 0 && currentComponentInfo && (
              <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">現在のセッション：{selectedComponents[currentComponent]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">このセッション時間：{currentComponentInfo.durationSeconds / 60}分</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">進捗：{currentComponent + 1}/{selectedComponents.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
            {chatLog.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="mb-2">{mode === "casual" ? "AIから会話を開始するために考えています、初めに少々お待ちください" : "レッスンを開始するために考えています、初めに少々お待ちください"}</p>
                <p className="text-xs text-gray-400 mt-4">⏳ AI が応答を準備しています...</p>
              </div>
            ) : (
              chatLog.map((entry, index) => (
                <div key={index} className={`mb-3 p-3 rounded-lg ${entry.sender === "user" ? "bg-blue-100 text-right ml-12" : entry.text.startsWith("⏱️") ? "bg-yellow-100 text-left mr-12 font-semibold border-l-4 border-yellow-500" : "bg-gray-200 text-left mr-12"}`}>
                  {entry.text}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 border rounded-lg p-3"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="ここに入力..."
            />
            <button className={btnPrimary} onClick={handleSend}>送信</button>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setMode("choice");
                setStep("initial");
                setChatLog([]);
                setLessonStartTime(null);
                setTimeElapsed(0);
                setCurrentComponent(0);
              }}
              className={btnSecondary}
            >
              ← 最初に戻る
            </button>
            <button onClick={() => navigate(-1)} className={btnSecondary}>← ページを出る</button>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
