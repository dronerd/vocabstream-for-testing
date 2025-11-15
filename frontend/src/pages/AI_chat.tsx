import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type ChatEntry = {
  sender: "user" | "llm";
  text: string;
};

type ConversationMode = "choice" | "casual" | "lesson" | "conversation" | "lesson-chat";
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

// Category and lesson count definitions
const CATEGORIES = {
  "word-intermediate": "単語初級~中級 (CEFR A2~B1)",
  "word-high-intermediate": "単語中上級 (CEFR B2)",
  "word-advanced": "単語上級 (CEFR C1)",
  "word-proficiency": "単語熟達 (CEFR C2)",
  "idioms-intermediate": "熟語初級~中級 (CEFR A2~B1)",
  "idioms-high-intermediate": "熟語中上級 (CEFR B2)",
  "idioms-advanced": "熟語上級 (CEFR C1)",
  "idioms-proficiency": "熟語熟達 (CEFR C2)",
  "business-entry": "ビジネス入門レベル",
  "business-intermediate": "ビジネス実践レベル",
  "business-global": "ビジネスグローバルレベル",
  "computer-science": "Computer Science & Technology",
  "medicine": "Medicine & Health",
  "economics-business": "Business & Economics",
  "environment": "Environmental Science & Sustainability",
  "law": "Law & Politics",
  "engineering": "Engineering",
  "politics": "Politics",
} as const;

const LESSON_COUNTS: Record<string, number> = {
  "word-intermediate": 64,
  "word-high-intermediate": 96,
  "word-advanced": 100,
  "word-proficiency": 100,
  "idioms-intermediate": 50,
  "idioms-high-intermediate": 50,
  "idioms-advanced": 50,
  "idioms-proficiency": 50,
  "business-entry": 71,
  "business-intermediate": 71,
  "business-global": 71,
  "computer-science": 71,
  "medicine": 71,
  "economics-business": 71,
  "environment": 71,
  "law": 71,
  "politics": 71,
  "engineering": 71,
};

const TOPICS = [
  "Computer Science & Technology",
  "Medicine & Health",
  "Business & Economics",
  "Environmental Science & Sustainability",
  "Law & Politics",
  "Engineering",
];

const TESTS = ["Eiken", "TOEFL", "TOEIC", "IELTS", "Cambridge", "Other"];
const SKILLS = ["Reading", "Listening", "Writing", "Speaking"];
const COMPONENTS = [
  "Vocab Practice",
  "Reading Comprehension",
  "Speaking Practice",
  "Pronunciation Practice",
  "Grammar",
];

export default function AI_chat() {
  const navigate = useNavigate();

  // Overall conversation state
  const [mode, setMode] = useState<ConversationMode>("choice");
  const [step, setStep] = useState<ConversationStep>("initial");

  // Common settings
  const [level, setLevel] = useState("A1");
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
            setCurrentComponent(i + 1);
            // Auto-send prompt to move to next component
            const nextComponent = structure[i + 1];
            const movePrompt = `次は「${nextComponent.name}」に移ってください。`;
            setChatLog((prev) => [
              ...prev,
              { sender: "llm", text: `⏱️ ${movePrompt}` },
            ]);
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
    setUserInput("");

    // Determine API URL with fallback to local development server
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
    
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
              message: userInput,
              level,
              topics: topicsToPass,
              mode: "casual",
            }
          : {
              message: userInput,
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
      const llmResponse: ChatEntry = { sender: "llm", text: data.reply || "No response" };
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
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AIと何をしたいですか？</h1>
          <p className="text-gray-600">あなたの英語学習の目的を選んでください</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => {
              setMode("casual");
              setStep("level");
              setChatLog([]);
              setSelectedTopics(["Computer Science & Technology"]);
              setCustomTopic("");
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 px-4 rounded-lg shadow-lg transition transform hover:scale-105 h-24 flex items-center justify-center"
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
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-4 rounded-lg shadow-lg transition transform hover:scale-105 h-24 flex items-center justify-center"
          >
            英語レッスンを受けたい
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            ← 戻る
          </button>
        </div>
      </main>
    );
  }

  // Setup steps - Level selection
  if (step === "level") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-2">英語レベルを選択してください</h1>
        <p className="text-gray-600 mb-8">あなたの現在の英語レベルを選んでください</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setStep("topic");
              }}
              className={`py-6 px-6 rounded-lg font-bold transition duration-200 transform hover:scale-105 ${
                level === lvl
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMode("choice")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            ← 戻る
          </button>
        </div>
      </main>
    );
  }

  // Topic selection
  if (step === "topic") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-2">興味のあるトピックを選択してください</h1>
        <p className="text-gray-600 mb-6">複数選択可能です</p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {TOPICS.map((topic) => (
            <label key={topic} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
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
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep("level")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            次へ →
          </button>
        </div>
      </main>
    );
  }

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
            onClick={() => {
              setChatLog([]);
              setStep("chatting");
            }}
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
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-6">受験予定の英語試験を選択してください</h1>
        <p className="text-sm text-gray-600 mb-6">複数選択可能です</p>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {TESTS.map((test) => (
            <label key={test} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
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
              className="w-full border rounded-lg p-3"
            />
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setStep("topic")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            次へ →
          </button>
        </div>
      </main>
    );
  }

  // Lesson mode - Skills selection
  if (mode === "lesson" && step === "skills") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-6">伸ばしたいスキルを選択してください</h1>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            次へ →
          </button>
        </div>
      </main>
    );
  }

  // Lesson mode - Duration selection
  if (mode === "lesson" && step === "duration") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            ← 戻る
          </button>
          <button
            onClick={() => setStep("components")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            次へ →
          </button>
        </div>
      </main>
    );
  }

  // Lesson mode - Components selection
  if (mode === "lesson" && step === "components") {
    return (
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-6">レッスンに含める内容を選択してください</h1>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {COMPONENTS.map((component) => (
            <label key={component} className="flex items-center p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            次へ →
          </button>
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
      <main className="p-6 max-w-4xl mx-auto" style={{ paddingTop: "92px" }}>
        <h1 className="text-2xl font-bold mb-6">練習するカテゴリーを選択してください</h1>

        <div className="grid grid-cols-1 gap-3 mb-8">
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
              className={`p-4 rounded-lg font-semibold transition text-left ${
                vocabCategory === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            次へ →
          </button>
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
      <main className="p-6 max-w-2xl mx-auto" style={{ paddingTop: "92px" }}>
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

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              if (selectedComponents.includes("Vocab Practice")) {
                setStep("vocab-category");
              } else {
                setStep("components");
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            ← 編集
          </button>
          <button
            onClick={() => {
              setChatLog([]);
              setLessonStartTime(Date.now());
              setTimeElapsed(0);
              setCurrentComponent(0);
              setStep("chatting");
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg"
          >
            レッスンを開始する
          </button>
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
    let totalLessonTime = parseInt(selectedDuration) * 60;

    // Current component timing info
    let currentComponentInfo = null;
    if (mode === "lesson" && currentComponent < componentTiming.length) {
      currentComponentInfo = componentTiming[currentComponent];
    }

    return (
      <main className="p-6 max-w-3xl mx-auto" style={{ paddingTop: "92px" }}>
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-bold">
                {mode === "casual" ? "AI会話" : "AIレッスン"}
              </h1>
              <p className="text-sm text-gray-600">レベル: {level}</p>
            </div>
            {mode === "lesson" && lessonStartTime && (
              <div className="text-right bg-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">経過時間</p>
                <p className="text-3xl font-bold text-blue-600">{formatTime(timeElapsed)}</p>
                <p className="text-xs text-gray-500">合計: {selectedDuration}分</p>
              </div>
            )}
          </div>
          
          {mode === "lesson" && selectedComponents.length > 0 && currentComponentInfo && (
            <div className="mt-3 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">現在のセッション</p>
                  <p className="text-lg font-bold text-purple-600">{selectedComponents[currentComponent]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">このセッション時間</p>
                  <p className="text-lg font-bold text-blue-600">{currentComponentInfo.durationSeconds / 60}分</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">進捗</p>
                  <p className="text-lg font-bold text-green-600">{currentComponent + 1}/{selectedComponents.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Component schedule */}
        {mode === "lesson" && componentTiming.length > 0 && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
            <p className="font-semibold mb-2">📅 レッスンスケジュール:</p>
            <div className="flex flex-wrap gap-2">
              {componentTiming.map((timing, idx) => (
                <div 
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentComponent === idx
                      ? "bg-purple-500 text-white"
                      : currentComponent > idx
                      ? "bg-green-400 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {timing.component.substring(0, 3)}: {Math.floor(timing.durationSeconds / 60)}m
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat display */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
          {chatLog.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {mode === "casual"
                ? "会話を開始してください"
                : "レッスンを開始してください"}
            </div>
          )}
          {chatLog.map((entry, index) => (
            <div
              key={index}
              className={`mb-3 p-3 rounded-lg ${
                entry.sender === "user"
                  ? "bg-blue-100 text-right ml-12"
                  : entry.text.startsWith("⏱️")
                  ? "bg-yellow-100 text-left mr-12 font-semibold border-l-4 border-yellow-500"
                  : "bg-gray-200 text-left mr-12"
              }`}
            >
              {entry.text}
            </div>
          ))}
        </div>

        {/* User input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 border rounded-lg p-3"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="ここに入力..."
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg transition"
            onClick={handleSend}
          >
            送信
          </button>
        </div>

        {/* Back button */}
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
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            ← 最初に戻る
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            ← ページを出る
          </button>
        </div>
      </main>
    );
  }

  return null;
}
