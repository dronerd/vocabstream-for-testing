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
        <h2 className="page-title">学習分野が指定されていません</h2>
        <button className="back-btn" onClick={() => nav("/learn")}>学習する分野の一覧に戻る</button>
        <style>{styles}</style>
      </div>
    );

  return (
    <div className="page-root">
      <h2 className="page-title smaller">{genreTitle} - レッスン一覧</h2>
      <button className="back-btn" onClick={() => nav("/learn")}>学習する分野の一覧に戻る</button>

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
            <div className="lesson-content">
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
:root{
  --card-gap: 12px;
  --card-radius: 10px;
  --card-padding: 12px;
}

/* Page layout */
.page-root {
  padding: 10px 8px;
  padding-top: 92px;
  font-family: Inter, Arial, sans-serif;
}
.page-title {
  font-size: 24px;
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

/* Grid */
.lessons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-gap);
  justify-content: space-between;
}

/* Card: blue version with previous original sizing */
.lesson-card {
  flex: 0 0 calc(25% - var(--card-gap)); /* FOUR per row by default */
  background: linear-gradient(135deg, #dbeafe 0%, #a8d1ff 100%);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 12px rgba(11,75,155,0.08);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  cursor: pointer;
  min-width: 100px;

  /* follow previous original size */
  min-height: 130px;
}

/* Hover / focus */
.lesson-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(11,75,155,0.12);
}
.lesson-card:focus { outline: 3px solid rgba(11,75,155,0.12); }

/* Content */
.lesson-content { padding: 0; } /* padding already on card */
.lesson-title { font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #06204a; }
.lesson-meta { font-size: 14px; color: #0d2a56; }

/* Full-width dark blue button */
.start-btn {
  width: 100%;
  border: none;
  border-top: 1px solid rgba(255,255,255,0.10);
  background: #04275f; /* darker solid blue */
  padding: 12px 0;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.08s ease;
}

.start-btn:hover { background: #02183f; transform: translateY(-1px); }

/* Keep 4 columns on large and medium large screens (user requested 4 instead of 3) */
@media (min-width: 1200px) {
  :root { --card-gap: 16px; --card-padding: 14px; }
  .lesson-card {
    flex: 0 0 calc(25% - var(--card-gap));
    min-height: 160px; /* slightly taller on very large screens */
    padding: var(--card-padding);
  }
}

/* Ensure 4 columns also for mid-large screens (no 3-column behavior) */
@media (min-width: 900px) and (max-width: 1199px) {
  .lesson-card {
    flex: 0 0 calc(25% - var(--card-gap)); /* keep 4 per row */
    min-height: 140px;
  }
}

/* Mobile: two-per-row */
@media (max-width: 520px) {
  .lessons-grid { gap: 8px; }
  .lesson-card {
    flex: 0 0 calc(50% - 8px);
    padding: 10px;
    min-height: 110px;
  }
  .lesson-title { font-size: 16px; }
  .lesson-meta { font-size: 12px; }
  .start-btn { font-size: 13px; padding: 10px 0; }
}

/* Touch devices: disable hover transform */
@media (hover: none) {
  .lesson-card:hover { transform: none; }
}
`;
