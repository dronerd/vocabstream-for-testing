// src/pages/Lesson.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface LessonWord {
  word: string;
  example?: string;
  meaning?: string;
  japaneseMeaning?: string;
  synonyms?: string;
  antonyms?: string;
  // allow extra fields from JSON
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

  // --- quiz state ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // --- paragraph (drag & drop) state ---
  const [placedChoices, setPlacedChoices] = useState<(number | null)[]>([]);
  const [slotCorrectWord, setSlotCorrectWord] = useState<string[]>([]);
  const [slotSuffixes, setSlotSuffixes] = useState<string[]>([]);
  const [renderParts, setRenderParts] = useState<(string | { slotIndex: number })[]>([]);
  const [graded, setGraded] = useState<boolean>(false);
  const [slotResults, setSlotResults] = useState<("idle" | "correct" | "wrong" | "revealed")[]>([]);
  const [showRevealButton, setShowRevealButton] = useState<boolean>(false);
  const [paragraphScore, setParagraphScore] = useState<number | null>(null);

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

      // Candidate file paths under public/data (served at /data/...)
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
        setLesson({ words: [] });
      } else {
        setLesson(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // --- generate quiz locally when user moves to quiz step ---
  useEffect(() => {
    if (!lesson) return;
    const totalWords = lesson.words ? lesson.words.length : 0;
    if (step === totalWords + 1) {
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
    const paragraphStep = totalWords + 3;
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
        const escaped = cw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    }
  }, [step, lesson, choiceWords]);

  if (!lesson) return <div>Loading lesson...</div>;
  const totalWords = lesson.words.length;
  const slideStep = step - 1;
  const isSlide = step > 0 && slideStep < totalWords;
  const blueButtonStyle = {
    fontSize: "24px",
    padding: "10px 20px",
    marginTop: "30px",
    backgroundColor: "#003366",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  } as React.CSSProperties;

  function handleChoose(choiceIndex: number) {
    if (!quizQuestions[quizIndex] || selectedChoice !== null) return;
    const q = quizQuestions[quizIndex];
    const isCorrect = choiceIndex === q.answer_index;
    setSelectedChoice(choiceIndex);
    if (isCorrect) setQuizScore((s) => s + 1);
  }

  // Drag/drop handlers
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
  }

  // Helper to render choice box
  function ChoiceBox({ word, idx, disabled }: { word: string; idx: number; disabled: boolean }) {
    return (
      <div
        draggable={!disabled}
        onDragStart={(e) => handleDragStart(e, idx)}
        style={{
          minWidth: 120,
          padding: "8px 12px",
          borderRadius: 8,
          border: "2px solid #003366",
          backgroundColor: disabled ? "#ddd" : "#fff",
          cursor: disabled ? "not-allowed" : "grab",
          textAlign: "center",
        }}
      >
        {word}
      </div>
    );
  }

  const paragraphSlotCount = slotCorrectWord.length || choiceWords.length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        paddingTop : "92px",
        fontFamily: "sans-serif",
        textAlign: "center",
      }}
    >
      <button
        onClick={() => nav(-1)}
        style={{ marginBottom: 20, padding: "8px 4px", borderRadius: 8, border: "none", backgroundColor: "#555", color: "#fff", cursor: "pointer" }}
      >
        レッスン一覧に戻る
      </button>

      {/* --- 今日の単語 --- */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>今日の単語</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {lesson.words.slice(0, 10).map((w: LessonWord, i: number) => (
              <li key={i} style={{ fontWeight: "bold", fontSize: "40px", marginBottom: "5px" }}>
                {w.word}
              </li>
            ))}
          </ul>
          <button onClick={() => setStep(1)} style={blueButtonStyle}>
            次へ（スライド）
          </button>
        </div>
      )}

      {/* --- 単語スライド --- */}
      {isSlide && (
        <div>
          <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>単語スライド</h2>
          <p style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>{lesson.words[slideStep].word}</p>
          <p style={{ fontSize: "28px", lineHeight: "1.8" }}>
            <strong>Meaning:</strong> {lesson.words[slideStep].meaning}
            <br />
            <strong>日本語訳:</strong> {lesson.words[slideStep].japaneseMeaning || "なし"}
            <br />
            <strong>類義語:</strong> {lesson.words[slideStep].synonyms || "なし"}
            <br />
            <strong>対義語:</strong> {lesson.words[slideStep].antonyms || "なし"}
            <br />
            <strong>例文:</strong> {lesson.words[slideStep].example || "なし"}
          </p>
          <button onClick={() => setStep(step + 1)} style={blueButtonStyle}>
            {slideStep + 1 < totalWords ? "次の単語" : "ミニテストへ"}
          </button>
        </div>
      )}

      {/* --- クイズ（穴埋め 3択） --- */}
      {step === totalWords + 1 && (
        <div>
          <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>穴埋めクイズ（3択）</h2>
          {quizLoading ? (
            <p>クイズを読み込み中...</p>
          ) : quizError ? (
            <div>
              <p>クイズの作成に失敗しました。</p>
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
          ) : quizQuestions.length === 0 ? (
            <div>
              <p>クイズが見つかりません。</p>
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
          ) : (
            <div>
              <p style={{ fontSize: "28px", marginBottom: "20px" }}>
                <span dangerouslySetInnerHTML={{ __html: quizQuestions[quizIndex].blank_sentence }} />
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                {quizQuestions[quizIndex].choices.map((c: string, i: number) => {
                  let backgroundColor = "#003366";
                  if (selectedChoice !== null) {
                    if (i === quizQuestions[quizIndex].answer_index) backgroundColor = "green";
                    else if (i === selectedChoice) backgroundColor = "red";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleChoose(i)}
                      style={{ ...blueButtonStyle, fontSize: 20, padding: "8px 16px", width: 360, backgroundColor }}
                      disabled={selectedChoice !== null}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              {selectedChoice !== null && (
                <button
                  onClick={() => {
                    if (quizIndex + 1 < quizQuestions.length) {
                      setQuizIndex(quizIndex + 1);
                      setSelectedChoice(null);
                    } else {
                      setFinalScore(quizScore);
                      setStep(totalWords + 2);
                    }
                  }}
                  style={{ ...blueButtonStyle, marginTop: 20 }}
                >
                  次の問題へ
                </button>
              )}
              <p style={{ marginTop: 16, fontSize: 18 }}>
                {quizIndex + 1} / {quizQuestions.length}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- 結果表示 --- */}
      {step === totalWords + 2 && (
        <div>
          <h2 style={{ fontSize: "32px", marginBottom: "20px" }}>結果</h2>
          <p style={{ fontSize: "28px" }}>
            {finalScore !== null ? `正答数: ${finalScore} / ${quizQuestions.length}` : "正答率: 0%"}
          </p>
          <p style={{ fontSize: "20px", marginTop: 10 }}>
            {finalScore !== null ? `正答率: ${Math.round((finalScore / (quizQuestions.length || 1)) * 100)}%` : ""}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={() => setStep(totalWords + 3)} style={blueButtonStyle}>
              単語穴埋めに進む
            </button>
            <button onClick={() => nav(-1)} style={blueButtonStyle}>
              終了する
            </button>
          </div>
        </div>
      )}

      {/* --- 段落穴埋め（ドラッグ＆ドロップ） --- */}
      {step === totalWords + 3 && (
        <div style={{ maxWidth: 900 }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>段落穴埋め（ドラッグして空欄に入れてください）</h2>

          <div style={{ fontSize: 20, lineHeight: 1.8, border: "1px solid #ddd", padding: 20, borderRadius: 8, minHeight: 120 }}>
            {renderParts.map((p, i) => {
              if (typeof p === "string") {
                return <span key={i}>{p}</span>;
              } else {
                const slotIndex = p.slotIndex;
                const placed = placedChoices[slotIndex];
                const status = slotResults[slotIndex] || "idle";
                const bg = status === "idle" ? "#fff" : status === "correct" || status === "revealed" ? "#c8f7c5" : "#f7c5c5";
                return (
                  <React.Fragment key={i}>
                    <span
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, slotIndex)}
                      style={{
                        display: "inline-block",
                        minWidth: 140,
                        padding: "6px 10px",
                        margin: "0 6px",
                        border: "2px dashed #003366",
                        borderRadius: 6,
                        backgroundColor: bg,
                        verticalAlign: "middle",
                      }}
                    >
                      {placed === null ? (
                        <em style={{ color: "#666" }}>ここにドラッグ</em>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{ fontWeight: 700 }}>{choiceWords[placed]}</div>
                          <button onClick={() => removeFromSlot(slotIndex)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                            ✕
                          </button>
                        </div>
                      )}
                    </span>
                    {slotSuffixes[slotIndex] ? (
                      <span key={`suf-${i}`} style={{ marginLeft: 6, color: "#666", fontStyle: "italic" }}>
                        {slotSuffixes[slotIndex]}
                      </span>
                    ) : null}
                  </React.Fragment>
                );
              }
            })}
          </div>

          {/* choices area */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>単語（ドラッグしてください）</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {choiceWords.map((w: string, i: number) => {
                const isPlaced = placedChoices.includes(i);
                return <ChoiceBox key={i} word={w} idx={i} disabled={isPlaced} />;
              })}
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
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
            <p style={{ marginTop: 18, fontSize: 18 }}>穴埋め得点: {paragraphScore} / {slotCorrectWord.length || choiceWords.length}</p>
          )}
        </div>
      )}

      {/* --- 最終サマリー（クイズ + 段落） --- */}
      {step === totalWords + 4 && (
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>レッスン合計スコア</h2>
          <div style={{ fontSize: 20, marginBottom: 12 }}>
            <p>単語クイズ: {quizScore} / {quizQuestions.length}</p>
            <p>単語穴埋め: {paragraphScore ?? 0} / {slotCorrectWord.length || choiceWords.length}</p>
            <hr style={{ margin: "12px 0" }} />
            <p style={{ fontSize: 22, fontWeight: 700 }}>
              合計: {quizScore + (paragraphScore ?? 0)} / {quizQuestions.length + (slotCorrectWord.length || choiceWords.length)}
            </p>
            <p style={{ fontSize: 18, marginTop: 8 }}>
              正答率: {Math.round(((quizScore + (paragraphScore ?? 0)) / (quizQuestions.length + (slotCorrectWord.length || choiceWords.length) || 1)) * 100)}%
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
            <button onClick={() => nav(-1)} style={blueButtonStyle}>レッスンを終了して一覧へ</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
      const re = new RegExp(correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if (re.test(blank_sentence)) {
        blank_sentence = blank_sentence.replace(re, "____");
      } else {
        const cap = correct.charAt(0).toUpperCase() + correct.slice(1);
        const re2 = new RegExp(cap.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
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