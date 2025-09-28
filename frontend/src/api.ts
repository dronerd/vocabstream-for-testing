// src/api.ts (TypeScript - 型注釈を追加したバージョン)

const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

async function tryFetchJson(path: string): Promise<any | null> {
  try {
    const r = await fetch(path);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

/* static genres (unchanged) */
const STATIC_GENRES = [
  { id: "word-intermediate", title: "単語初級~中級 (CEFR A2~B1)" },
  { id: "word-high-intermediate", title: "単語中上級 (CEFR B2)" },
  { id: "word-advanced", title: "単語上級 (CEFR C1)" },
  { id: "word-proficiency", title: "単語熟達 (CEFR C2)" },
  { id: "idioms-intermediate", title: "熟語初級~中級 (CEFR A2~B1)" },
  { id: "idioms-advanced", title: "熟語上級 (CEFR C1)" },
  { id: "idioms-high-intermediate", title: "熟語中上級 (CEFR B2)" },
  { id: "idioms-proficiency", title: "熟語熟達 (CEFR C2)" },
  { id: "business-entry", title: "ビジネス入門レベル" },
  { id: "business-intermediate", title: "ビジネス実践レベル" },
  { id: "business-global", title: "ビジネスグローバルレベル" },
  { id: "computer-science", title: "Computer Science & Technology" },
  { id: "medicine", title: "Medicine & Health" },
  { id: "economics-business", title: "Business & Economics" },
  { id: "environment", title: "Environmental Science & Sustainability" },
  { id: "law", title: "Law & Politics" },
  { id: "engineering", title: "Engineering" },
];

/* ------------------------
   Auth
   ------------------------*/
export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function apiMe(token: string) {
  const res = await fetch(`${API_BASE}/me?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error("unauthorized");
  return res.json();
}

/* ------------------------
   Genres
   ------------------------*/
export async function apiGenres() {
  const backend = await tryFetchJson(`${API_BASE}/genres`);
  if (backend && backend.genres) return backend;
  return { genres: STATIC_GENRES };
}

/* ------------------------
   Lessons list for a genre
   ------------------------*/
export async function apiLessons(genreId: string) {
  const backend = await tryFetchJson(`${API_BASE}/lessons/${encodeURIComponent(genreId)}`);
  if (backend && backend.lessons) return backend;

  const lessons: { id: string; title: string; progress?: number }[] = [];
  let consecutiveMisses = 0;
  const MAX_TRIES = 200;

  for (let i = 1; i <= MAX_TRIES; i++) {
    const candidates = [
      `/data/${genreId}/Lesson${i}.json`,
      `/data/${genreId}/lesson${i}.json`,
      `/data/${genreId}/Lesson${parseInt(String(i), 10)}.json`,
      `/data/${genreId}/lesson${parseInt(String(i), 10)}.json`,
    ];

    let found = false;
    for (const p of candidates) {
      const json = await tryFetchJson(p);
      if (json) {
        lessons.push({ id: `${genreId}-lesson-${i}`, title: `Lesson ${i}`, progress: 0 });
        found = true;
        consecutiveMisses = 0;
        break;
      }
    }

    if (!found) consecutiveMisses++;

    if (consecutiveMisses >= 3 && i >= 6) break;
  }

  return { lessons };
}

/* ------------------------
   Lesson detail
   ------------------------*/
export async function apiLessonDetail(lessonId: string) {
  const backend = await tryFetchJson(`${API_BASE}/lesson/${encodeURIComponent(lessonId)}`);
  if (backend && (backend.words || backend.raw || backend.title)) return backend;

  if (!lessonId.includes("-lesson-")) return { words: [] };
  const [genreFolder, numStr] = lessonId.split("-lesson-");
  const candidates = [
    `/data/${genreFolder}/Lesson${numStr}.json`,
    `/data/${genreFolder}/lesson${numStr}.json`,
    `/data/${genreFolder}/Lesson${parseInt(numStr, 10)}.json`,
    `/data/${genreFolder}/lesson${parseInt(numStr, 10)}.json`,
  ];

  for (const p of candidates) {
    const json = await tryFetchJson(p);
    if (json) return json;
  }

  return { words: [] };
}

/* ------------------------
   Lesson quiz (try backend, else generate client-side)
   ------------------------*/
export async function apiLessonQuiz(lessonId: string) {
  const backend = await tryFetchJson(`${API_BASE}/lesson/${encodeURIComponent(lessonId)}/quiz`);
  if (backend && backend.questions) return backend;

  const lesson = await apiLessonDetail(lessonId);
  try {
    const questions = generateQuizFromLesson(lesson);
    return { lesson_id: lessonId, questions };
  } catch (e) {
    return { lesson_id: lessonId, questions: [] };
  }
}

/* ------------------------
   Types for quiz generator
   ------------------------*/
type QuizQuestion = {
  word: string;
  sentence: string;
  blank_sentence: string;
  choices: string[];
  answer_index: number;
};

type PoolItem = { word: string; example: string };

/* ------------------------
   Client-side quiz generator
   ------------------------*/
function generateQuizFromLesson(lesson: any): QuizQuestion[] {
  const words = Array.isArray(lesson?.words) ? lesson.words : [];
  const pool: PoolItem[] = words
    .filter((w: any): w is { word: string; example?: string } => !!w && typeof w.word === "string")
    .map((w: any) => ({ word: w.word, example: w.example || "" }));

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
    const otherWords: string[] = pool.map((p: PoolItem) => p.word).filter((w: string) => w !== correct);
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
