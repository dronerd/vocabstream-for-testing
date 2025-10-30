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

  // Helper: try fetch JSON
  async function tryFetchJson(path: string): Promise<any | null> {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);

  // create/unlock AudioContext once on first user gesture
  useEffect(() => {
    function unlockAudio() {
      try {
        if (!audioCtxRef.current) {
          const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
          if (!Ctor) return;
          audioCtxRef.current = new Ctor();
        }
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state === "suspended") {
          ctx.resume().catch(() => { /* ignore */ });
        }
        audioUnlockedRef.current = true;
      } catch (e) {
        // ignore
      } finally {
        // remove listeners after first gesture
        document.removeEventListener("touchstart", unlockAudio);
        document.removeEventListener("click", unlockAudio);
      }
    }

    document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
    document.addEventListener("click", unlockAudio, { once: true, passive: true });

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  // load lesson data from public/data
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

  // generate quiz when entering quiz step
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

  // prevent scroll to weird spot on slides
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

  if (!lesson) return <div>Loading lesson...</div>;
  const totalWords = lesson.words.length;
  const slideStep = step - 1;
  const isSlide = step > 0 && slideStep < totalWords;

  // getPraise unchanged, returns random praise string
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

  // responsive sizes & button styles
  const headingSize = isSmallScreen ? 22 : 32;
  const headingSize2 = isSmallScreen ? 17 : 32;
  const mainWordSize = isSmallScreen ? 34 : 48; // slightly reduced but still large
  const wordListSize = isSmallScreen ? 16 : 34;
  const paragraphFontSize = isSmallScreen ? 14 : 20;
  const quizTextSize = isSmallScreen ? 16 : 28;
  const buttonFontSize = isSmallScreen ? 15 : 24; // slightly smaller on mobile
  const buttonWidth = isSmallScreen ? "100%" : 360;
  const blueButtonStyle: React.CSSProperties = {
    fontSize: buttonFontSize, padding: isSmallScreen ? "8px 10px" : "10px 20px", marginTop: 12,
    backgroundColor: "#003366", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", width: buttonWidth,
  };
  const nextButtonStyle: React.CSSProperties = { ...blueButtonStyle, width: isSmallScreen ? "100%" : 240, backgroundColor: "#003366" };

  // show the steps
  const topSteps = ["単語スライド", "例文を使った穴埋めクイズ（3択）"];
  function currentTopIndex() {
    if (isSlide) return 0;
    if (step === totalWords + 1) return 1;
    return -1;
  }

  // Play bright celebratory chime for correct answers
  async function playCorrectSound() {
    try {
      if (!audioCtxRef.current) {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current!;
      // resume if suspended (important on mobile)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const freqs = [1046.5, 1318.5, 1568.0]; // C6, E6, G6
      const gain = ctx.createGain();
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      // start from a very small positive value to avoid exponential ramp issues
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      // schedule exponential fade after linear ramp -- target must be > 0
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = f;
        osc.detune.value = (i - 1) * 10;
        osc.connect(gain);
        osc.start(now + i * 0.02);
        osc.stop(now + 1.0);
      });
    } catch (e) {
      // ignore or log
      // console.warn("playCorrectSound failed", e);
    }
  }

  // Play darker chime for wrong answers
  async function playWrongSound() {
    try {
      if (!audioCtxRef.current) {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880; // A5-ish
      o.connect(g);
      g.connect(ctx.destination);

      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      o.start(now);
      o.stop(now + 0.5);
    } catch (e) {
      // ignore or log
      // console.warn("playWrongSound failed", e);
    }
  }


  // show values for results
  const displayFinalScore = finalScore ?? quizScore;
  const quizMax = quizQuestions.length || 1;
  const quizPercent = Math.round((displayFinalScore / quizMax) * 100);
  const totalScore = quizScore;
  const totalMax = quizQuestions.length || 0;
  const totalPercent = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;
  
  function finishLesson() {
    if (finishLock) return; // prevent double execution
    setFinishLock(true);
    // go back to the previous page
    nav(-1);
  }

  function handleChoose(choiceIndex: number) {
    if (!quizQuestions[quizIndex] || selectedChoice !== null) return;
    const q = quizQuestions[quizIndex];
    const isCorrect = choiceIndex === q.answer_index;
    setSelectedChoice(choiceIndex);
    if (isCorrect) {
      setQuizScore((s) => s + 1);
      // kick off sound (no need to await)
      playCorrectSound().catch(() => {});
    } else {
      playWrongSound().catch(() => {});
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
      minHeight: "100vh", padding: isSmallScreen ? "10px" : "20px", paddingTop: isSmallScreen ? "56px" : "92px",
      fontFamily: "sans-serif", textAlign: "center",
    }}>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.85) rotate(0deg); }
          20% { opacity: 1; }
          100% { transform: translateY(-120vh) scale(1) rotate(180deg); opacity: 0; }
        }

        .breadcrumb { display:flex; gap:10px; align-items:center; justify-content:center; margin-bottom:8px }
        .breadcrumb button { background:transparent; border:none; cursor:pointer; font-size:14px }

        /* mobile tweaks using media query to avoid changing desktop */
        @media (max-width: 600px) {
          .breadcrumb { gap:6px; margin-bottom:4px }
          .breadcrumb button { font-size:13px; white-space:nowrap; padding:0 4px }
          .start-buttons { gap:8px }
          .audio-next-row { gap:8px }
          .slide-heading { margin-top:6px; margin-bottom:6px }
          .main-word { margin-top:6px; margin-bottom:6px }
          .prev-next-row { gap:8px }
        }
      `}</style>

      <button onClick={() => nav(-1)} style={{ marginBottom: isSmallScreen ? 10 : 12, padding: isSmallScreen ? "12px 12px" : (isSmallScreen ? "8px 10px" : "10px 6px"), borderRadius: 10, border: "none", backgroundColor: "#555", color: "#fff", cursor: "pointer" }}>
        レッスン一覧に戻る
      </button>

      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ width: "100%", maxWidth: 900, gap: isSmallScreen ? 6 : 10 }}>
        {topSteps.map((t, i) => {
          const curIndex = currentTopIndex();
          const cur = curIndex === i;
          return (
            <React.Fragment key={t}>
              <button
                onClick={() => {
                  if (i === 0) {
                    // 単語スライド
                    setStep(1);
                  } else if (i === 1) {
                    // 例文穴埋めクイズ（3択）
                    setStep(totalWords + 1);
                  }
                }}
                style={{ fontWeight: cur ? 800 : 400, color: cur ? "#000" : "#666", whiteSpace: "nowrap" }}
              >
                {cur ? <span style={{ fontWeight: 800 }}>{t}</span> : t}
              </button>
              {i < topSteps.length - 1 && <span style={{ color: "#bbb", margin: isSmallScreen ? '0 4px' : '0 8px' }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* Start screen */}
      {step === 0 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <div style={{ fontSize: headingSize, marginBottom: isSmallScreen ? 6 : 12 }}><strong>今日の単語</strong></div>
          <div style={{ fontWeight: "bold", fontSize: wordListSize, marginBottom: isSmallScreen ? 8 : 12 }}>
            {lesson.words.slice(0, 10).map((w: LessonWord, i: number) =>
              i < lesson.words.slice(0, 10).length - 1 ? `${w.word}, ` : w.word
            )}
          </div>

          <div style={{ marginBottom: isSmallScreen ? 8 : 12, textAlign: isSmallScreen ? "left" : "center" }}>
            <p style={{ color: "#333", fontSize: paragraphFontSize }}>
              このレッスンは「単語スライド → 例文穴埋め（3択）」の流れで進みます。<br />
              英単語はなるべく日本語に訳さず、<strong>英語の定義や例文から意味を理解すること</strong>を意識しましょう。<br />
              各単語スライドではぜひ音読してみましょう！
            </p>
          </div>

          <div className="start-buttons" style={{ display: "flex", justifyContent: "center", gap: isSmallScreen ? 8 : 12, flexWrap: "wrap" }}>
            <button onClick={() => setStep(1)} style={blueButtonStyle}>単語スライドから始める</button>
            <button onClick={() => setStep(totalWords + 1)} style={{ fontSize: buttonFontSize, padding: isSmallScreen ? "8px 12px" : "10px 20px", marginTop: isSmallScreen ? 12 : 16, backgroundColor: "#1a4e8a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", width: buttonWidth }}>
              例文穴埋めへ直接進む（3択）
            </button>
          </div>
        </div>
      )}

      {/* Word slides */}
      {isSlide && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 className="slide-heading" style={{ fontSize: headingSize, marginTop: isSmallScreen ? 6 : 12, marginBottom: isSmallScreen ? 6 : 12 }}>単語スライド</h2>
          <p className="main-word" style={{ fontSize: mainWordSize, fontWeight: "bold", marginBottom: isSmallScreen ? 6 : 12 }}>{lesson.words[slideStep].word}</p>
          <p style={{ fontSize: paragraphFontSize, lineHeight: "1.6", textAlign: isSmallScreen ? "left" : "center", marginBottom: isSmallScreen ? 8 : 12 }}>
            <strong>意味:</strong> {lesson.words[slideStep].meaning}<br />
            <strong>類義語:</strong> {lesson.words[slideStep].synonyms || "なし"}<br />
            <strong>対義語:</strong> {lesson.words[slideStep].antonyms || "なし"}<br />
            <strong>例文:</strong> {lesson.words[slideStep].example || "なし"}
          </p>

          <div className="audio-next-row" style={{ marginTop: isSmallScreen ? 6 : 10, display: "flex", justifyContent: "center", gap: isSmallScreen ? 8 : 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => speakEnglish(`${lesson.words[slideStep].word}. ${lesson.words[slideStep].example || ""}`)}
              style={{ ...nextButtonStyle, backgroundColor: "#6fa8dc", width: isSmallScreen ? 180 : undefined, padding: isSmallScreen ? "6px 10px" : undefined, fontSize: isSmallScreen ? 14 : nextButtonStyle.fontSize }}
            >
              ▶️ 音声を聞く
            </button>

            <div style={{ alignSelf: "center", fontSize: isSmallScreen ? 12 : 12, color: "#444", marginLeft: isSmallScreen ? 0 : 0 }}>音読してみましょう — 記憶に残りやすくなります。</div>
          </div>

          <div className="prev-next-row" style={{ display: "flex", justifyContent: "center", gap: isSmallScreen ? 8 : 12, marginTop: isSmallScreen ? 8 : 16 }}>
            <button onClick={() => setStep(step - 1)} style={{ ...nextButtonStyle, backgroundColor: "#999", width: isSmallScreen ? 140 : nextButtonStyle.width }}>前へ</button>
            <button onClick={() => setStep(step + 1)} style={{ ...blueButtonStyle, width: isSmallScreen ? 140 : blueButtonStyle.width }}>{slideStep + 1 < totalWords ? "次の単語" : "ミニテストへ"}</button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {step === totalWords + 1 && (
        <div style={{ width: "100%", maxWidth: 900 }}>
          <h2 style={{ fontSize: headingSize2, marginBottom: 8 }}>例文を使った穴埋めクイズ（3択👆）</h2>
          <p style={{ fontSize: isSmallScreen ? 12 : 20, color: "black", marginTop: 1 }}>空欄に入るもっとも適切な単語を選んでください</p>

          {quizLoading ? <p>クイズを読み込み中...</p> : quizError ? (
            <div>
              <p>クイズの作成に失敗しました。</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => { setFinalScore(0); setStep(totalWords + 2); }} style={blueButtonStyle}>採点へ</button>
              </div>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div>
              <p>クイズが見つかりません。</p>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={() => { setFinalScore(0); setStep(totalWords + 2); }} style={blueButtonStyle}>採点へ</button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: quizTextSize, marginBottom: 12, textAlign: "center" }}>
                <span dangerouslySetInnerHTML={{ __html: quizQuestions[quizIndex].blank_sentence }} />
              </p>

              <div style={{ display: "grid", gridTemplateColumns: isSmallScreen ? "1fr" : "repeat(3, 1fr)", gap: 12, alignItems: "stretch" }}>
                {quizQuestions[quizIndex].choices.map((c: string, i: number) => {
                  const isHovered = hoveredQuizChoice === i && selectedChoice === null && !isTouchDevice;
                  const isCorrect = selectedChoice !== null && i === quizQuestions[quizIndex].answer_index;
                  const isWrongSelected = selectedChoice !== null && i === selectedChoice && i !== quizQuestions[quizIndex].answer_index;

                  let background = "#003366";
                  let boxShadow = "none";
                  let transform = isHovered ? "translateY(-6px)" : "translateY(0)";
                  if (selectedChoice === null) {
                    if (isHovered) boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                  } else {
                    if (isCorrect) { background = "linear-gradient(90deg,#34d399,#16a34a)"; boxShadow = "0 12px 30px rgba(16,185,129,0.18)"; transform = "translateY(-4px) scale(1.02)"; }
                    else if (isWrongSelected) { background = "linear-gradient(90deg,#ff7a7a,#ff4d4d)"; boxShadow = "0 12px 30px rgba(255,99,71,0.18)"; transform = "translateY(-2px) scale(0.99)"; }
                    else { background = "linear-gradient(90deg,#f8fafc,#e6eefc)"; boxShadow = "none"; transform = "translateY(0)"; }
                  }

                  return (
                    <button key={i} onClick={() => handleChoose(i)} onMouseEnter={() => setHoveredQuizChoice(i)} onMouseLeave={() => setHoveredQuizChoice(null)}
                      style={{
                        fontSize: isSmallScreen ? 16 : 18, padding: isSmallScreen ? "4px 5px" : "14px 16px", width: "100%",
                        background, color: selectedChoice !== null ? (isCorrect ? "#052e16" : isWrongSelected ? "#330000" : "#0f172a") : "#fff",
                        boxShadow, transform, transition: "transform 0.18s ease, box-shadow 0.2s ease, background 0.25s ease", border: "none", cursor: selectedChoice !== null ? "default" : "pointer",
                        borderRadius: 12, display: "flex", gap: 12, alignItems: "center", justifyContent: "center", textAlign: "left",
                      }} disabled={selectedChoice !== null}>
                      <div style={{ minWidth: 40, textAlign: "center", fontSize: 18, fontWeight: 800 }}>{` ${i + 1}`}</div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 700 }}>{c}</div>
                        <div style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>{i === quizQuestions[quizIndex].answer_index && selectedChoice !== null ? "correct!" : ""}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedChoice !== null && (
                <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
                  <div style={{ fontSize: isSmallScreen ? 14 : 24, fontWeight: 700, color: selectedChoice === quizQuestions[quizIndex].answer_index ? "green" : "red" }}>
                    {selectedChoice === quizQuestions[quizIndex].answer_index ? "correct!" : "Nice try！"}
                  </div>
                </div>
              )}

              {selectedChoice !== null && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button onClick={() => {
                    if (quizIndex + 1 < quizQuestions.length) {
                      setQuizIndex(quizIndex + 1);
                      setSelectedChoice(null);
                    } else {
                      // finalize quiz, then go to score screen
                      setFinalScore(quizScore + (selectedChoice === quizQuestions[quizIndex].answer_index ? 1 : 0));
                      setStep(totalWords + 2);
                    }
                  }} style={{ ...nextButtonStyle, marginTop: 12 }}>
                    次の問題へ
                  </button>
                </div>
              )}
              <p style={{ marginTop: 12, fontSize: 14 }}>{quizIndex + 1} / {quizQuestions.length}</p>
            </div>
          )}
        </div>
      )}


      {/* Final summary */}
      {step === totalWords + 2 && (() => {
        const praise = getPraise(totalPercent);

        return (
          <div
            style={{
              width: "100vw", // use full viewport width
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              flexDirection: "column",
              textAlign: "center",
              paddingTop: "40px",
              paddingLeft: isSmallScreen ? "10px" : "0",
              paddingRight: isSmallScreen ? "10px" : "0",
              boxSizing: "border-box",
              overflowX: "hidden", // prevent side scrollbars
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: isSmallScreen ? "100%" : 900, // no width restriction on mobile
                margin: isSmallScreen ? "0" : "0 auto", // remove horizontal margin on mobile
              }}
            >
              <h2 style={{ fontSize: headingSize, marginBottom: 12 }}>レッスン合計スコア</h2>

              <div style={{ fontSize: paragraphFontSize, marginBottom: 12 }}>
                <p>単語クイズ: {quizScore} / {quizQuestions.length}</p>
                <hr style={{ margin: "12px 0" }} />
                <p style={{ fontSize: isSmallScreen ? 18 : 22, fontWeight: 700 }}>
                  合計: {totalScore} / {totalMax}
                </p>
                <p style={{ fontSize: isSmallScreen ? 14 : 18, marginTop: 8 }}>
                  正答率: {totalPercent}%
                </p>
                <p style={{ fontSize: isSmallScreen ? 14 : 18, marginTop: 8, color: "#333" }}>
                  {praise}
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
                <button onClick={() => finishLesson()} style={blueButtonStyle}>
                  レッスンを終了
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

/* generateQuizFromLesson */
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
  // Shuffle final question order
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions;

}

export default Lesson;
