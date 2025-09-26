import React, { useEffect, useState } from "react";
import { apiGenres } from "../api";
import { useNavigate } from "react-router-dom";

type Lesson = {
  id: string;
  title: string;
};

type LevelOrder = {
  [key: string]: string[];
};

export default function TestPage() {
  const [genres, setGenres] = useState<Lesson[]>([]);
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const nav = useNavigate();

  useEffect(() => {
    apiGenres().then((res) => setGenres(res.genres || []));
  }, []);

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      setIsSmall(window.innerWidth <= 720);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const categories: Record<string, Lesson[]> = {
    単語: genres.filter((g) => g.id.toLowerCase().startsWith("word")),
    熟語: genres.filter((g) => g.id.toLowerCase().startsWith("idioms")),
    ビジネス表現: genres.filter((g) => g.id.toLowerCase().startsWith("business")),
    専門用語: genres.filter(
      (g) =>
        !g.id.toLowerCase().startsWith("word") &&
        !g.id.toLowerCase().startsWith("idioms") &&
        !g.id.toLowerCase().startsWith("business")
    ),
  };

  const lessonImages: Record<string, string> = {
    "computer-science": "/CS.png",
    "medicine": "/Medicine.png",
    "law": "/Law.png",
    "economics-business": "/Business.png",
    "environment": "/Environment.png",
    "engineering": "/Engineering.png",
  };

    
  const levelOrder: LevelOrder = {
    単語: ["word-intermediate", "word-high-intermediate", "word-advanced", "word-proficiency"],
    熟語: ["idioms-intermediate", "idioms-high-intermediate", "idioms-advanced", "idioms-proficiency"],
    ビジネス表現: ["business-entry", "business-intermediate", "business-global"],
  };
 
  const levelColors = ["#ffcccc", "#fff5cc", "#ccffcc", "#cce5ff"];
  const termColors = ["#ffe4b5", "#d8bfd8", "#afeeee", "#f5deb3", "#e6e6fa", "#f08080"];

  function cardBackground(categoryName: string, index: number) {
    return levelOrder[categoryName]
      ? levelColors[index] || "#f9f9f9"
      : termColors[index % termColors.length];
  }

  return (
    <div style={{ padding: isSmall ? 12 : 20 }}>
      {/* 復習方法に戻るボタン */}
      <button
        onClick={() => nav("/review")}
        style={{
          marginBottom: 5,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        復習方法選択に戻る
      </button>

      <h2 style={{ fontSize: isSmall ? 20 : 28, marginBottom: 5 }}>実践読解テスト</h2>
      <h3 style={{ fontSize: isSmall ? 20 : 28, marginBottom: 10 }}>復習する分野を選択</h3>

      {Object.entries(categories).map(([categoryName, lessons]) => {
        const order = levelOrder[categoryName];
        if (order) {
          lessons.sort((a, b) => {
            const idxA = order.indexOf(a.id.toLowerCase());
            const idxB = order.indexOf(b.id.toLowerCase());
            return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
          });
        }

        return (
          <div
            key={categoryName}
            style={{
              marginTop: 10,
              marginBottom: 20,
              padding: 12,
              background: "#fff",
              border: "3px solid #666",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
                flexDirection: isSmall ? "column" : "row",
                gap: isSmall ? 8 : 10,
                textAlign: isSmall ? "center" : "left",
              }}
            >
              <h3 style={{ fontSize: isSmall ? 18 : 24, fontWeight: "bold", margin: 0 }}>
                {categoryName}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isSmall ? "1fr" : "repeat(4, minmax(0, 1fr))",
                gap: 10,
                width: "100%",
              }}
            >
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  onClick={() => nav("/reading_comprehension_list")}
                  style={{
                    padding: 12,
                    background: cardBackground(categoryName, index),
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    minHeight: ["英検", "TOEFL", "TOEIC"].includes(categoryName) ? 50 : "auto",
                    flexDirection: isSmall ? "column" : "row",
                    textAlign: isSmall ? "center" : "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {categoryName === "専門用語" && (
                      <img
                        src={lessonImages[lesson.id.toLowerCase()] || "/images/default.jpg"}
                        alt={lesson.title}
                        style={{
                          width: isSmall ? 48 : 60,
                          height: isSmall ? 48 : 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    <strong style={{ fontSize: isSmall ? 16 : 18 }}>{lesson.title}</strong>
                  </div>
                  <div
                    style={{
                      fontSize: isSmall ? 14 : 16,
                      fontWeight: "bold",
                      color: "#333",
                      marginTop: isSmall ? 8 : 0,
                    }}
                  >
                    進捗: 0%
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
