
// src/pages/AI_chat.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// --- Reusable Components ---

// ① AIが生成した文章を表示するテキストボックス
interface AITextDisplayBoxProps {
  text: string;
}

const AITextDisplayBox: React.FC<AITextDisplayBoxProps> = ({ text }) => {
  return (
    <div style={{
      maxHeight: '300px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>{text}</pre>
    </div>
  );
};

// ② リスニング音声生成・再生UI
interface AudioPlayerUIProps {
  audioUrl?: string;
  isGenerating: boolean;
}

const AudioPlayerUI: React.FC<AudioPlayerUIProps> = ({ audioUrl, isGenerating }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  if (isGenerating) {
    return (
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        リスニング音声を生成しています…
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        音声がありません
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <audio ref={audioRef} src={audioUrl} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={togglePlay}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isPlaying ? '⏸️ 一時停止' : '▶️ 再生'}
        </button>
        <div style={{ fontSize: '14px', color: '#374151' }}>
          {Math.floor(currentTime)} / {Math.floor(duration)} 秒
        </div>
      </div>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: '#e5e7eb',
          outline: 'none'
        }}
      />
    </div>
  );
};

// ③ 文章入力ボックス + 文字数カウント + Recommended Vocabularies
interface TextInputWithVocabProps {
  value: string;
  onChange: (value: string) => void;
  recommendedVocabularies: string[];
  onSubmit?: (text: string) => void;
}

const TextInputWithVocab: React.FC<TextInputWithVocabProps> = ({ value, onChange, recommendedVocabularies, onSubmit }) => {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setCharCount(value.length);
    // Count words by splitting on whitespace and filtering empty strings
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Recommended Vocabularies
        </h4>
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          padding: '8px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {recommendedVocabularies.length > 0 ? (
            <ul style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {recommendedVocabularies.map((vocab, index) => (
                <li key={index} style={{
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {vocab}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>No recommendations available</div>
          )}
        </div>
      </div>
      <div style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ここに文章を入力してください"
          style={{
            width: '100%',
            height: '120px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: '#f9fafb',
            outline: 'none',
            fontSize: '14px',
            lineHeight: '1.5',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'right'
        }}>
          文字数: {charCount} | 単語数: {wordCount}
        </div>
        {onSubmit && (
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              style={{
                background: value.trim() ? "linear-gradient(135deg, #ff914d, #ff6a00)" : '#d1d5db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: value.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📤 提出
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ④ 音声入力 → テキスト変換 → 提出
interface SpeechToTextInputProps {
  onSubmit: (text: string) => void;
  isIOS?: boolean;
}

const SpeechToTextInput: React.FC<SpeechToTextInputProps> = ({ onSubmit, isIOS = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; // Enable interim results for real-time display
      recognitionRef.current.lang = 'en-US'; // 英語に設定、必要に応じて変更

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscribedText(prev => prev + finalTranscript);
        setInterimText(interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setInterimText(''); // Clear interim when recording ends
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setInterimText('');
        setErrorMessage(`音声認識エラー: ${event.error}。ブラウザのマイク許可を確認してください。`);
      };
    }
  }, []);

  const startRecording = () => {
    if (isIOS) {
      setErrorMessage('スマホなどでは、🎤音声認識機能ボタンが使えない場合があります。キーボード操作からの音声入力機能を使用してください。');
      return;
    }
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (transcribedText.trim()) {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${API_URL}/api/speech-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcribedText }),
        });
        if (response.ok) {
          onSubmit(transcribedText);
          setTranscribedText('');
        } else {
          console.error('Failed to submit text');
        }
      } catch (error) {
        console.error('Error submitting text', error);
      }
    }
  };

  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            background: isRecording ? '#dc2626' : '#2563eb',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            alignSelf: 'flex-start'
          }}
        >
          {isRecording ? '⏹️ 停止' : '🎤 音声入力開始'}
        </button>
        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', minHeight: '60px', display: 'flex', alignItems: 'center' }}>
          <textarea
            value={transcribedText + (interimText ? ` ${interimText}` : '')}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder="変換されたテキストがここに表示されます。編集可能です。"
            style={{
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '14px',
              lineHeight: '1.5',
              resize: 'none',
              minHeight: '40px'
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!transcribedText.trim()}
          style={{
            background: transcribedText.trim() ? "linear-gradient(135deg, #ff914d, #ff6a00)" : '#d1d5db',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: transcribedText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            alignSelf: 'flex-start'
          }}
        >
          📤 提出
        </button>
      </div>
      {interimText && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#9ca3af',
          fontStyle: 'italic'
        }}>
          リアルタイム: {interimText}
        </div>
      )}
      {errorMessage && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#dc2626',
          fontWeight: 'bold'
        }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

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

const TESTS = ["特になし", "英検", "TOEFL", "TOEIC", "IELTS", "ケンブリッジ英検", "GTEC", "TEAP", "SAT", "ACT"];
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
    document.body.style.backgroundColor = "#f7e1db";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  // Styling class names (used in JSX)
  const containerClass = "app-container";
  const contentClass = "card";

  // Button class names
  const btnPrimary = "btn btn-primary";
  const btnSecondary = "btn btn-secondary";
  const btnAccent = "btn btn-accent";

  // Overall conversation state
  const [mode, setMode] = useState<ConversationMode>("choice");
  const [step, setStep] = useState<ConversationStep>("initial");

  // Common settings
  const [level, setLevel] = useState("");
  const [levelConfirmed, setLevelConfirmed] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
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

  // Server warmup state
  const [serverWarmed, setServerWarmed] = useState(false);
  const [serverWarming, setServerWarming] = useState(false);

  // Voice / audio playback state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [loadingVoiceIndex, setLoadingVoiceIndex] = useState<number | null>(null);

  // Chat state
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);

  // Speech recognition state for chat input
  const [isRecordingChat, setIsRecordingChat] = useState(false);
  const [interimChatText, setInterimChatText] = useState("");
  const [chatErrorMessage, setChatErrorMessage] = useState("");
  const chatRecognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition for chat
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      chatRecognitionRef.current = new SpeechRecognition();
      chatRecognitionRef.current.continuous = false;
      chatRecognitionRef.current.interimResults = true;
      chatRecognitionRef.current.lang = 'en-US';

      chatRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setUserInput(prev => prev + finalTranscript);
        setInterimChatText(interimTranscript);
      };

      chatRecognitionRef.current.onend = () => {
        setIsRecordingChat(false);
        setInterimChatText('');
      };

      chatRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setIsRecordingChat(false);
        setInterimChatText('');
        setChatErrorMessage(`音声認識エラー: ${event.error}。ブラウザのマイク許可を確認してください。`);
      };
    }
  }, []);

  // New states for the reusable components
  const [aiText, setAiText] = useState("これはAIが生成したサンプルテキストです。長い文章をここに表示して、スクロールできるかどうかをテストします。");
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [userText, setUserText] = useState("");
  const [recommendedVocabs, setRecommendedVocabs] = useState(["vocabulary1", "vocabulary2", "vocabulary3"]);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Function to generate audio for AI text
  const generateAudio = async () => {
    setIsGeneratingAudio(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/api/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText, voice: selectedVoice }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Function to handle text input submission
  const handleTextSubmit = (text: string) => {
    console.log("Submitted text:", text);
    // Here you can send to backend or process
  };

  // Function to handle speech text submission
  const handleSpeechSubmit = (text: string) => {
    console.log("Submitted speech text:", text);
    // Here you can send to backend or process
  };

  // Functions for chat speech recognition
  const startChatRecording = () => {
    if (isIOS) {
      setChatErrorMessage('スマホなどでは、🎤音声認識機能ボタンが使えない場合があります。キーボード操作からの音声入力機能を使用してください。');
      return;
    }
    if (chatRecognitionRef.current && !isRecordingChat) {
      setIsRecordingChat(true);
      chatRecognitionRef.current.start();
    }
  };

  const stopChatRecording = () => {
    if (chatRecognitionRef.current && isRecordingChat) {
      chatRecognitionRef.current.stop();
    }
  };

  // ページマウント時にRenderのバックエンドサーバーをウォームアップ
  useEffect(() => {
    // only warm once per page mount
    let mounted = true;
    const warmUp = async () => {
      const API_URL = process.env.REACT_APP_API_URL;
      setServerWarming(true);
      try {
        await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "__warmup__", mode: "warmup" }),
        });
        if (!mounted) return;
        setServerWarmed(true);
      } catch (err) {
        console.error("Warmup failed", err);
      } finally {
        if (mounted) setServerWarming(false);
      }
    };

    warmUp();
    return () => {
      mounted = false;
    };
  }, []);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if iOS
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
  }, []);

  // Timer effect for lessons
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
            const nextComponent = structure[nextIndex];
            const movePrompt = `次は「${nextComponent.name}」に移ってください。`;
            setChatLog((prev) => {
              if (prev.some((e) => e.text === `⏱️ ${movePrompt}`)) return prev;
              return [...prev, { sender: "llm", text: `⏱️ ${movePrompt}` }];
            });
            setTimeout(() => {
              (async () => {
                const p = await getComponentPrompt(nextComponent.name);
                handleLessonStart(p);
              })();
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

  // Load prompts from public/prompts/*.json with simple templating fallback
  const [promptsCache, setPromptsCache] = useState<Record<string, string>>({});

  const PROMPTS_BASE = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/prompts` : '/prompts';

  const generateComponentContentFallback = (componentName: string) => {
    // keep the previous hardcoded prompts as a fallback if fetch fails
    switch (componentName) {
      case "単語練習":
        return (
          `You are an English teacher conducting a vocabulary lesson. ` +
          `Start by saying a brief greeting (e.g., "Hi! Let's start with vocabulary practice."). ` +
          `Then, introduce 5 vocabulary words related to the student's interests (${selectedTopics.join(", ")}). ` +
          `For each word, provide the word, its meaning/definition, and an example sentence. ` +
          `After presenting all 5 words, ask the student one comprehension question to test their understanding ` +
          `(e.g., ask them to use one of the words in a sentence, or ask what a specific word means). ` +
          `Keep the tone friendly and encouraging. The student's level is ${level}.`
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

  const getPromptFilename = (componentName: string) => {
    switch (componentName) {
      case "単語練習":
        return 'vocab_practice.json';
      case "文章読解":
        return 'reading_comprehension.json';
      case "会話練習":
        return 'conversation_practice.json';
      case "文法練習":
        return 'grammar_practice.json';
      default:
        return null;
    }
  };

  const fillTemplate = (template: string) => {
    const topics = selectedTopics.concat(customTopic ? [customTopic] : []).join(', ');
    return template.replace(/{{\s*topics\s*}}/g, topics || 'general topics').replace(/{{\s*level\s*}}/g, level || 'appropriate level');
  };

  const getComponentPrompt = async (componentName: string) => {
    // return cached if available
    if (promptsCache[componentName]) return promptsCache[componentName];

    const filename = getPromptFilename(componentName);
    if (!filename) {
      const fallback = generateComponentContentFallback(componentName);
      setPromptsCache((s) => ({ ...s, [componentName]: fallback }));
      return fallback;
    }

    try {
      const res = await fetch(`${PROMPTS_BASE}/${filename}`);
      if (!res.ok) throw new Error('prompt fetch failed');
      const json = await res.json();
      const template = typeof json.prompt === 'string' ? json.prompt : JSON.stringify(json);
      const filled = fillTemplate(template);
      setPromptsCache((s) => ({ ...s, [componentName]: filled }));
      return filled;
    } catch (e) {
      // fallback
      const fallback = generateComponentContentFallback(componentName);
      setPromptsCache((s) => ({ ...s, [componentName]: fallback }));
      return fallback;
    }
  };

  // Experimental: EIKEN Grade 1 speaking practice helpers
  const getTestPath = () => {
    // Temporarily disabled to continue conversation/lesson normally
    return null;
    /*
    const test = selectedTests.find(t => ['英検', 'TOEIC', 'IELTS', 'TOEFL'].includes(t));
    if (!test) return null;
    const skill = selectedSkills.find(s => ['リスニング', 'スピーキング', 'リーディング', 'ライティング'].includes(s));
    if (!skill) return null;
    let grade = '';
    if (test === '英検') {
      if (level === 'C1' || level === 'C2') grade = '1';
      else if (level === 'B2') grade = 'pre1';
      else if (level === 'B1') grade = 'pre2';
      else if (level === 'A2') grade = '3';
      else return null;
    }
    const skillPath = skill === 'リスニング' ? 'listening' : skill === 'スピーキング' ? 'speaking' : skill === 'リーディング' ? 'reading' : 'writing';
    if (test === '英検') {
      return `/${grade}_${skillPath}`;
    } else {
      const testLower = test.toLowerCase();
      return `/${testLower}_${skillPath}`;
    }
    */
  };

  const isTestEligible = () => {
    return getTestPath() !== null;
  };

  // Removed: startEikenSession, stopEikenSession, eikenStep, eikenSubmitResponse

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

  // Fetch voice audio from backend and play it with real-time streaming
  const fetchAndPlayVoice = async (text: string, idx?: number) => {
    if (!text) return;
    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    try {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
        audioRef.current = null;
      }
      if (typeof idx === "number") setLoadingVoiceIndex(idx);

      const res = await fetch(`${API_URL}/api/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: selectedVoice }),
      });

      if (!res.ok) {
        console.error("Voice request failed", res.statusText);
        setLoadingVoiceIndex(null);
        return;
      }

      // Use MediaSource for real-time streaming
      const mediaSource = new MediaSource();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mediaSource);
      audioRef.current = audio;

      let sourceBuffer: SourceBuffer | null = null;
      let queue: ArrayBuffer[] = [];

      mediaSource.addEventListener('sourceopen', () => {
        sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');

        sourceBuffer.addEventListener('updateend', () => {
          if (queue.length > 0 && !sourceBuffer!.updating) {
            sourceBuffer!.appendBuffer(queue.shift()!);
          }
        });

        // Start reading the stream
        const reader = res.body?.getReader();
        if (reader) {
          const readStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  if (sourceBuffer && !sourceBuffer.updating) {
                    mediaSource.endOfStream();
                  }
                  break;
                }

                if (sourceBuffer!.updating) {
                  queue.push(value.buffer);
                } else {
                  sourceBuffer!.appendBuffer(value.buffer);
                }
              }
            } catch (error) {
              console.error('Stream reading error', error);
            }
          };
          readStream();
        }
      });

      audio.addEventListener('canplay', () => {
        audio.play().catch((e) => console.error("Audio play failed", e));
      });

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audio.src);
        if (typeof idx === "number") setLoadingVoiceIndex(null);
        audioRef.current = null;
      });

      audio.addEventListener('error', (e) => {
        console.error("Audio error", e);
        if (typeof idx === "number") setLoadingVoiceIndex(null);
      });

    } catch (error) {
      console.error(error);
      if (typeof idx === "number") setLoadingVoiceIndex(null);
    }
  };

  // Helper to start a lesson by sending the first component prompt to the AI
  const handleLessonStart = async (prompt: string) => {
    if (!prompt.trim()) return;

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
        {/* Page styles are embedded here for single-file portability */}
        <style>{`
          :root{
            --bg: #d8f3dc;
            --card-bg: #fff;
            --muted: #666;
            --accent-a: #3b82f6; /* blue-500 */
            --accent-b: #6366f1; /* indigo-500 */
            --accent-c: #10b981; /* green-500 */
            --radius: 16px;
            --container-max: 900px;
          }
          *{box-sizing:border-box}
          .disclaimer{
            position:fixed;
            top:0;
            left:0;
            right:0;
            background: #fff7c2;
            border-bottom: 1px solid #f5d36b;
            color:#6b4a00;
            padding:10px 16px;
            text-align:center;
            z-index:60;
            font-size:14px;
          }
          @media (max-width: 480px) {
            .disclaimer {
              padding: 6px 12px;   /* ← 高さが小さくなる */
              font-size: 13px;     /*（オプション）文字も少し小さく */
            }
          }
          .app-container{
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding: 110px 20px 60px; /* leave space for disclaimer */
            background: transparent;
          }
          .card{
            width:100%;
            max-width:var(--container-max);
            background:var(--card-bg);
            border-radius:var(--radius);
            box-shadow: 0 18px 40px rgba(2,6,23,0.08);
            padding:32px;
            text-align:center;
          }
          h1{margin:0 0 8px 0;font-size:28px}
          p.lead{color:var(--muted);margin:0 0 18px 0}

          .options{
            display:grid;
            grid-template-columns:1fr;
            gap:18px;
            margin:26px 0;
          }
          @media(min-width:720px){
            .options{grid-template-columns:1fr 1fr}
          }

          .btn{
            border:none;
            padding:0;
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            border-radius:14px;
            font-weight:700;
            transition: transform .18s ease, box-shadow .18s ease;
          }
          .btn:active{transform:translateY(1px)}
          .btn-primary{
            height:80px;
            background: linear-gradient(90deg,var(--accent-a),var(--accent-b));
            color:white;
            box-shadow: 0 12px 30px rgba(99,102,241,0.18);
            font-size:18px;
          }
          .btn-secondary{
            height:80px;
            background: linear-gradient(90deg,#10b981,#059669);
            color:white;
            box-shadow: 0 12px 30px rgba(16,185,129,0.14);
            font-size:18px;
          }
          .btn:hover{transform:translateY(-6px)}
          .back-row{display:flex;justify-content:center;margin-top:8px}
          .btn-accent{
            padding:10px 18px;
            background:white;
            border:1px solid #e5e7eb;
            color:#374151;
            border-radius:12px;
            box-shadow: 0 6px 18px rgba(2,6,23,0.04);
            font-weight:600;
          }

        `}</style>

     
        <main className={containerClass}>
          <div className={`${contentClass} chat-layout`}>
            <div style={{ marginBottom: 30 }}>
              <h1>AIとしたいことは何ですか？</h1>
              <p className="lead">今日のあなたの目的を選んでください</p>
            </div>

            <div className="options">
              <button
                onClick={() => {
                  setMode("casual");
                  setLevel("");
                  setLevelConfirmed(false);
                  setStep("level");
                  setChatLog([]);
                  setSelectedTopics([]);
                  setCustomTopic("");
                }}
                className={btnPrimary}
                aria-label="楽しく会話したい"
              >
                楽しく会話したい
              </button>

              <button
                onClick={() => {
                  setMode("lesson");
                  setLevel("");
                  setLevelConfirmed(false);
                  setStep("level");
                  setChatLog([]);
                  setSelectedTopics([]);
                  setCustomTopic("");
                  setSelectedSkills([]);
                  setSelectedComponents([]);
                }}
                className={btnSecondary}
                aria-label="英語レッスンを受けたい"
              >
                英語レッスンを受けたい
              </button>
            </div>
            <p style={{ marginTop: 6 }}>
              ⚠️ 本機能は現在まだ開発実験段階であるため、機能が不安定な場合があります。
              <br/>会話の内容は保存されず、プライバシーは保護されます。
            </p>
          </div>
        </main>
      </>
    );
  }

  // Level selection 
  if (step === "level") {
    return (
      <>
        <style>{`
          .app-container{padding:110px 20px 60px}
          .card{padding:28px}
          .levels{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:18px 0}
          @media(min-width:720px){.levels{grid-template-columns:repeat(6,1fr)}}
          .level-btn, .option-btn, .dur-btn, .cat-btn{padding:18px;border-radius:12px;border:1px solid #e6e9ef;background:white;cursor:pointer;transition:transform .14s ease, box-shadow .14s ease;display:flex;flex-direction:column;align-items:center}
          .level-btn.active, .option-btn.active{background:linear-gradient(180deg,#4f46e5,#4338ca);color:white;box-shadow:0 12px 30px rgba(67,56,202,0.18);transform:scale(1.03)}
          .actions-row{display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap}
          .next-btn{padding:12px 20px;border-radius:12px;background:#efefef;border:none;cursor:pointer}
          .selected-display{margin-bottom:12px}
          .selected-display .label{color:#374151}
          .selected-display .items{font-weight:800;color:#3730a3}
        `}</style>


        <main className={containerClass}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22, marginBottom: 6 }}>英語レベルの設定</h1>
            <p className="lead">あなたの現在の英語レベルを選んでください</p>

            <div className="selected-display">
              <span className="label">選択中： </span>
              <span className="items">{level || "未選択"}</span>
            </div>

            <div className="levels">
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setLevel(lvl);
                    setLevelConfirmed(true);
                  }}
                  className={`level-btn ${level === lvl ? "active" : ""}`}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{lvl}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
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

            <div className="actions-row">
              <button
                onClick={() => setMode("choice")}
                className="btn-accent"
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
                className={levelConfirmed ? btnPrimary : "btn-accent"}
                style={levelConfirmed ? undefined : { opacity: 0.8 }}
              >
                次へ →
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Topic selection (updated to use option buttons + selected summary)
  if (step === "topic") {
    return (
      <>
        <style>{`
          .form-list{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
          .option-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:18px 0}
          @media(min-width:720px){.option-grid{grid-template-columns:repeat(4,1fr)}}
          .option-btn{padding:12px;border-radius:10px;border:1px solid #e6e9ef;background:white;cursor:pointer;display:flex;align-items:center;gap:8px;justify-content:center}
          .option-btn.active{background:linear-gradient(180deg,#4f46e5,#4338ca);color:white;box-shadow:0 12px 30px rgba(67,56,202,0.12);transform:scale(1.02)}
          .input-text{width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef}
          .actions-row{display:flex;gap:12px;justify-content:center;margin-top:8px}
          .selected-line{margin-bottom:12px}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>興味の設定</h1>
            <p className="lead">興味のあるトピックを選択してください。（＊複数選択可能です）</p>

            <div className="selected-line">
              <span style={{ color: "#374151" }}>選択中： </span>
              <span style={{ fontWeight: 800, color: "#3730a3" }}>
                {selectedTopics.length > 0 ? selectedTopics.join('・') : '未選択'}
              </span>
            </div>

            <div className="option-grid">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`option-btn ${selectedTopics.includes(topic) ? 'active' : ''}`}
                  aria-pressed={selectedTopics.includes(topic)}
                >
                  <span style={{ fontWeight: 600 }}>{topic}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>その他のトピック (自由記入):</label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="カスタムトピックを入力..."
                className="input-text"
              />
            </div>

            <div className="actions-row">
              <button onClick={() => { setLevel(""); setLevelConfirmed(false); setStep("level"); }} className="btn-accent">← 戻る</button>
              <button onClick={() => {
                if (selectedTopics.length === 0 && !customTopic) {
                  alert("少なくとも1つのトピックを選択してください");
                  return;
                }
                if (mode === "casual") {
                  setStep("confirm");
                } else {
                  setStep("test");
                }
              }} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Casual helper unchanged (kept here for context)
  const handleCasualStart = async () => {
    const casualPrompt = `You are a friendly English conversation partner. Start the conversation with a warm greeting and ask the user a simple, open-ended question to get them talking. For example, you could ask "How are you today?" or "What have you been up to?" based on their interests (${selectedTopics.join(", ")}). Keep the tone natural, friendly, and encouraging. The user is at level ${level}.`;

    setChatLog([]);
    setStep("chatting");

    // Send the casual start prompt to AI
    setTimeout(() => {
      handleLessonStart(casualPrompt);
    }, 50);
  };

  // Casual confirm (unchanged)
  if (mode === "casual" && step === "confirm") {
    return (
      <>
        <style>{`
          .summary{max-width:720px;margin:0 auto}
          .summary-box{background:#eef2ff;padding:14px;border-radius:10px;margin-bottom:12px}
          .summary-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
          .tag{background:#dbeafe;padding:6px 10px;border-radius:999px;font-size:13px}
          .controls{display:flex;gap:10px;justify-content:center}
                    .modern-orange-btn {
            background: linear-gradient(135deg, #ff9a3c, #ff6a00);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
          }

          .modern-orange-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 107, 0, 0.45);
            opacity: 0.95;
          }

          .modern-orange-btn:active {
            transform: translateY(0);
            box-shadow: 0 3px 8px rgba(255, 107, 0, 0.35);
            opacity: 0.9;
          }
        `}</style>

        <main style={{ paddingTop: 92 }} className="app-container">
          <div className="card summary">
            <h1 style={{ fontSize: 22 }}>設定の確認</h1>

            <div className="summary-box">
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>英語レベル:</h3>
                <p style={{ margin: "6px 0 0", fontSize: 18 }}>{level}</p>
              </div>
              <div style={{ marginTop: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>トピック:</h3>
                <div className="summary-tags">
                  {topicsToPass.map((topic) => (
                    <div key={topic} className="tag">{topic}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="controls">
              <button onClick={() => setStep("topic")} className="btn-accent">← 編集</button>
              <button onClick={handleCasualStart} className="modern-orange-btn">会話を開始する</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Test selection (updated to option buttons + selected summary)
  if (mode === "lesson" && step === "test") {
    return (
      <>
        <style>{`
          .list-col{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
          .option-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:18px 0}
          @media(min-width:720px){.option-grid{grid-template-columns:repeat(3,1fr)}}
          .option-btn{padding:12px;border-radius:10px;border:1px solid #eef2f6;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center}
          .option-btn.active{background:linear-gradient(180deg,#4f46e5,#4338ca);color:white;box-shadow:0 12px 30px rgba(67,56,202,0.12)}
          .small-input{width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef}
          .controls{display:flex;gap:10px;justify-content:center}
          .selected-line{margin-bottom:12px}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>英語試験への対策の設定</h1>
            <p className="lead">受験予定の英語試験を選択してください （＊複数選択可能です）</p>

            <div className="selected-line">
              <span style={{ color: "#374151" }}>選択中： </span>
              <span style={{ fontWeight: 800, color: "#3730a3" }}>
                {selectedTests.length > 0 ? selectedTests.join('・') : '未選択'}
              </span>
            </div>

            <div className="option-grid">
              {TESTS.map((test) => (
                <button
                  key={test}
                  onClick={() => handleTestToggle(test)}
                  className={`option-btn ${selectedTests.includes(test) ? 'active' : ''}`}
                  aria-pressed={selectedTests.includes(test)}
                >
                  <span style={{ fontWeight: 600 }}>{test}</span>
                </button>
              ))}
            </div>

            {selectedTests.includes("Other") && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>その他の試験名:</label>
                <input
                  type="text"
                  value={customTest}
                  onChange={(e) => setCustomTest(e.target.value)}
                  placeholder="試験名を入力..."
                  className="small-input"
                />
              </div>
            )}

            <div className="controls">
              <button onClick={() => setStep("topic")} className="btn-accent">← 戻る</button>
              <button onClick={() => {
                if (selectedTests.length === 0) {
                  alert("少なくとも1つの試験を選択してください");
                  return;
                }
                setStep("skills");
              }} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Skills selection (updated to option buttons + summary)
  if (mode === "lesson" && step === "skills") {
    return (
      <>
        <style>{`
          .list-col{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
          .option-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:18px 0}
          @media(min-width:720px){.option-grid{grid-template-columns:repeat(3,1fr)}}
          .option-btn{padding:12px;border-radius:10px;border:1px solid #eef2f6;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center}
          .option-btn.active{background:linear-gradient(180deg,#4f46e5,#4338ca);color:white;box-shadow:0 12px 30px rgba(67,56,202,0.12)}
          .controls{display:flex;gap:10px;justify-content:center}
          .selected-line{margin-bottom:12px}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>伸ばしたいスキルを選択してください</h1>

            <div className="selected-line">
              <span style={{ color: "#374151" }}>選択中： </span>
              <span style={{ fontWeight: 800, color: "#3730a3" }}>
                {selectedSkills.length > 0 ? selectedSkills.join('・') : '未選択'}
              </span>
            </div>

            <div className="option-grid">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`option-btn ${selectedSkills.includes(skill) ? 'active' : ''}`}
                  aria-pressed={selectedSkills.includes(skill)}
                >
                  <span style={{ fontWeight: 600 }}>{skill}</span>
                </button>
              ))}
            </div>

            <div className="controls">
              <button onClick={() => setStep("test")} className="btn-accent">← 戻る</button>
              <button onClick={() => {
                if (selectedSkills.length === 0) {
                  alert("少なくとも1つのスキルを選択してください");
                  return;
                }
                setStep("duration");
              }} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Duration selection (kept similar, but updated selected display style)
  if (mode === "lesson" && step === "duration") {
    return (
      <>
        <style>{`
          .dur-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
          @media(min-width:720px){.dur-grid{grid-template-columns:repeat(6,1fr)}}
          .dur-btn{padding:16px;border-radius:10px;border:1px solid #e6e9ef;background:#f3f4f6;cursor:pointer}
          .dur-btn.active{background:#059669;color:white;box-shadow:0 10px 28px rgba(5,150,105,0.12);transform:scale(1.03)}
          .summary-box{background:#eff6ff;padding:12px;border-radius:10px;margin-bottom:12px;text-align:center}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>レッスンの希望時間を選択してください</h1>
            <p className="lead">レッスンに費やしたい時間を選んでください</p>

            <div className="selected-display">
              <span className="label">選択中： </span>
          
              <span className="items" style={{ fontWeight: 800, color: "#3730a3" }}>
                {selectedDuration ? `${selectedDuration}分` : "未選択"}
                <br/>
              </span>
            </div>

            <div className="dur-grid">
              {[5, 10, 15, 20, 25, 30].map((min) => (
                <button
                  key={min}
                  onClick={() => setSelectedDuration(min.toString())}
                  className={`dur-btn ${selectedDuration === min.toString() ? "active" : ""}`}
                >
                  <div style={{ fontSize: 18 }}>{min}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>分</div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setStep("skills")} className="btn-accent">← 戻る</button>
              <button onClick={() => setStep("components")} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Components selection (updated to option buttons + selected summary)
  if (mode === "lesson" && step === "components") {
    return (
      <>
        <style>{`
          .list-col{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
          .option-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:18px 0}
          @media(min-width:720px){.option-grid{grid-template-columns:repeat(3,1fr)}}
          .option-btn{padding:12px;border-radius:10px;border:1px solid #eef2f6;background:white;cursor:pointer;display:flex;align-items:center;justify-content:center}
          .option-btn.active{background:linear-gradient(180deg,#4f46e5,#4338ca);color:white;box-shadow:0 12px 30px rgba(67,56,202,0.12)}
          .controls{display:flex;gap:10px;justify-content:center}
          .selected-line{margin-bottom:12px}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>レッスンに含める内容を選択してください</h1>

            <div className="selected-line">
              <span style={{ color: "#374151" }}>選択中： </span>
              <span style={{ fontWeight: 800, color: "#3730a3" }}>
                {selectedComponents.length > 0 ? selectedComponents.join('・') : '未選択'}
              </span>
            </div>

            <div className="option-grid">
              {COMPONENTS.map((component) => (
                <button
                  key={component}
                  onClick={() => handleComponentToggle(component)}
                  className={`option-btn ${selectedComponents.includes(component) ? 'active' : ''}`}
                  aria-pressed={selectedComponents.includes(component)}
                >
                  <span style={{ fontWeight: 600 }}>{component}</span>
                </button>
              ))}
            </div>

            <div className="controls">
              <button onClick={() => setStep("duration")} className="btn-accent">← 戻る</button>
              <button onClick={() => {
                if (selectedComponents.length === 0) {
                  alert("少なくとも1つのコンポーネントを選択してください");
                  return;
                }
                if (selectedComponents.includes("Vocab Practice")) {
                  setStep("vocab-category");
                } else {
                  setStep("structure");
                }
              }} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Vocab category section kept mostly the same (cat-btn already fits the style)
  if (mode === "lesson" && step === "vocab-category") {
    const vocabCategories = Object.entries(CATEGORIES).filter(([key]) =>
      key.includes("word") || key.includes("idioms") || key.includes("business")
    );

    const allLessons = generateLessonNumbers();

    return (
      <>
        <style>{`
          .vocab-wrap{max-width:960px;margin:0 auto}
          .cat-list{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}
          .cat-btn{padding:12px;border-radius:10px;border:1px solid #e6e9ef;text-align:left;background:white;cursor:pointer}
          .cat-btn.active{background:#2563eb;color:white;box-shadow:0 10px 28px rgba(37,99,235,0.12)}
          .small-box{background:#f8fafc;padding:12px;border-radius:10px}
          .grid-lessons{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-height:320px;overflow:auto;padding:8px;background:white;border-radius:8px;border:1px solid #eef2f6}
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={`${contentClass} vocab-wrap`}>
            <h1 style={{ fontSize: 22 }}>練習するカテゴリーを選択してください</h1>

            <div className="cat-list">
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
                  className={`cat-btn ${vocabCategory === key ? "active" : ""}`}
                >
                  <div style={{ fontWeight: 700 }}>{value}</div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>({LESSON_COUNTS[key]}レッスン)</div>
                </button>
              ))}
            </div>

            <div className="small-box" style={{ marginBottom: 12 }}>
              <h2 style={{ margin: "0 0 8px 0" }}>レッスン選択方法</h2>

              <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" checked={vocabLessonType === "range"} onChange={() => setVocabLessonType("range")} />
                  <span style={{ fontWeight: 600 }}>範囲で選択 (例: Lesson 1～10)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" checked={vocabLessonType === "individual"} onChange={() => setVocabLessonType("individual")} />
                  <span style={{ fontWeight: 600 }}>個別に選択</span>
                </label>
              </div>

              {vocabLessonType === "range" && (
                <div style={{ display: "grid", gap: 8 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>開始レッスン:</label>
                    <input type="number" min={1} max={maxLessonsForCategory} value={vocabRangeStart} onChange={(e) => setVocabRangeStart(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e6e9ef" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>終了レッスン:</label>
                    <input type="number" min={1} max={maxLessonsForCategory} value={vocabRangeEnd} onChange={(e) => setVocabRangeEnd(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e6e9ef" }} />
                  </div>
                  <div style={{ background: "#e6f0ff", padding: 10, borderRadius: 8 }}>
                    <p style={{ margin: 0 }}>選択中: Lesson {vocabRangeStart} ～ {vocabRangeEnd} ({Math.max(0, parseInt(vocabRangeEnd) - parseInt(vocabRangeStart) + 1)}レッスン)</p>
                  </div>
                </div>
              )}

              {vocabLessonType === "individual" && (
                <div>
                  <p style={{ fontWeight: 700 }}>個別にレッスンを選択してください</p>
                  <div className="grid-lessons" style={{ marginBottom: 8 }}>
                    {allLessons.map((lesson) => (
                      <label key={lesson} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="checkbox" checked={vocabIndividualLessons.includes(lesson)} onChange={() => handleVocabLessonToggle(lesson)} />
                        <span style={{ fontSize: 13 }}>L{lesson}</span>
                      </label>
                    ))}
                  </div>
                  <p style={{ color: "#6b7280" }}>選択中: {vocabIndividualLessons.length}レッスン</p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={() => setStep("components")} className="btn-accent">← 戻る</button>
              <button onClick={() => {
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
              }} className={btnPrimary}>次へ →</button>
            </div>
          </div>
        </main>
      </>
    );
  }



  // Lesson mode - Lesson structure preview
  if (mode === "lesson" && step === "structure") {
    const structure = generateLessonStructure();
    // Keep testsDisplay as an array so we can map it like topicsToPass/selectedSkills
    const testsDisplay = selectedTests.length > 0 ? selectedTests.map(t => t === "Other" ? customTest : t) : [];

    let vocabDisplay = "";
    if (selectedComponents.includes("Vocab Practice")) {
      if (vocabLessonType === "range") {
        vocabDisplay = `${CATEGORIES[vocabCategory as keyof typeof CATEGORIES]} - Lesson ${vocabRangeStart} ～ ${vocabRangeEnd}`;
      } else {
        vocabDisplay = `${CATEGORIES[vocabCategory as keyof typeof CATEGORIES]} - ${vocabIndividualLessons.length}レッスン`;
      }
    }

    return (
      <>
        <style>{`
          .summary-grid{display:block;gap:12px}
          @media(min-width:920px){
            .summary-grid{display:flex;align-items:stretch;gap:12px}
            .summary-block, .green-block{flex:1;margin-bottom:0;display:flex;flex-direction:column}
            .summary-block{margin-right:12px}
          }
          .summary-block{background:#eff6ff;padding:12px;border-radius:10px;margin-bottom:12px;display:flex;flex-direction:column}
          .green-block{background:#ecfdf5;padding:12px;border-radius:10px;margin-bottom:12px;display:flex;flex-direction:column}
          .struct-item{display:flex;justify-content:space-between;align-items:center;padding:10px;background:white;border-radius:8px;border:1px solid #eef2f6}
          .controls{display:flex;gap:12px;justify-content:center}
                    .modern-orange-btn {
            background: linear-gradient(135deg, #ff9a3c, #ff6a00);
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
          }

          .modern-orange-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 107, 0, 0.45);
            opacity: 0.95;
          }

          .modern-orange-btn:active {
            transform: translateY(0);
            box-shadow: 0 3px 8px rgba(255, 107, 0, 0.35);
            opacity: 0.9;
          }
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }}>
          <div className={contentClass}>
            <h1 style={{ fontSize: 22 }}>レッスンの設定を確認してください</h1>

            <div className="summary-grid">
              <div className="summary-block">
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>英語レベル:</h3>
                <p style={{ margin: "6px 0 0", fontSize: 18 }}>{level}</p>
              </div>

              <div style={{ marginTop: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>トピック:</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {topicsToPass.map((topic) => (
                    <div key={topic} style={{ background: "#dbeafe", padding: "6px 10px", borderRadius: 999 }}>{topic}</div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>試験:</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {testsDisplay.map((test) => (
                    <div key={test} style={{ background: "#dbeafe", padding: "6px 10px", borderRadius: 999 }}>{test}</div>
                  ))}
                </div>
                
              </div>

              <div style={{ marginTop: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>スキル:</h3>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {selectedSkills.map((skill) => (
                    <div key={skill} style={{ background: "#dbeafe", padding: "6px 10px", borderRadius: 999 }}>{skill}</div>
                  ))}
                </div>
              </div>
              </div>

              <div className="green-block">
              <h2 style={{ margin: "0 0 8px 0" }}>レッスン時間と構成</h2>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>希望時間:</h3>
                <p style={{ margin: "6px 0 0", fontSize: 18 }}>{selectedDuration}分</p>
              </div>

              <div>
                <h3 style={{ margin: 0, fontWeight: 800 }}>内容構成:</h3>
                <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                  {structure.map((item, idx) => (
                    <div key={idx} className="struct-item">
                      <span style={{ fontWeight: 700 }}>{item.name}</span>
                      <span style={{ background: "#bbf7d0", padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>{item.minutes}分</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {vocabDisplay && (
              <div style={{ background: "#f3e8ff", padding: 12, borderRadius: 10, marginBottom: 12 }}>
                <p style={{ margin: 0 }}><strong>単語練習:</strong> {vocabDisplay}</p>
              </div>
            )}

            <div className="controls">
              <button onClick={() => {
                if (selectedComponents.includes("Vocab Practice")) {
                  setStep("vocab-category");
                } else {
                  setStep("components");
                }
              }} className="btn-accent">← 編集</button>

              <button onClick={() => {
                const firstComp = selectedComponents && selectedComponents.length > 0 ? selectedComponents[0] : null;
                if (firstComp) {
                  // If test practice conditions are met, jump to specific test page
                  const testPath = getTestPath();
                  if (testPath) {
                    navigate(testPath);
                  } else {
                    setChatLog([]);
                    setLessonStartTime(Date.now());
                    setTimeElapsed(0);
                    setCurrentComponent(0);
                    setStep("chatting");
                    setTimeout(() => {
                      (async () => {
                        const prompt = await getComponentPrompt(firstComp);
                        handleLessonStart(prompt);
                      })();
                    }, 50);
                  }
                }
              }} className="modern-orange-btn"  style={{ padding: "14px 22px", borderRadius: 14 }}>レッスンを開始する</button>
            </div>
          </div>
        </main>
      </>
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
      <>
        <Header isAIChatPage={true} mode={mode} level={level} onNavigateHome={() => navigate("/home")} />
        <style>{`
          .chat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;gap:12px}
          /* Keep the chat header and controls pinned to the top of the viewport */
          .chat-top{position:static;z-index:90;background:transparent;padding:4px 0}
          .chat-meta{background:#eef2ff;padding:10px;border-radius:8px;text-align:right}
          .current-session{background:linear-gradient(90deg,#f3e8ff,#eef2ff);padding:10px;border-radius:10px;margin-bottom:12px;border-left:4px solid #a78bfa}
          /* Make the content area a column flex container so chat-window can grow and input stays at bottom */
          .chat-layout{display:flex;flex-direction:column;height:calc(100vh - 24px);min-height:400px;padding-bottom:8px; margin-top: 0;padding-top: 0;}
          .chat-window{background:#f8fafc;border-radius:10px;padding:12px;flex:1;min-height:0;overflow:auto;margin-bottom:8px;border:1px solid #eef2f6;padding-bottom:88px}
          .msg-user{background:#dbeafe;padding:10px;border-radius:10px;margin-left:36px;text-align:right}
          .msg-llm{background:#e5e7eb;padding:10px;border-radius:10px;margin-right:36px;text-align:left}
          .msg-timer{background:#fff7cc;padding:10px;border-left:4px solid #f59e0b;border-radius:8px;margin-right:36px;font-weight:700}
          .chat-controls{display:flex;gap:8px}
          .input-text{flex:1;padding:10px;border-radius:10px;border:1px solid #e6e9ef}
          .chat-input-row{display:flex;gap:8px;margin-top:6px}
          /* Fix the input row to the bottom of the viewport so it stays visible while messages scroll */
          .chat-input-row.fixed-bottom{
            position:fixed;
            left:50%;
            transform:translateX(-50%);
            bottom:12px;
            width:calc(100% - 48px);
            max-width:900px;
            z-index:110;
            background:transparent;
            padding:6px 0;
            box-sizing:border-box;
          }
          @media (max-width:640px){
            .chat-input-row.fixed-bottom{width:calc(100% - 24px);bottom:10px}
          }
          .chat-actions{display:flex;gap:8px;justify-content:center;margin-top:10px}
          /* Removed: eiken-panel and eiken-controls CSS */
          .warning-text { font-size: 15px; }
          @media (max-width: 768px) { .warning-text { font-size: 11px; } }
        `}</style>

        <main className={containerClass} style={{ paddingTop: '92px' }} >
          <div className={contentClass}>
           
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}

            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}
            {/* 現在のセッション情報（横並び3列） */}

              {/* 現在のセッション情報（横並び3列） */}
              {mode === "lesson" && selectedComponents.length > 0 && currentComponentInfo && (
                <div
                  className="current-session"
                  style={{
                    marginTop: 12,
                    position: "sticky",
                    top: 92,               
                    zIndex: 50,
                    background: "#f3e8ff",
                    padding: "12px 20px",  
                    borderRadius: 12,      
                    marginLeft: "auto",    
                    marginRight: "auto",  
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)" 
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 12,
                      alignItems: "center"
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                        <strong>現在のセッション：</strong>
                        <span style={{ marginLeft: 6, color: "#6b7280" }}>
                          {selectedComponents[currentComponent]}
                        </span>
                      </p>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                        <strong>このセッション時間：</strong>
                        <span style={{ marginLeft: 6, color: "#6b7280" }}>
                          {Math.ceil((currentComponentInfo.durationSeconds || 0) / 60)}分
                        </span>
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                        <strong>進歩：</strong>
                        <span style={{ marginLeft: 6, color: "#6b7280" }}>
                          {currentComponent + 1}/{selectedComponents.length}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Removed: Eiken panel */}

            {/* New reusable components for demonstration */}
            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                ① AI Text Display Box
              </h3>
              <AITextDisplayBox text={aiText} />
              <button
                onClick={() => setAiText(aiText + " 追加のテキストをここに追加します。")}
                style={{
                  marginTop: '12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                テキスト追加
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                ② Audio Player UI
              </h3>
              <button
                onClick={generateAudio}
                style={{
                  marginBottom: '12px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔊 音声生成
              </button>
              <AudioPlayerUI audioUrl={audioUrl} isGenerating={isGeneratingAudio} />
            </div>

            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                ③ Text Input with Vocab
              </h3>
              <TextInputWithVocab value={userText} onChange={setUserText} recommendedVocabularies={recommendedVocabs} onSubmit={handleTextSubmit} />
            </div>

            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                ④ Speech to Text Input
              </h3>
              <SpeechToTextInput onSubmit={handleSpeechSubmit} isIOS={isIOS} />
            </div>

            <div className="chat-window" role="log" aria-live="polite">
              {chatLog.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", paddingTop: 40 }}>
                  <p style={{ marginBottom: 8 }}>{mode === "casual" ? "AIから会話を開始するために考えています、初めに少々お待ちください" : "レッスンを開始するために考えています、初めに少々お待ちください"}</p>
                  <p style={{ fontSize: 12, color: "#c7d2fe" }}>⏳ AI が応答を準備しています...</p>
                </div>
              ) : (
                chatLog.map((entry, index) => (
                  <div key={index} style={{ marginBottom: 10 }}>
                    {entry.sender === "user" ? (
                      <div className="msg-user">{entry.text}</div>
                    ) : entry.text.startsWith("⏱️") ? (
                      <div className="msg-timer">{entry.text}</div>
                    ) : (
                      <div className="msg-llm">
                        <div style={{ whiteSpace: "pre-wrap" }}>{entry.text}</div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                          <button onClick={() => fetchAndPlayVoice(entry.text, index)} style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }}>
                            {loadingVoiceIndex === index ? "読み込み中..." : "🔊 再生"}
                          </button>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>声を選択:</div>
                          <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} style={{ padding: "6px 8px", borderRadius: 6 }}>
                            <option value="alloy">音声１</option>
                            <option value="verse">音声２</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="chat-input-row fixed-bottom" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={isRecordingChat ? stopChatRecording : startChatRecording}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: isRecordingChat ? "#dc2626" : "#2563eb",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  flexShrink: 0,
                  height: "40px",
                  boxSizing: "border-box"
                }}
                title={isRecordingChat ? "音声入力を停止" : "音声入力開始"}
              >
                {isRecordingChat ? (isMobile ? "⏹️" : "⏹️音声入力を停止") : (isMobile ? "🎤" : "🎤音声入力")}
              </button>
              <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                <textarea
                  value={userInput + (interimChatText ? ` ${interimChatText}` : '')}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="ここに入力..."
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "2px solid #000",
                    outline: "none",
                    resize: "none",
                    minHeight: "40px",
                    maxHeight: "120px",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    boxSizing: "border-box"
                  }}
                  rows={1}
                />
                {interimChatText && (
                  <div style={{
                    position: "absolute",
                    bottom: "-20px",
                    left: "12px",
                    fontSize: "12px",
                    color: "#9ca3af",
                    fontStyle: "italic"
                  }}>
                    リアルタイム: {interimChatText}
                  </div>
                )}
              </div>
              <button
                onClick={handleSend}
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff914d, #ff6a00)",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "15px",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  flexShrink: 0,
                  height: "40px",
                  boxSizing: "border-box"
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                送信
              </button>
            </div>

            {chatErrorMessage && (
              <div style={{
                color: '#dc2626',
                marginTop: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {chatErrorMessage}
              </div>
            )}

        </main>
      </>
    );
  }

  return null;
}

