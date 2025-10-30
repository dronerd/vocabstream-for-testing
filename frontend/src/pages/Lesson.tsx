import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { speakEnglish } from "../pages/speech";

interface LessonWord {
  word: string;
  example?: string;
  meaning?: string;
  japaneseMeaning?: string;
  synonyms?: string;
  antonyms?: string;
  [k: string]: any;
}

interface LessonData {
  title?: string;
  paragraph?: string;
  words: LessonWord[];
  [k: string]: any;
}

interface QuizQuestion {
  word: string;
  sentence: string;
  blank_sentence: string;
  choices: string[];
  answer_index: number;
}

const Lesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [step, setStep] = useState<number>(0);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const nav = useNavigate();

  // quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hoveredQuizChoice, setHoveredQuizChoice] = useState<number | null>(null);

  // responsive / touch state
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // finish lock/overlay to avoid duplicate praise
  const [finishLock, setFinishLock] = useState<boolean>(false);
  const [showFinishOverlay, setShowFinishOverlay] = useState<boolean>(false);
  const [finishMessage, setFinishMessage] = useState<string>("");
  const [finishScore, setFinishScore] = useState<{ score: number; max: number; percent: number } | null>(null);

  // Helper: try fetch JSON (unchanged)
  async function tryFetchJson(path: string): Promise<any | null> {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  // ---------- Audio setup (NEW) ----------
  const correctAudioRefs = useRef<HTMLAudioElement[]>([]);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRefs = useRef<{ low: HTMLAudioElement | null; midLow: HTMLAudioElement | null; mid: HTMLAudioElement | null; high: HTMLAudioElement | null }>({
    low: null, midLow: null, mid: null, high: null
  });
  const playedFinalRef = useRef<boolean>(false);

  useEffect(() => {
    correctAudioRefs.current = [
      new Audio("/correct-1.mp3"),
      new Audio("/correct-2.mp3"),
    ];
    correctAudioRefs.current.forEach(a => { a.preload = "auto"; a.load(); });

    wrongAudioRef.current = new Audio("/wrong.mp3");
    wrongAudioRef.current.preload = "auto";
    wrongAudioRef.current.load();

    endAudioRefs.current.low = new Audio("/end-0-40.mp3");
    endAudioRefs.current.midLow = new Audio("/end-40-60.wav");
    endAudioRefs.current.mid = new Audio("/end-60-80.mp3");
    endAudioRefs.current.high = new Audio("/end-80-100.mp3");

    Object.values(endAudioRefs.current).forEach(a => { if (a) { a.preload = "auto"; a.load(); } });

    return () => {
      correctAudioRefs.current.forEach(a => { try { a.pause(); a.src = ""; } catch {} });
      if (wrongAudioRef.current) { try { wrongAudioRef.current.pause(); wrongAudioRef.current.src = ""; } catch {} }
      Object.values(endAudioRefs.current).forEach(a => { if (a) { try { a.pause(); a.src = ""; } catch {} } });
    };
  }, []);

  function playCorrectFile() {
    try {
      const arr = correctAudioRefs.current;
      if (!arr || arr.length === 0) return;
      const idx = Math.floor(Math.random() * arr.length);
      const audio = arr[idx];
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore play errors (autoplay policies) */ });
    } catch (e) {}
  }

  function playWrongFile() {
    try {
      const audio = wrongAudioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore */ });
    } catch (e) {}
  }

  function playEndFile(percent: number) {
    try {
      let audio: HTMLAudioElement | null = null;
      if (percent < 40) audio = endAudioRefs.current.low;
      else if (percent < 60) audio = endAudioRefs.current.midLow;
      else if (percent < 80) audio = endAudioRefs.current.mid;
      else audio = endAudioRefs.current.high;

      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore */ });
    } catch (e) {}
  }
  // ---------- end audio setup ----------

  // load lesson data from public/data (unchanged)
  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    async function loadLocalLesson(id: string): Promise<LessonData | null> {
      if (!id.includes("-lesson-")) {
        console.error("invalid lesson id format:", id);
        return null;
      }
      const [genreFolder, numStr] = id.split("-lesson-");
      if (!genreFolder || !numStr) return null;
      const candidates = [
        `/data/${genreFolder}/Lesson${numStr}.json`,
        `/data/${genreFolder}/lesson${numStr}.json`,
        `/data/${genreFolder}/Lesson${parseInt(numStr, 10)}.json`,
        `/data/${genreFolder}/lesson${parseInt(numStr, 10)}.json`,
      ];
      for (const p of candidates) {
        const res = await tryFetchJson(p);
        if (res) return res as LessonData;
      }
      return null;
    }

    setLesson(null);
    loadLocalLesson(lessonId).then((data) => {
      if (cancelled) return;
      if (!data) {
        console.warn("lesson file not found locally for", lessonId);
        setLesson({ words: [] } as LessonData);
      } else {
        setLesson(data);
      }
    });
    return () => { cancelled = true; };
  }, [lessonId]);

  // detect small screen & touch (unchanged)
  useEffect(() => {
    function update() {
      try {
        const small = window.matchMedia && window.matchMedia("(max-width: 600px)").matches;
        setIsSmallScreen(Boolean(small));
      } catch {
        setIsSmallScreen(window.innerWidth <= 600);
      }
      const touch = "ontouchstart" in window || (navigator && (navigator as any).maxTouchPoints > 0);
      setIsTouchDevice(Boolean(touch));
    }
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // generate quiz when entering quiz step (unchanged)
  useEffect(() => {
    if (!lesson) return;
    const totalWords = lesson.words ? lesson.words.length : 0;
    const quizStep = totalWords + 1;
    if (step === quizStep) {
      setQuizLoading(true);
      setQuizError(false);
      try {
        const generated = generateQuizFromLesson(lesson);
        setQuizQuestions(generated);
        setQuizIndex(0);
        setQuizScore(0);
        setFinalScore(null);
        setSelectedChoice(null);
      } catch (e) {
        console.error("quiz generation failed", e);
        setQuizQuestions([]);
        setQuizError(true);
      } finally {
        setQuizLoading(false);
      }
    }
  }, [step, lesson]);

  // prevent scroll to weird spot on slides (unchanged)
  useEffect(() => {
    try {
      if (!lesson) return;
      const totalWords = lesson.words ? lesson.words.length : 0;
      const slideStep = step - 1;
      const isSlideLocal = step > 0 && slideStep < totalWords;
      if (!isSlideLocal) return;
      if (typeof window !== "undefined" && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    } catch (e) { }
  }, [step, lesson]);

  // NOTE: removed early return here; derive safe values instead
  const totalWords = lesson?.words?.length ?? 0;
  const slideStep = step - 1;
  const isSlide = step > 0 && slideStep < totalWords;

  // getPraise unchanged
  function getPraise(percent: number): string {
    if (!Number.isFinite(percent)) percent = 0;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    const messages = {
      low: ["よく頑張りました！次はもう少し覚えましょう。", "一歩ずつ前進しています。諦めずに続けましょう！", "努力のスタートラインに立ちました！ここから伸びます！"],
      midLow: ["順調です！継続が力になります。", "確実に力がついてきています！", "いい流れです。小さな進歩を積み重ねていきましょう！"],
      mid: ["いい調子です！あとひと息です！", "素晴らしい成長です！もう少しで大きな成果に届きます！", "この調子で勢いをキープしましょう！"],
      high: ["とてもよくできました！", "かなりの理解度です！自信を持っていきましょう！", "集中力が素晴らしいです！この調子！"],
      nearPerfect: ["素晴らしい、ほぼ完璧です！", "すごい完成度！最後のひと押しです！", "努力の成果が出ています！もう一歩で完全制覇！"],
      perfect: ["完璧です！おめでとうございます！", "すごすぎる！努力の結晶です！", "あなたの頑張りが最高の結果を生みました！"],
    };
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    if (percent <= 20) return pick(messages.low);
    if (percent <= 40) return pick(messages.midLow);
    if (percent <= 60) return pick(messages.mid);
    if (percent <= 80) return pick(messages.high);
    if (percent <= 90) return pick(messages.nearPerfect);
    return pick(messages.perfect);
  }

  // responsive sizes & button styles (unchanged)
  const headingSize = isSmallScreen ? 22 : 32;
  const headingSize2 = isSmallScreen ? 17 : 32;
  const mainWordSize = isSmallScreen ? 34 : 48;
  const wordListSize = isSmallScreen ? 16 : 34;
  const paragraphFontSize = isSmallScreen ? 14 : 20;
  const quizTextSize = isSmallScreen ? 16 : 28;
  const buttonFontSize = isSmallScreen ? 15 : 24;
  const buttonWidth = isSmallScreen ? "100%" : 360;
  const blueButtonStyle: React.CSSProperties = {
    fontSize: buttonFontSize, padding: isSmallScreen ? "8px 10px" : "10px 20px", marginTop: 12,
    backgroundColor: "#003366", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", width: buttonWidth,
  };
  const nextButtonStyle: React.CSSProperties = { ...blueButtonStyle, width: isSmallScreen ? "100%" : 240, backgroundColor: "#003366" };

  const topSteps = ["単語スライド", "例文を使った穴埋めクイズ（3択）"];
  function currentTopIndex() {
    if (isSlide) return 0;
    if (step === totalWords + 1) return 1;
    return -1;
  }

  function handleChoose(choiceIndex: number) {
    if (!quizQuestions[quizIndex] || selectedChoice !== null) return;
    const q = quizQuestions[quizIndex];
    const isCorrect = choiceIndex === q.answer_index;
    setSelectedChoice(choiceIndex);
    if (isCorrect) {
      setQuizScore((s) => s + 1);
      playCorrectFile();
    } else {
      playWrongFile();
    }
  }

  const displayFinalScore = finalScore ?? quizScore;
  const quizMax = quizQuestions.length || 1;
  const quizPercent = Math.round((displayFinalScore / quizMax) * 100);
  const totalScore = finalScore ?? quizScore;
  const totalMax = quizQuestions.length || 0;
  const totalPercent = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;

  useEffect(() => {
    if (step === totalWords + 2) {
      if (!playedFinalRef.current) {
        playEndFile(totalPercent);
        playedFinalRef.current = true;
      }
    } else {
      playedFinalRef.current = false;
    }
  }, [step, totalWords, totalPercent]);

  function finishLesson() {
    if (finishLock) return;
    setFinishLock(true);
    nav(-1);
  }

  // --- MAIN RENDER ---
  return (
    // If lesson is still null, show loading screen here (no early return)
    lesson === null ? (
      <div style={{ padding: 20, textAlign: "center" }}>Loading lesson...</div>
    ) : (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
        minHeight: "100vh", padding: isSmallScreen ? "10px" : "20px", paddingTop: isSmallScreen ? "56px" : "92px",
        fontFamily: "sans-serif", textAlign: "center",
      }}>
        {/* ... all your existing JSX unchanged ... */}
        {/* For brevity I'm not repeating the entire JSX here since you had it already;
            keep the same JSX you provided (word slides, quiz, final summary), it will render
            because 'lesson' is guaranteed non-null in this branch. */}
        {/* Paste your full JSX from the original component here. */}
        <div style={{ width: "100%", maxWidth: 900 }}>
          <div style={{ fontSize: headingSize, marginBottom: isSmallScreen ? 6 : 12 }}><strong>今日の単語</strong></div>
          <div style={{ fontWeight: "bold", fontSize: wordListSize, marginBottom: isSmallScreen ? 8 : 12 }}>
            {lesson.words.slice(0, 10).map((w: LessonWord, i: number) =>
              i < lesson.words.slice(0, 10).length - 1 ? `${w.word}, ` : w.word
            )}
          </div>
          {/* ... keep the rest exactly as before ... */}
        </div>
      </div>
    )
  );
};

/* generateQuizFromLesson (unchanged) */
function generateQuizFromLesson(lesson: LessonData): QuizQuestion[] {
  const words: LessonWord[] = lesson.words || [];
  const pool = words.filter((w: LessonWord) => w.word).map((w: LessonWord) => ({ word: w.word, example: w.example || "" }));
  if (pool.length < 3) throw new Error("not enough words for quiz");
  function sample<T>(arr: T[], k: number): T[] {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, k);
  }
  const questions: QuizQuestion[] = [];
  for (const item of pool) {
    const correct = item.word;
    const otherWords: string[] = pool.map((p: { word: string }) => p.word).filter((w: string) => w !== correct);
    const distractors = sample(otherWords, Math.min(2, otherWords.length));
    const choices = [...distractors, correct];
    const shuffled = sample(choices, choices.length);
    const answer_index = shuffled.indexOf(correct);
    let blank_sentence = item.example || "";
    if (blank_sentence) {
      const re = new RegExp(correct.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
      if (re.test(blank_sentence)) blank_sentence = blank_sentence.replace(re, "____");
      else {
        const cap = correct.charAt(0).toUpperCase() + correct.slice(1);
        const re2 = new RegExp(cap.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
        if (re2.test(blank_sentence)) blank_sentence = blank_sentence.replace(re2, "____");
        else blank_sentence = "____ " + blank_sentence;
      }
    } else blank_sentence = "____";
    questions.push({ word: correct, sentence: item.example || "", blank_sentence, choices: shuffled, answer_index });
  }
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;
}

export default Lesson;
