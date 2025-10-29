import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

// -----------------------------
// Updated Lesson.tsx
// - Adds start-screen choices (紺色ボタンで単語スライド開始 / 例文穴埋めへ直接進む)
// - Top breadcrumb showing where you are: 単語スライド → 単語スライド → 例文穴埋め
//   current step is bold & black
// - Word slides include: 音読してみましょう + a speech synthesis "play" button
// - Quiz title changed to: 例文を使った穴埋めクイズ！（3択） and choices are shown clearly
// - On correct answer: particle/falling-flower/confetti animation (varied)
// - Final praise has multiple variations and triggers an effect depending on score
// -----------------------------

const Lesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [step, setStep] = useState<number>(0);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const nav = useNavigate();

  //IMPORTANT
  const ENABLE_PARAGRAPH_FILL = false;

  // --- quiz state ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hoveredQuizChoice, setHoveredQuizChoice] = useState<number | null>(null);

  // particle celebration state
  const [particles, setParticles] = useState<any[]>([]);
  const [particleSeed, setParticleSeed] = useState<number>(0);

  // --- paragraph (drag & drop) state ---
  const [placedChoices, setPlacedChoices] = useState<(number | null)[]>([]);
  const [slotCorrectWord, setSlotCorrectWord] = useState<string[]>([]);
  const [slotSuffixes, setSlotSuffixes] = useState<string[]>([]);
  const [renderParts, setRenderParts] = useState<(string | { slotIndex: number })[]>([]);
  const [graded, setGraded] = useState<boolean>(false);
  const [slotResults, setSlotResults] = useState<("idle" | "correct" | "wrong" | "revealed")[]>([]);
  const [showRevealButton, setShowRevealButton] = useState<boolean>(false);
  const [paragraphScore, setParagraphScore] = useState<number | null>(null);

  // --- responsive / touch state ---
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [activeChoice, setActiveChoice] = useState<number | null>(null); // for mobile tap-to-place

  // Helper: try fetch JSON and return parsed object or null
  async function tryFetchJson(path: string): Promise<any | null> {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  // --- load lesson metadata / words from public/data/ ---
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

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // detect small screen & touch
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

  // --- generate quiz locally when user moves to quiz step ---
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

  // Build paragraph slots when lesson loaded and when entering paragraph step
  const choiceWords = useMemo<string[]>(() => {
    if (!lesson) return [];
    return lesson.words.slice(0, 10).map((w: LessonWord) => w.word);
  }, [lesson]);

  useEffect(() => {
    const totalWords = lesson ? lesson.words.length : 0;
    const paragraphStep = totalWords + 3; // unchanged
    if (!lesson) return;
    if (step === paragraphStep) {
      const paragraphRaw: string =
        lesson.paragraph || lesson.words.map((w: LessonWord) => w.example || w.word).join(" ");

      let processed = paragraphRaw;
      const tokens: string[] = [];
      const slotWords: string[] = [];
      const detectedSuffixes: string[] = [];
      let slotIndexCounter = 0;
      const SUFFIX_PATTERN = "(?:'(?:s|re|ve|ll)|s|es|ed|ing|en|ly)?";

      choiceWords.forEach((cw: string) => {
        if (!cw) return;
        const escaped = cw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
        const re = new RegExp("\\b(" + escaped + ")(" + SUFFIX_PATTERN + ")\\b", "iu");

        processed = processed.replace(re, (match: string, p1: string, p2: string) => {
          tokens.push(`[[SLOT_${slotIndexCounter}]]`);
          slotWords.push(cw);
          detectedSuffixes.push(p2 || "");
          const token = `[[SLOT_${slotIndexCounter}]]`;
          slotIndexCounter++;
          return token;
        });
      });

      if (tokens.length === 0) {
        processed = `[[SLOT_0]] [[SLOT_1]] [[SLOT_2]] ` + processed;
        slotWords.push(...choiceWords.slice(0, 3));
        detectedSuffixes.push("", "", "");
        tokens.push("[[SLOT_0]]", "[[SLOT_1]]", "[[SLOT_2]]");
        slotIndexCounter = slotWords.length;
      }

      const parts: (string | { slotIndex: number })[] = [];
      const tokenRe = /\[\[SLOT_(\d+)\]\]/g;
      let lastIndex = 0;
      let m: RegExpExecArray | null;

      while ((m = tokenRe.exec(processed)) !== null) {
        const idx = m.index;
        if (idx > lastIndex) parts.push(processed.substring(lastIndex, idx));
        const slotIndex = Number(m[1]);
        parts.push({ slotIndex });
        lastIndex = idx + m[0].length;
      }
      if (lastIndex < processed.length) parts.push(processed.substring(lastIndex));

      setRenderParts(parts);
      setSlotCorrectWord(slotWords);
      setSlotSuffixes(detectedSuffixes);
      setPlacedChoices(Array(slotWords.length).fill(null));
      setSlotResults(Array(slotWords.length).fill("idle"));
      setGraded(false);
      setShowRevealButton(false);
      setParagraphScore(null);
      setActiveChoice(null);
    }
  }, [step, lesson, choiceWords]);

  // --- PREVENT: place this BEFORE the `if (!lesson) return ...` early-return ---
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
    } catch (e) {
      // ignore
    }
  }, [step, lesson]);

  if (!lesson) return <div>Loading lesson...</div>;

  const totalWords = lesson.words.length;
  const slideStep = step - 1;
  const isSlide = step > 0 && slideStep < totalWords;

  // Helper: praise based on percent (safe, pure function)
  function getPraise(percent: number): string {
    if (!Number.isFinite(percent)) percent = 0;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    const messages = {
      low: [
        "よく頑張りました！次はもう少し覚えましょう。",
        "一歩ずつ前進しています。諦めずに続けましょう！",
        "努力のスタートラインに立ちました！ここから伸びます！",
      ],
      midLow: [
        "順調です！継続が力になります。",
        "確実に力がついてきています！",
        "いい流れです。小さな進歩を積み重ねていきましょう！",
      ],
      mid: [
        "いい調子です！あとひと息です！",
        "素晴らしい成長です！もう少しで大きな成果に届きます！",
        "この調子で勢いをキープしましょう！",
      ],
      high: [
        "とてもよくできました！",
        "かなりの理解度です！自信を持っていきましょう！",
        "集中力が素晴らしいです！この調子！",
      ],
      nearPerfect: [
        "素晴らしい、ほぼ完璧です！",
        "すごい完成度！最後のひと押しです！",
        "努力の成果が出ています！もう一歩で完全制覇！",
      ],
      perfect: [
        "完璧です！おめでとうございます！",
        "すごすぎる！努力の結晶です！",
        "あなたの頑張りが最高の結果を生みました！",
      ],
    };

    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    if (percent < 20) return pick(messages.low);
    if (percent < 40) return pick(messages.midLow);
    if (percent < 60) return pick(messages.mid);
    if (percent < 80) return pick(messages.high);
    if (percent < 90) return pick(messages.nearPerfect);
    return pick(messages.perfect);
  }

  // responsive sizes
  const headingSize = isSmallScreen ? 20 : 32;
  const mainWordSize = isSmallScreen ? 28 : 48;
  const wordListSize = isSmallScreen ? 20 : 40;
  const paragraphFontSize = isSmallScreen ? 14 : 20;
  const quizTextSize = isSmallScreen ? 16 : 28;
  const buttonFontSize = isSmallScreen ? 16 : 24;
  const buttonWidth = isSmallScreen ? "100%" : 360;

  const blueButtonStyle: React.CSSProperties = {
    fontSize: buttonFontSize,
    padding: isSmallScreen ? "8px 12px" : "10px 20px",
    marginTop: 16,
    backgroundColor: "#003366",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    width: buttonWidth,
  };

  const nextButtonStyle: React.CSSProperties = {
    ...blueButtonStyle,
    width: isSmallScreen ? "100%" : 240,
    backgroundColor: "#003366",
  };

  // Breadcrumb steps (three main steps)
  const topSteps = ["単語スライド", "単語スライド", "例文を使った穴埋めクイズ！（3択）"];
  function currentTopIndex() {
    if (step === 0) return 0;
    if (isSlide) return 1;
    if (step === totalWords + 1) return 2;
    // default: map paragraph/result to last two
    return 2;
  }

  function handleChoose(choiceIndex: number) {
    if (!quizQuestions[quizIndex] || selectedChoice !== null) return;
    const q = quizQuestions[quizIndex];
    const isCorrect = choiceIndex === q.answer_index;
    setSelectedChoice(choiceIndex);
    if (isCorrect) setQuizScore((s) => s + 1);

    // celebrate on correct
    if (isCorrect) {
      triggerParticles("flower");
    } else {
      // small shake effect could be implemented; for now no particles
    }
  }

  // particle helpers (simple DOM-particles implemented with react state & CSS)
  function triggerParticles(type: "flower" | "confetti" | "burst" = "confetti", count = 20) {
    const seed = particleSeed + 1;
    setParticleSeed(seed);
    const arr = Array.from({ length: count }).map((_, i) => {
      const id = `${seed}-${i}`;
      return {
        id,
        left: Math.random() * 80 + 10 + "%",
        size: Math.random() * 18 + 12,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.4,
        type,
        color:
          type === "flower"
            ? ["#ff8da1", "#ffd27f", "#9fe3b8", "#a8d2ff"][Math.floor(Math.random() * 4)]
            : ["#ff7a7a", "#ffd166", "#8bd3ff", "#b39ddb", "#9be7a9"][Math.floor(Math.random() * 5)],
      };
    });
    setParticles(arr);
    // clear after animation
    setTimeout(() => setParticles([]), 2400);
  }

  // Drag/drop handlers (desktop)
  function handleDragStart(e: React.DragEvent, choiceIndex: number) {
    e.dataTransfer.setData("text/plain", String(choiceIndex));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, slotIndex: number) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const choiceIndex = Number(data);
    if (Number.isNaN(choiceIndex)) return;

    placeChoiceToSlot(choiceIndex, slotIndex);
  }

  function placeChoiceToSlot(choiceIndex: number, slotIndex: number) {
    setPlacedChoices((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (next[i] === choiceIndex) next[i] = null;
      }
      next[slotIndex] = choiceIndex;
      return next;
    });
    setSlotResults((prev) => {
      const next = [...prev];
      next[slotIndex] = "idle";
      return next;
    });
    setActiveChoice(null);
  }

  function removeFromSlot(slotIndex: number) {
    setPlacedChoices((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setSlotResults((prev) => {
      const next = [...prev];
      next[slotIndex] = "idle";
      return next;
    });
    setActiveChoice(null);
  }

  function handleGrade() {
    const results: ("idle" | "correct" | "wrong")[] = slotCorrectWord.map((correctWord: string, idx: number) => {
      const placed = placedChoices[idx];
      if (placed === null || placed === undefined) return "wrong";
      return choiceWords[placed] === correctWord ? "correct" : "wrong";
    });
    setSlotResults(results.map((r) => (r === "correct" ? "correct" : "wrong")));
    setGraded(true);
    const anyWrong = results.some((r) => r !== "correct");
    setShowRevealButton(anyWrong);
    const correctCount = results.filter((r) => r === "correct").length;
    setParagraphScore(correctCount);
    if (correctCount > 0) triggerParticles(correctCount === results.length ? "flower" : "confetti", 30);
  }

  function handleRevealAnswers() {
    const placedForSlots = slotCorrectWord.map((w: string) => {
      const idx = choiceWords.findIndex((cw) => cw === w);
      return idx >= 0 ? idx : null;
    });

    setPlacedChoices(() => {
      const next = Array(slotCorrectWord.length).fill(null as number | null);
      for (let i = 0; i < placedForSlots.length; i++) {
        next[i] = placedForSlots[i];
      }
      return next;
    });

    setSlotResults(placedForSlots.map((p) => (p === null ? "wrong" : "revealed")));
    setShowRevealButton(false);

    const revealedCorrect = placedForSlots.filter((p) => p !== null).length;
    setParagraphScore(revealedCorrect);
    setGraded(true);
    if (revealedCorrect > 0) triggerParticles(revealedCorrect === placedForSlots.length ? "flower" : "burst", 28);
  }

  // Helper to render choice box
  function ChoiceBox({ word, idx, disabled }: { word: string; idx: number; disabled: boolean }) {
    const isSelected = activeChoice === idx;
    const baseStyle: React.CSSProperties = {
      minWidth: isSmallScreen ? 92 : 120,
      padding: isSmallScreen ? "6px 8px" : "8px 12px",
      borderRadius: 8,
      border: `2px solid ${isSelected ? "#ffcc00" : "#003366"}`,
      backgroundColor: disabled ? "#ddd" : "#fff",
      cursor: disabled ? "not-allowed" : isTouchDevice ? "pointer" : "grab",
      textAlign: "center",
      userSelect: "none",
      display: "inline-block",
      marginBottom: 8,
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (isTouchDevice) {
        setActiveChoice((prev) => (prev === idx ? null : idx));
      }
    };

    return (
      <div
        draggable={!isTouchDevice && !disabled}
        onDragStart={(e) => !isTouchDevice && handleDragStart(e as any, idx)}
        onClick={handleClick}
        role="button"
        aria-pressed={isSelected}
        style={baseStyle}
      >
        {word}
      </div>
    );
  }

  const paragraphSlotCount = slotCorrectWord.length || choiceWords.length;

  // --- compute safe display values for results / summary ---
  const displayFinalScore = finalScore ?? quizScore;
  const quizMax = quizQuestions.length || 1;
  const quizPercent = Math.round((displayFinalScore / quizMax) * 100);
  const totalScore = quizScore + (paragraphScore ?? 0);
  const totalMax = (quizQuestions.length || 0) + (slotCorrectWord.length || choiceWords.length || 0);
  const totalPercent = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;

  // speech synthesis for "音読してみましょう"
  function speakText(text: string) {
    try {
      if (typeof window !== "undefined" && (window as any).speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US"; // default — you can tune per-lesson
        (window as any).speechSynthesis.cancel();
        (window as any).speechSynthesis.speak(u);
      }
    } catch (e) {
      // ignore if not supported
    }
  }

  // --- render ---
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        padding: isSmallScreen ? "12px" : "20px",
        paddingTop: "92px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      {/* particle overlay container */}
      <div style={{ position: "fixed", pointerEvents: "none", inset: 0, zIndex: 9999 }}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left,
              top: `${-10 + (p.delay || 0) * -20}px`,
              width: p.size,
              height: p.size,
              transform: `rotate(${p.rotation}deg)`,
              opacity: 0.98,
              fontSize: Math.max(12, p.size / 2),
              animation: `floatDown 2s ${p.delay || 0}s ease-out forwards`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            {/* flower-like or confetti shapes — using emoji for playful effect */}
            <div style={{ transform: `rotate(${p.rotation}deg)` }}>{p.type === "flower" ? "🌸" : p.type === "burst" ? "✨" : "🎉"}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatDown {
          0% { opacity: 0; transform: translateY(-10px) scale(0.8) rotate(0deg); }
          30% { opacity: 1; }
          100% { transform: translateY(120vh) scale(1) rotate(180deg); opacity: 0; }
        }

        .breadcrumb { display:flex; gap:10px; align-items:center; justify-content:center; margin-bottom:8px }
        .breadcrumb button { background:transparent; border:none; cursor:pointer; font-size:14px }
      `}</style>

      <button
        onClick={() => nav(-1)}
        style={{
          marginBottom: 12,
          padding: isSmallScreen ? "6px 8px" : "8px 4px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        レッスン一覧に戻る
      </button>

      {/* Top breadcrumb — indicates which of the 3 main parts the user is in */}
      <div className="breadcrumb" style={{ width: "100%", maxWidth: 900 }}>
        {topSteps.map((t, i) => {
          const cur = currentTopIndex() === i;
          return (
            <React.Fragment key={t}>
              <button
                onClick={() => {
                  if (i === 0) setStep(0);
                  if (i === 1) setStep(1);
                  if (i === 2) setStep(totalWords + 1);
                }}
                style={{
                  fontWeight: cur ? 800 : 400,
                  color: cur ? "#000" : "#666",
                }}
              >
                {cur ? <span style={{ fontWeight: 800 }}>{t}</span> : t}
              </button>
              {i < topSteps.length - 1 && <span style={{ color: "#bbb" }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* --- 今日の単語／スタート画面 --- */}
      {step === 0 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize, marginBottom: 6 }}>今日の単語</h2>

          {/* Lesson instruction: encourage learning via English definitions & examples */}
          <div style={{ marginBottom: 12, textAlign: isSmallScreen ? "left" : "center" }}>
            <p style={{ color: "#333", fontSize: paragraphFontSize }}>
              このレッスンは「単語スライド → 単語スライド → 例文穴埋め（3択）」の流れで進みます。
              <br />英単語はなるべく日本語に
              訳さず、<strong>英語の定義や例文から意味をイメージすること</strong>を意識してみましょう。
               <br />各単語スライドでは<strong>音読してみましょう</strong>
            </p>
          </div>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {lesson.words.slice(0, 10).map((w: LessonWord, i: number) => (
              <li key={i} style={{ fontWeight: "bold", fontSize: wordListSize, marginBottom: 6 }}>
                {w.word}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setStep(1)} style={blueButtonStyle}>
              単語スライドから始める
            </button>

            <button
              onClick={() => setStep(totalWords + 1)}
              style={{
                fontSize: buttonFontSize,
                padding: isSmallScreen ? "8px 12px" : "10px 20px",
                marginTop: 16,
                backgroundColor: "#e9967a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                width: buttonWidth,
              }}
            >
              例文穴埋めへ直接進む（3択）
            </button>
          </div>
        </div>
      )}

      {/* --- 単語スライド --- */}
      {isSlide && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize, marginBottom: 12 }}>単語スライド</h2>

          <p style={{ fontSize: mainWordSize, fontWeight: "bold", marginBottom: 12 }}>{lesson.words[slideStep].word}</p>

          <p style={{ fontSize: paragraphFontSize, lineHeight: "1.6", textAlign: isSmallScreen ? "left" : "center" }}>
            <strong>意味:</strong> {lesson.words[slideStep].meaning}
            <br />
            <strong>類義語:</strong> {lesson.words[slideStep].synonyms || "なし"}
            <br />
            <strong>対義語:</strong> {lesson.words[slideStep].antonyms || "なし"}
            <br />
            <strong>例文:</strong> {lesson.words[slideStep].example || "なし"}
          </p>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 12 }}>
            <button
              onClick={() => speakText(`${lesson.words[slideStep].word}. ${lesson.words[slideStep].example || ""}`)}
              style={{ ...nextButtonStyle, backgroundColor: "#6fa8dc" }}
            >
              ▶️ 音読する
            </button>

            <div style={{ alignSelf: "center", fontSize: 14, color: "#444" }}>
              音読してみましょう — 声に出すことで記憶に残りやすくなります。
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <button onClick={() => setStep(step - 1)} style={{ ...nextButtonStyle, backgroundColor: "#999" }}>
              前へ
            </button>

            <button onClick={() => setStep(step + 1)} style={blueButtonStyle}>
              {slideStep + 1 < totalWords ? "次の単語" : "ミニテストへ"}
            </button>
          </div>
        </div>
      )}

      {/* --- クイズ（穴埋め 3択） --- */}
      {step === totalWords + 1 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize, marginBottom: 12 }}>例文を使った穴埋めクイズ！（3択）</h2>
          <p style={{ fontSize: isSmallScreen ? 14 : 16, color: "#444", marginTop: 4 }}>
            空欄に入るもっとも適切な単語を選んでください。3択は大きなボタンで見やすく表示します。
          </p>

          {quizLoading ? (
            <p>クイズを読み込み中...</p>
          ) : quizError ? (
            <div>
              <p>クイズの作成に失敗しました。</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => {
                    setFinalScore(0);
                    setStep(totalWords + 2);
                  }}
                  style={blueButtonStyle}
                >
                  採点へ
                </button>
              </div>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div>
              <p>クイズが見つかりません。</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => {
                    setFinalScore(0);
                    setStep(totalWords + 2);
                  }}
                  style={blueButtonStyle}
                >
                  採点へ
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: quizTextSize, marginBottom: 12, textAlign: "center" }}>
                <span dangerouslySetInnerHTML={{ __html: quizQuestions[quizIndex].blank_sentence }} />
              </p>

              {/* choices: show three large buttons with numbered badges and a "finger" emoji for readability */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isSmallScreen ? "1fr" : "repeat(3, 1fr)",
                  gap: 12,
                  alignItems: "stretch",
                }}
              >
                {quizQuestions[quizIndex].choices.map((c: string, i: number) => {
                  const isHovered = hoveredQuizChoice === i && selectedChoice === null && !isTouchDevice;
                  const isCorrect = selectedChoice !== null && i === quizQuestions[quizIndex].answer_index;
                  const isWrongSelected = selectedChoice !== null && i === selectedChoice && i !== quizQuestions[quizIndex].answer_index;

                  let background = "#003366";
                  let boxShadow = "none";
                  let transform = isHovered ? "translateY(-6px)" : "translateY(0)";

                  if (selectedChoice === null) {
                    if (isHovered) {
                      boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                    }
                  } else {
                    if (isCorrect) {
                      background = "linear-gradient(90deg,#34d399,#16a34a)";
                      boxShadow = "0 12px 30px rgba(16,185,129,0.18)";
                      transform = "translateY(-4px) scale(1.02)";
                    } else if (isWrongSelected) {
                      background = "linear-gradient(90deg,#ff7a7a,#ff4d4d)";
                      boxShadow = "0 12px 30px rgba(255,99,71,0.18)";
                      transform = "translateY(-2px) scale(0.99)";
                    } else {
                      background = "linear-gradient(90deg,#f8fafc,#e6eefc)";
                      boxShadow = "none";
                      transform = "translateY(0)";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleChoose(i)}
                      onMouseEnter={() => setHoveredQuizChoice(i)}
                      onMouseLeave={() => setHoveredQuizChoice(null)}
                      style={{
                        fontSize: isSmallScreen ? 16 : 18,
                        padding: isSmallScreen ? "12px 10px" : "16px 18px",
                        width: "100%",
                        background,
                        color: selectedChoice !== null ? (isCorrect ? "#052e16" : isWrongSelected ? "#330000" : "#0f172a") : "#fff",
                        boxShadow,
                        transform,
                        transition: "transform 0.18s ease, box-shadow 0.2s ease, background 0.25s ease",
                        border: "none",
                        cursor: selectedChoice !== null ? "default" : "pointer",
                        borderRadius: 12,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "left",
                      }}
                      disabled={selectedChoice !== null}
                    >
                      <div style={{ minWidth: 40, textAlign: "center", fontSize: 20, fontWeight: 800 }}>{` ${i + 1}`}</div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700 }}>{c}</div>
                        <div style={{ fontSize: 12, color: "#fff", opacity: 0.9 }}>
                          {i === quizQuestions[quizIndex].answer_index && selectedChoice !== null ? "正解" : ""}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedChoice !== null && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
                  <div style={{ fontSize: isSmallScreen ? 16 : 20, fontWeight: 700, color: selectedChoice === quizQuestions[quizIndex].answer_index ? "green" : "red" }}>
                    {selectedChoice === quizQuestions[quizIndex].answer_index ? "正解です！" : "惜しい！"}
                  </div>
                </div>
              )}

              {selectedChoice !== null && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => {
                      if (quizIndex + 1 < quizQuestions.length) {
                        setQuizIndex(quizIndex + 1);
                        setSelectedChoice(null);
                      } else {
                        setFinalScore(quizScore + (selectedChoice === quizQuestions[quizIndex].answer_index ? 1 : 0));
                        setStep(totalWords + 2);
                      }
                    }}
                    style={{ ...nextButtonStyle, marginTop: 12 }}
                  >
                    次の問題へ
                  </button>
                </div>
              )}
              <p style={{ marginTop: 12, fontSize: 14 }}>
                {quizIndex + 1} / {quizQuestions.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- 結果表示 --- */}
      {step === totalWords + 2 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize, marginBottom: 12 }}>結果</h2>
          <p style={{ fontSize: paragraphFontSize }}>
            {displayFinalScore !== null ? `正答数: ${displayFinalScore} / ${quizQuestions.length || 0}` : "正答率: 0%"}
          </p>
          <p style={{ fontSize: isSmallScreen ? 16 : 20, marginTop: 8 }}>
            {`正答率: ${quizPercent}%`}
          </p>

          {/* praise based on percent */}
          <p style={{ fontSize: isSmallScreen ? 14 : 18, marginTop: 8, color: "#333" }}>{getPraise(quizPercent)}</p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
            {ENABLE_PARAGRAPH_FILL && (
              <button onClick={() => setStep(totalWords + 3)} style={blueButtonStyle}>
                段落穴埋めに進む
              </button>
            )}
            <button onClick={() => {
              // celebration according to score
              if (quizPercent >= 90) triggerParticles("flower", 60);
              else if (quizPercent >= 70) triggerParticles("confetti", 40);
              else triggerParticles("burst", 24);
              setTimeout(() => nav(-1), 1200);
            }} style={blueButtonStyle}>
              終了する
            </button>
          </div>
        </div>
      )}

      {/* --- 段落穴埋め --- */}
      {step === totalWords + 3 && (
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2 style={{ fontSize: headingSize, marginBottom: 8 }}>段落穴埋め</h2>

          <div
            style={{
              fontSize: paragraphFontSize,
              lineHeight: 1.6,
              border: "1px solid #ddd",
              padding: isSmallScreen ? 12 : 20,
              borderRadius: 8,
              minHeight: 140,
              textAlign: isSmallScreen ? "left" : "center",
            }}
          >
            {renderParts.map((p, i) => {
              if (typeof p === "string") {
                return <span key={i}>{p}</span>;
              } else {
                const slotIndex = p.slotIndex;
                const placed = placedChoices[slotIndex];
                const status = slotResults[slotIndex] || "idle";
                const bg = status === "idle" ? "#fff" : status === "correct" || status === "revealed" ? "#c8f7c5" : "#f7c5c5";
                const slotStyle: React.CSSProperties = {
                  display: "inline-block",
                  minWidth: isSmallScreen ? 90 : 140,
                  padding: isSmallScreen ? "6px 8px" : "6px 10px",
                  margin: "0 6px",
                  border: "2px dashed #003366",
                  borderRadius: 6,
                  backgroundColor: bg,
                  verticalAlign: "middle",
                  cursor: isTouchDevice ? "pointer" : "auto",
                };

                const handleSlotClick = (e?: React.MouseEvent) => {
                  if (!isTouchDevice) return;
                  if (activeChoice !== null) {
                    placeChoiceToSlot(activeChoice, slotIndex);
                    return;
                  }
                  if (placed !== null) {
                    removeFromSlot(slotIndex);
                  }
                };

                return (
                  <React.Fragment key={i}>
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, slotIndex)}
                      onClick={handleSlotClick}
                      style={slotStyle}
                    >
                      {placed === null ? (
                        <em style={{ color: "#666", fontSize: isSmallScreen ? 12 : 14 }}>ここに単語を挿入</em>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            fontSize: isSmallScreen ? 14 : 16,
                            fontWeight: 700,
                          }}
                        >
                          <div>{choiceWords[placed]}</div>
                          {!isTouchDevice && (
                            <button
                              onClick={() => removeFromSlot(slotIndex)}
                              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 16 }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </span>
                    {slotSuffixes[slotIndex] ? (
                      <span key={`suf-${i}`} style={{ marginLeft: 6, color: "#666", fontStyle: "italic", fontSize: paragraphFontSize }}>
                        {slotSuffixes[slotIndex]}
                      </span>
                    ) : null}
                  </React.Fragment>
                );
              }
            })}
          </div>

          <div
            style={{
              marginTop: 4,
              borderTop: isSmallScreen ? "1px solid #eee" : undefined,
              paddingTop: isSmallScreen ? 8 : 0,
            }}
          >
            {isTouchDevice && (
              <div style={{ fontSize: 13, color: "#444", marginBottom: 8, textAlign: "left" }}>
                <strong>操作方法: 単語をタップ → 空欄をタップで配置。配置済みの空欄をタップすると取り外せます。</strong>
              </div>
            )}

            <h3 style={{ marginBottom: 8, fontSize: isSmallScreen ? 16 : 20 }}>単語（タップして選択してください）</h3>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: isSmallScreen ? "nowrap" : "wrap",
                justifyContent: isSmallScreen ? "flex-start" : "center",
                overflowX: isSmallScreen ? "auto" : "visible",
                paddingBottom: isSmallScreen ? 8 : 0,
                alignItems: "center",
              }}
              onClick={() => {
                if (isTouchDevice) setActiveChoice(null);
              }}
            >
              {choiceWords.map((w: string, i: number) => {
                const isPlaced = placedChoices.includes(i);
                return (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                    <ChoiceBox word={w} idx={i} disabled={isPlaced} />
                  </div>
                );
              })}
            </div>

            {isTouchDevice && (
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-start", overflowX: "auto" }}>
                <div style={{ fontSize: 13, color: "#666", minWidth: 90 }}>選択中：</div>
                <div style={{ minWidth: 90 }}>
                  {activeChoice === null ? (
                    <div style={{ fontSize: 13, color: "#999" }}>なし</div>
                  ) : (
                    <div style={{ fontWeight: 700 }}>{choiceWords[activeChoice]}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* controls */}
          <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {!graded && (
              <button onClick={handleGrade} style={blueButtonStyle}>
                採点する
              </button>
            )}
            {showRevealButton && (
              <button onClick={handleRevealAnswers} style={blueButtonStyle}>
                解答を表示
              </button>
            )}
            {graded && !showRevealButton && (
              <button
                onClick={() => {
                  setStep(totalWords + 4);
                }}
                style={blueButtonStyle}
              >
                次に行く
              </button>
            )}
            {!graded && !showRevealButton && (
              <button onClick={() => nav(-1)} style={{ ...blueButtonStyle, backgroundColor: "#999" }}>
                スキップして終了
              </button>
            )}
          </div>

          {graded && paragraphScore !== null && (
            <p style={{ marginTop: 12, fontSize: isSmallScreen ? 14 : 18 }}>
              穴埋め得点: {paragraphScore} / {slotCorrectWord.length || choiceWords.length}
            </p>
          )}
        </div>
      )}

      {/* --- 最終サマリー（クイズ + 段落） --- */}
      {step === totalWords + 4 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize, marginBottom: 12 }}>レッスン合計スコア</h2>
          <div style={{ fontSize: paragraphFontSize, marginBottom: 12, textAlign: "left" }}>
            <p>単語クイズ: {quizScore} / {quizQuestions.length}</p>
            <p>単語穴埋め: {paragraphScore ?? 0} / {slotCorrectWord.length || choiceWords.length}</p>
            <hr style={{ margin: "12px 0" }} />
            <p style={{ fontSize: isSmallScreen ? 18 : 22, fontWeight: 700 }}>
              合計: {totalScore} / {totalMax}
            </p>
            <p style={{ fontSize: isSmallScreen ? 14 : 18, marginTop: 8 }}>
              正答率: {totalPercent}%
            </p>

            {/* praise for total */}
            <p style={{ fontSize: isSmallScreen ? 14 : 18, marginTop: 8, color: "#333" }}>{getPraise(totalPercent)}</p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
            <button onClick={() => {
              if (totalPercent >= 90) triggerParticles("flower", 64);
              else if (totalPercent >= 70) triggerParticles("confetti", 44);
              else triggerParticles("burst", 28);
              setTimeout(() => nav(-1), 1200);
            }} style={blueButtonStyle}>レッスンを終了して一覧へ</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------
 helper: generate quiz from lesson (client-side)
---------------------------*/
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
      if (re.test(blank_sentence)) {
        blank_sentence = blank_sentence.replace(re, "____");
      } else {
        const cap = correct.charAt(0).toUpperCase() + correct.slice(1);
        const re2 = new RegExp(cap.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
        if (re2.test(blank_sentence)) blank_sentence = blank_sentence.replace(re2, "____");
        else blank_sentence = "____ " + blank_sentence;
      }
    } else {
      blank_sentence = "____";
    }

    questions.push({
      word: correct,
      sentence: item.example || "",
      blank_sentence,
      choices: shuffled,
      answer_index,
    });
  }

  return questions;
}

export default Lesson;
