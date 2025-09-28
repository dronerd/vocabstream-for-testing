import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

// Static mapping of genre titles (copied / matched from your backend)
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

// Helper to generate placeholder lesson objects in-frontend
function makeLessons(genreId: string, count: number): Lesson[] {
  const arr: Lesson[] = [];
  for (let i = 1; i <= count; i++) {
    arr.push({ id: `${genreId}-lesson-${i}`, title: `Lesson ${i}` });
  }
  return arr;
}

// Configure how many placeholder lesson boxes to show per genre.
// Edit these numbers to match how many lessons you actually want visible in the frontend.
const LESSON_COUNT_BY_GENRE: Record<string, number> = {
  // word levels: show 12 lessons each by default
  "word-intermediate": 71,
  "word-high-intermediate": 71,
  "word-advanced": 71,
  "word-proficiency": 71,

  // idioms: fewer by default
  "idioms-intermediate": 71,
  "idioms-high-intermediate": 71,
  "idioms-advanced": 71,
  "idioms-proficiency": 71,

  // business
  "business-entry": 71,
  "business-intermediate": 71,
  "business-global": 71,

  // specialized categories
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

    // Use the static title mapping (fallback to raw id)
    setGenreTitle(STATIC_GENRE_TITLES[genreId] || genreId);

    // Generate static lesson boxes for this genre (client-side)
    const count = LESSON_COUNT_BY_GENRE[genreId] ?? 10; // default to 10 if not configured
    const generated = makeLessons(genreId, count);
    setLessons(generated);
  }, [genreId]);

  if (!genreId) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>ジャンルが指定されていません</h2>
        <button
          onClick={() => nav("/learn")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#555",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ジャンル選択に戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>{genreTitle} - レッスン一覧</h2>
      <button
        onClick={() => nav("/learn")}
        style={{
          marginBottom: 20,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ジャンル選択に戻る
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {lessons.map((l) => (
          <div
            key={l.id}
            style={{
              flex: "0 0 calc(25% - 16px)",
              backgroundColor: "#cce7ff",
              borderRadius: 12,
              padding: 20,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>最終テスト: —</div>
            </div>

            <button
              onClick={() => nav(`/lesson/${l.id}`)}
              style={{
                marginTop: 12,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#1E3A8A",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#163375")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
            >
              開始
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
