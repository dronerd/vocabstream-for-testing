import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiLessonDetail } from "../api";

// --- EDIT THIS LIST to change which genres are shown in the frontend ---
export const FRONTEND_GENRES = [
  "Business",
  "Technology",
  "Culture",
];

interface ParagraphSlotBuildResult {
  renderParts: (string | { slotIndex: number })[];
  slotWords: string[];
  detectedSuffixes: string[];
}

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [genres, setGenres] = useState<string[]>(FRONTEND_GENRES);
  const nav = useNavigate();

  // UI step:
  // 0 = 今日の単語選択画面
  // 1..totalWords = 単語スライド
  // paragraphBase = totalWords + 1 -> paragraph flow (paragraphIndex selects which paragraph)
  // summaryStep = totalWords + 2 -> 最終サマリ
  const [step, setStep] = useState(0);

  // track whether slides were started from the initial "単語スライドを見る" on step 0.
  // If true, we hide the "スライドを飛ばして段落へ" button.
  const [cameFromStart, setCameFromStart] = useState(false);

  // track if this lesson's review has been finished once (persisted in localStorage)
  const [reviewFinishedOnce, setReviewFinishedOnce] = useState(false);

  // paragraph flow
  const [paragraphIndex, setParagraphIndex] = useState(0); // 0,1,2
  const PARAGRAPH_COUNT = 3;
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  // --- paragraph (drag & drop) state ---
  const [placedChoices, setPlacedChoices] = useState<(number | null)[]>([]);
  const [slotCorrectWord, setSlotCorrectWord] = useState<string[]>([]);
  const [slotSuffixes, setSlotSuffixes] = useState<string[]>([]);
  const [renderParts, setRenderParts] = useState<(string | { slotIndex: number })[]>([]);
  const [graded, setGraded] = useState(false);
  const [slotResults, setSlotResults] = useState<('idle' | 'correct' | 'wrong' | 'revealed' )[]>([]);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [paragraphScore, setParagraphScore] = useState<number | null>(null);

  // whether answers were revealed for current paragraph (used to gate next-paragraph button)
  const [answersRevealed, setAnswersRevealed] = useState(false);

  // accumulate scores across paragraphs
  const [paragraphScores, setParagraphScores] = useState<number[]>([]); // length PARAGRAPH_COUNT
  const [paragraphSlotCounts, setParagraphSlotCounts] = useState<number[]>([]);

  useEffect(() => {
    if (!lessonId) return;
    apiLessonDetail(lessonId).then((res) => {
      // IMPORTANT: ignore genres coming from backend — override with frontend list
      // This ensures genres are not retrieved from backend and the frontend list is used instead.
      const cleaned = { ...res };
      if ('genres' in cleaned) delete cleaned.genres;
      setLesson(cleaned);

      // (optional) if you want to vary frontend genres by lessonId, do it here.
      setGenres(FRONTEND_GENRES);
    });
  }, [lessonId]);

  // load persisted review-finished flag for this lesson
  useEffect(() => {
    if (!lessonId) return;
    const val = localStorage.getItem(`review_done_${lessonId}`);
    setReviewFinishedOnce(val === '1');
  }, [lessonId]);

  const totalWords = lesson ? lesson.words.length : 0;
  const paragraphBase = totalWords + 1;
  const summaryStep = totalWords + 2;

  // choice words (same choices for all paragraphs) - show up to 10
  const choiceWords = useMemo<string[]>(() => {
    if (!lesson) return [];
    return lesson.words.slice(0, 10).map((w: any) => w.word);
  }, [lesson]);

  // build paragraphs array (use lesson.paragraph_review1/2/3 if present, otherwise fall back to existing behaviors)
  useEffect(() => {
    if (!lesson) return;

    const baseParagraph = lesson.paragraph || lesson.words.map((w: any) => w.example || w.word).join(' ');

    const providedArray = Array.isArray(lesson.paragraphs) ? lesson.paragraphs : [];
    const explicit2 = lesson.paragraph2 || lesson.paragraph_2 || null;
    const explicit3 = lesson.paragraph3 || lesson.paragraph_3 || null;

    const review1 = lesson.paragraph_review1 || lesson.paragraphReview1 || lesson.paragraph_review_1 || lesson.paragraph1_review || null;
    const review2 = lesson.paragraph_review2 || lesson.paragraphReview2 || lesson.paragraph_review_2 || lesson.paragraph2_review || null;
    const review3 = lesson.paragraph_review3 || lesson.paragraphReview3 || lesson.paragraph_review_3 || lesson.paragraph3_review || null;

    const reviewFields = [review1, review2, review3];

    const arr: string[] = [];
    for (let i = 0; i < PARAGRAPH_COUNT; i++) {
      if (reviewFields[i]) {
        arr.push(reviewFields[i]);
      } else if (providedArray[i]) {
        arr.push(providedArray[i]);
      } else if (i === 0) {
        if (lesson.paragraph) arr.push(lesson.paragraph);
        else arr.push(baseParagraph);
      } else if (i === 1) {
        if (explicit2) arr.push(explicit2);
        else arr.push(baseParagraph);
      } else if (i === 2) {
        if (explicit3) arr.push(explicit3);
        else arr.push(baseParagraph);
      } else {
        arr.push(baseParagraph);
      }
    }

    setParagraphs(arr);

    // initialize aggregator arrays
    setParagraphScores(Array(PARAGRAPH_COUNT).fill(0));
    setParagraphSlotCounts(Array(PARAGRAPH_COUNT).fill(0));
  }, [lesson]);

  // Build slots for current paragraph when entering paragraph flow or when paragraphIndex changes
  useEffect(() => {
    if (!lesson) return;
    if (step !== paragraphBase) return;
    const p = paragraphs[paragraphIndex];
    if (!p) return;

    const build = (paragraphRaw: string, choiceWordsLocal: string[]): ParagraphSlotBuildResult => {
      let processed = paragraphRaw;
      const slotWords: string[] = [];
      const detectedSuffixes: string[] = [];
      let slotCounter = 0;

      const SUFFIX_PATTERN = "(?:'(?:s|re|ve|ll)|s|es|ed|ing|en|ly)?";

      // try replace first occurrence of each choice lemma
      choiceWordsLocal.forEach((cw) => {
        if (!cw) return;
        const escaped = cw.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
        const re = new RegExp("\\b(" + escaped + ")(" + SUFFIX_PATTERN + ")\\b", "iu");
        processed = processed.replace(re, (match: string, p1: string, p2: string) => {
          const token = `[[SLOT_${slotCounter}]]`;
          slotWords.push(cw);
          detectedSuffixes.push(p2 || "");
          slotCounter++;
          return token;
        });
      });

      if (slotWords.length === 0) {
        // fallback: create three slots at start
        processed = `[[SLOT_0]] [[SLOT_1]] [[SLOT_2]] ` + processed;
        slotWords.push(...choiceWordsLocal.slice(0, 3));
        detectedSuffixes.push("", "", "");
      }

      const parts: (string | { slotIndex: number })[] = [];
      const tokenRe = /\[\[SLOT_(\d+)\]\]/g;
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = tokenRe.exec(processed)) !== null) {
        const idx = m.index;
        if (idx > lastIndex) parts.push(processed.substring(lastIndex, idx));
        parts.push({ slotIndex: Number(m[1]) });
        lastIndex = idx + m[0].length;
      }
      if (lastIndex < processed.length) parts.push(processed.substring(lastIndex));

      return { renderParts: parts, slotWords, detectedSuffixes };
    };

    const { renderParts: rp, slotWords, detectedSuffixes } = build(paragraphs[paragraphIndex], choiceWords);
    setRenderParts(rp);
    setSlotCorrectWord(slotWords);
    setSlotSuffixes(detectedSuffixes);
    setPlacedChoices(Array(slotWords.length).fill(null));
    setSlotResults(Array(slotWords.length).fill('idle'));
    setGraded(false);
    setShowRevealButton(false);
    setParagraphScore(null);

    // reset answersRevealed when entering a paragraph
    setAnswersRevealed(false);

    // record slot count for this paragraph (used for scoring)
    setParagraphSlotCounts((prev) => {
      const next = [...prev];
      next[paragraphIndex] = slotWords.length;
      return next;
    });
  }, [step, paragraphIndex, paragraphs, lesson, choiceWords]);

  if (!lesson) return <div>Loading lesson...</div>;

  const slideStep = step > 0 && step <= totalWords ? step - 1 : -1;
  const isSlide = slideStep >= 0;

  const blueButtonStyle = {
    fontSize: '24px', padding: '10px 20px', marginTop: '30px', backgroundColor: '#003366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'
  } as React.CSSProperties;

  function handleDragStart(e: React.DragEvent, choiceIndex: number) {
    e.dataTransfer.setData('text/plain', String(choiceIndex));
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
  function handleDrop(e: React.DragEvent, slotIndex: number) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const choiceIndex = Number(data);
    if (Number.isNaN(choiceIndex)) return;
    setPlacedChoices((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) if (next[i] === choiceIndex) next[i] = null;
      next[slotIndex] = choiceIndex;
      return next;
    });
    setSlotResults((prev) => { const next = [...prev]; next[slotIndex] = 'idle'; return next; });
  }
  function removeFromSlot(slotIndex: number) {
    setPlacedChoices((prev) => { const next = [...prev]; next[slotIndex] = null; return next; });
    setSlotResults((prev) => { const next = [...prev]; next[slotIndex] = 'idle'; return next; });
  }

  function handleGrade() {
    const results: ('idle' | 'correct' | 'wrong')[] = slotCorrectWord.map((correctWord, idx) => {
      const placed = placedChoices[idx];
      if (placed === null || placed === undefined) return 'wrong';
      return choiceWords[placed] === correctWord ? 'correct' : 'wrong';
    });
    setSlotResults(results.map((r) => (r === 'correct' ? 'correct' : 'wrong')));
    setGraded(true);
    const anyWrong = results.some((r) => r !== 'correct');
    setShowRevealButton(anyWrong);

    const correctCount = results.filter((r) => r === 'correct').length;
    setParagraphScore(correctCount);

    // save into paragraphScores
    setParagraphScores((prev) => {
      const next = [...prev];
      next[paragraphIndex] = correctCount;
      return next;
    });
  }

  function handleRevealAnswers() {
    const placedForSlots = slotCorrectWord.map((w) => {
      const idx = choiceWords.findIndex((cw) => cw === w);
      return idx >= 0 ? idx : null;
    });
    setPlacedChoices(() => {
      const next = Array(slotCorrectWord.length).fill(null as number | null);
      for (let i = 0; i < placedForSlots.length; i++) next[i] = placedForSlots[i];
      return next;
    });
    setSlotResults(placedForSlots.map((p) => (p === null ? 'wrong' : 'revealed')));
    setShowRevealButton(false);
    const revealedCorrect = placedForSlots.filter((p) => p !== null).length;
    setParagraphScore(revealedCorrect);
    setParagraphScores((prev) => { const next = [...prev]; next[paragraphIndex] = revealedCorrect; return next; });
    setGraded(true);

    // mark that answers were revealed (this unlocks next paragraph)
    setAnswersRevealed(true);
  }

  function ChoiceBox({ word, idx, disabled }: { word: string; idx: number; disabled: boolean }) {
    return (
      <div draggable={!disabled} onDragStart={(e) => handleDragStart(e, idx)} style={{ minWidth: 120, padding: '8px 12px', borderRadius: 8, border: '2px solid #003366', backgroundColor: disabled ? '#ddd' : '#fff', cursor: disabled ? 'not-allowed' : 'grab', textAlign: 'center' }}>
        {word}
      </div>
    );
  }

  // move to next paragraph or finish paragraph flow
  function gotoNextParagraphOrSummary() {
    if (paragraphIndex + 1 < PARAGRAPH_COUNT) {
      setParagraphIndex(paragraphIndex + 1);
      // clear graded states - new paragraph will rebuild in useEffect
    } else {
      // finish paragraph flow -> compute totals and go to summary
      setStep(summaryStep);
    }
  }

  // compute final aggregated score scaled to 30
  const totalRawCorrect = paragraphScores.reduce((a, b) => a + b, 0);
  const totalRawPossible = paragraphSlotCounts.reduce((a, b) => a + b, 0) || 1;
  const scaledScore30 = Math.round((totalRawCorrect / totalRawPossible) * 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', paddingTop: '92px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <button onClick={() => nav(-1)} style={{ marginBottom: 20, padding: '8px 4px', borderRadius: 8, border: 'none', backgroundColor: '#555', color: '#fff', cursor: 'pointer' }}>レッスン一覧に戻る</button>

      {/* Frontend genres (no backend retrieval) */}
      <div style={{ marginBottom: 12 }}>
        {genres.map((g, i) => (
          <span key={i} style={{ display: 'inline-block', padding: '6px 10px', margin: '0 6px', borderRadius: 999, backgroundColor: '#eef', color: '#003366', fontWeight: 600 }}>{g}</span>
        ))}
      </div>

      {/* 今日の単語 - choose to go directly to paragraph or view slides */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>今日復習する単語</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {lesson.words.slice(0, 10).map((w: any, i: number) => (
              <li key={i} style={{ fontWeight: 'bold', fontSize: 40, marginBottom: 5 }}>{w.word}</li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setParagraphIndex(0); setStep(paragraphBase); /* entering paragraph directly */ setCameFromStart(false); }} style={blueButtonStyle}>段落穴埋めに直接進む</button>
            <button onClick={() => { setCameFromStart(true); setStep(1); }} style={blueButtonStyle}>単語スライドを見る</button>
          </div>
        </div>
      )}

      {/* 単語スライド */}
      {isSlide && (
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>単語スライド</h2>
          <p style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20 }}>{lesson.words[slideStep].word}</p>
          <p style={{ fontSize: 28, lineHeight: '1.8' }}>
            <strong>Meaning:</strong> {lesson.words[slideStep].meaning}
            <br />
            <strong>日本語訳:</strong> {lesson.words[slideStep].japaneseMeaning || 'なし'}
            <br />
            <strong>類義語:</strong> {lesson.words[slideStep].synonyms || 'なし'}
            <br />
            <strong>対義語:</strong> {lesson.words[slideStep].antonyms || 'なし'}
            <br />
            <strong>例文:</strong> {lesson.words[slideStep].example || 'なし'}
          </p>

          {/* 単語スライド のボタン部分 */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {slideStep + 1 < totalWords ? (
              <button onClick={() => setStep(step + 1)} style={blueButtonStyle}>次の単語</button>
            ) : (
              cameFromStart ? (
                <button onClick={() => { setParagraphIndex(0); setStep(paragraphBase); setCameFromStart(false); }} style={blueButtonStyle}>段落穴埋めへ</button>
              ) : reviewFinishedOnce ? (
                <button onClick={() => nav(-1)} style={blueButtonStyle}>復習を終了する</button>
              ) : (
                <button onClick={() => { setParagraphIndex(0); setStep(paragraphBase); }} style={blueButtonStyle}>段落穴埋めへ</button>
              )
            )}

            {/* 補助ボタン：「スライドを飛ばして段落へ」*/}
            {(!cameFromStart && !reviewFinishedOnce) && (
              <button onClick={() => { setParagraphIndex(0); setStep(paragraphBase); }} style={{ ...blueButtonStyle, backgroundColor: '#666' }}>スライドを飛ばして段落へ</button>
            )}
          </div>

        </div>
      )}

      {/* 段落穴埋め (paragraph flow) */}
      {step === paragraphBase && (
        <div style={{ maxWidth: 900 }}>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>段落穴埋め（{paragraphIndex + 1} / {PARAGRAPH_COUNT}）</h2>

          <div style={{ fontSize: 20, lineHeight: 1.8, border: '1px solid #ddd', padding: 20, borderRadius: 8, minHeight: 120 }}>
            {renderParts.map((p, i) => {
              if (typeof p === 'string') return <span key={i}>{p}</span>;
              const slotIndex = p.slotIndex;
              const placed = placedChoices[slotIndex];
              const status = slotResults[slotIndex] || 'idle';
              const bg = status === 'idle' ? '#fff' : status === 'correct' || status === 'revealed' ? '#c8f7c5' : '#f7c5c5';
              return (
                <React.Fragment key={i}>
                  <span onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, slotIndex)} style={{ display: 'inline-block', minWidth: 140, padding: '6px 10px', margin: '0 6px', border: '2px dashed #003366', borderRadius: 6, backgroundColor: bg, verticalAlign: 'middle' }}>
                    {placed === null ? <em style={{ color: '#666' }}>ここにドラッグ</em> : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 700 }}>{choiceWords[placed]}</div>
                        <button onClick={() => removeFromSlot(slotIndex)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                  </span>
                  {slotSuffixes[slotIndex] ? <span key={`suf-${i}`} style={{ marginLeft: 6, color: '#666', fontStyle: 'italic' }}>{slotSuffixes[slotIndex]}</span> : null}
                </React.Fragment>
              );
            })}
          </div>

          {/* choices */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>単語（ドラッグしてください）</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {choiceWords.map((w: string, i: number) => {
                const isPlaced = placedChoices.includes(i);
                return <ChoiceBox key={i} word={w} idx={i} disabled={isPlaced} />;
              })}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            {!graded && <button onClick={handleGrade} style={blueButtonStyle}>採点する</button>}

            {/* 解答を表示 は「間違いがあったときのみ」表示され、押すと answersRevealed=true に */}
            {showRevealButton && <button onClick={handleRevealAnswers} style={blueButtonStyle}>解答を表示</button>}

            {graded && (answersRevealed || !showRevealButton) && (
              <button onClick={() => gotoNextParagraphOrSummary()} style={blueButtonStyle}>{paragraphIndex + 1 < PARAGRAPH_COUNT ? '次の段落へ' : '結果を見る'}</button>
            )}

          </div>

          {graded && paragraphScore !== null && (<p style={{ marginTop: 18, fontSize: 18 }}>この段落の得点: {paragraphScore} / {slotCorrectWord.length}</p>)}
        </div>
      )}

      {/* 最終サマリ（30点満点へスケーリング） */}
      {step === summaryStep && (
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 20 }}>復習結果（30点満点）</h2>
          <div style={{ fontSize: 20, marginBottom: 12 }}>
            <p>段落合計 正答: {totalRawCorrect} / {totalRawPossible}</p>
            <p style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>合計スコア: {scaledScore30} / 30</p>
            <p style={{ fontSize: 18, marginTop: 8 }}>（生の正答率: {Math.round((totalRawCorrect / totalRawPossible) * 100)}%）</p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            {/* summary からスライドを見る場合は cameFromStart=false（なのでスライド中はスキップが表示される場合あり） */}
            <button onClick={() => { setCameFromStart(false); setStep(1); }} style={blueButtonStyle}>単語スライドを見る</button>

            {/* 「復習を終了する」を押したら、ローカルにフラグを保存 -> 次回以降はスライド中のスキップが消えます */}
            <button onClick={() => { localStorage.setItem(`review_done_${lessonId}`, '1'); setReviewFinishedOnce(true); nav(-1); }} style={blueButtonStyle}>復習を終了する</button>
          </div>
        </div>
      )}

    </div>
  );
}
