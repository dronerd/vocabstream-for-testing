import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

const STATIC_GENRE_TITLES: Record<string, string> = {
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
};

function makeLessons(genreId: string, count: number): Lesson[] {
  const arr: Lesson[] = [];
  for (let i = 1; i <= count; i++) arr.push({ id: `${genreId}-lesson-${i}`, title: `Lesson ${i}` });
  return arr;
}

const LESSON_COUNT_BY_GENRE: Record<string, number> = {
  "word-intermediate": 71,
  "word-high-intermediate": 71,
  "word-advanced": 71,
  "word-proficiency": 71,
  "idioms-intermediate": 71,
  "idioms-high-intermediate": 71,
  "idioms-advanced": 71,
  "idioms-proficiency": 71,
  "business-entry": 71,
  "business-intermediate": 71,
  "business-global": 71,
  "computer-science": 71,
  "medicine": 71,
  "economics-business": 71,
  "environment": 71,
  "law": 71,
  "engineering": 71,
};

export default function LessonList() {
  const { genreId } = useParams<{ genreId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    if (!genreId) return;
    setGenreTitle(STATIC_GENRE_TITLES[genreId] || genreId);
    const count = LESSON_COUNT_BY_GENRE[genreId] ?? 10;
    setLessons(makeLessons(genreId, count));
  }, [genreId]);

  if (!genreId)
    return (
      <div className="page-root">
        <h2 className="page-title">ジャンルが指定されていません</h2>
        <button className="back-btn" onClick={() => nav("/learn")}>ジャンル選択に戻る</button>
        <style>{styles}</style>
      </div>
    );

  return (
    <div className="page-root">
      <h2 className="page-title smaller">{genreTitle} - レッスン一覧</h2>
      <button className="back-btn" onClick={() => nav("/learn")}>ジャンル選択に戻る</button>

      <div className="lessons-grid">
        {lessons.map((l) => (
          <article
            key={l.id}
            className="lesson-card"
            onClick={() => nav(`/lesson/${l.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && nav(`/lesson/${l.id}`)}
          >
            <div className="lesson-info">
              <div className="lesson-title">{l.title}</div>
              <div className="lesson-meta">最終テスト: —</div>
            </div>

            <button
              className="start-btn"
              onClick={(ev) => {
                ev.stopPropagation();
                nav(`/lesson/${l.id}`);
              }}
            >
              開始
            </button>
          </article>
        ))}
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.page-root {
  padding: 10px 8px; /* reduced side padding */
  padding-top: 92px;
  font-family: Inter, Arial, sans-serif;
}
.page-title {
  font-size: 24px; /* smaller title */
  margin-bottom: 10px;
}
.page-title.smaller {
  font-size: 22px;
}
.back-btn {
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  border: none;
  background-color: #555;
  color: #fff;
  cursor: pointer;
}

.lessons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* reduced gap */
  justify-content: space-between;
}

.lesson-card {
  flex: 0 0 calc(25% - 8px); /* ensure 4 fit per row */
  background-color: #cce7ff;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  transition: transform 0.12s ease;
  cursor: pointer;
  min-width: 80px;
}

.lesson-card:focus { outline: 2px solid rgba(30,58,138,0.3); }
.lesson-card:hover { transform: translateY(-4px); }

.lesson-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.lesson-meta { font-size: 10px; color: #666; }
.start-btn {
  margin-top: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border: none;
  background-color: #1E3A8A;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 12px;
}

@media (max-width: 520px) {
  .lesson-card { flex: 0 0 calc(25% - 6px); padding: 8px; }
  .lesson-title { font-size: 12px; }
  .lesson-meta { font-size: 9px; }
  .start-btn { font-size: 11px; padding: 5px 6px; }
}
`;
