import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiLessons, apiGenres } from "../api";

export default function LessonList() {
  const { genreId } = useParams<{ genreId: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const nav = useNavigate();

  useEffect(() => {
    if (!genreId) return;
    apiLessons(genreId).then((res) => setLessons(res.lessons || []));
  }, [genreId]);

  useEffect(() => {
    if (!genreId) return;
    apiGenres().then((res) => {
      const genre = res.genres.find((g: any) => g.id === genreId);
      setGenreTitle(genre?.title || genreId);
    });
  }, [genreId]);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>{genreTitle} - レッスン一覧</h2>
      <button
        onClick={() => nav("/review_fillin")}
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
              backgroundColor: "#cce7ff", // light blue
              borderRadius: 12,
              padding: 20,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
                {l.title}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>最終テスト: —</div>
            </div>

            <button
              onClick={() => nav(`/review_fillin_lesson/${l.id}`)}
              style={{
                marginTop: 12,
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "#1E3A8A", // darkish blue
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
