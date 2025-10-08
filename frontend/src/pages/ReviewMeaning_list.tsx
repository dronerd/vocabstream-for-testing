import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type ReviewItem = {
  id: string;
  title: string;
  subtitle?: string;
};

// Reuse the same static genre title map from LessonList so the UI remains consistent
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

// Configure how many review boxes to show per genre (adjustable)
const REVIEW_COUNT_BY_GENRE: Record<string, number> = {
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

// Helper to generate frontend-only review items
function makeReviewItems(genreId: string, count: number): ReviewItem[] {
  const arr: ReviewItem[] = [];
  for (let i = 1; i <= count; i++) {
    arr.push({
      id: `${genreId}-review-fillin-${i}`,
      title: `Fill-in Review ${i}`,
      subtitle: `練習問題 ${i}`,
    });
  }
  return arr;
}

export default function ReviewFillinList() {
  const { genreId } = useParams<{ genreId: string }>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    if (!genreId) return;

    setGenreTitle(STATIC_GENRE_TITLES[genreId] || genreId);

    const count = REVIEW_COUNT_BY_GENRE[genreId] ?? 10;
    const generated = makeReviewItems(genreId, count);
    setItems(generated);
  }, [genreId]);

  if (!genreId) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>ジャンルが指定されていません</h2>
        <button
          onClick={() => nav("/review")}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#555",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          レビュー一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, paddingTop: 92 }}>
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>{genreTitle} - Fill-in レビュー</h2>
      <button
        onClick={() => nav("/review")}
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
        レビュー一覧に戻る
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              flex: "0 0 calc(25% - 16px)",
              backgroundColor: "#fef3c7",
              borderRadius: 12,
              padding: 20,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
              transition: "transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{it.subtitle}</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => nav(`/review/fillin/${it.id}`)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#065f46",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                開始
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
