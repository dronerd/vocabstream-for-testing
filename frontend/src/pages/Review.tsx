import React from "react";
import { useNavigate } from "react-router-dom";

export default function Review() {
  const nav = useNavigate();

  // LearnGenresと統一感のある色
  const buttonColors = ["#ffcccc", "#fff5cc", "#ccffcc", "#cce5ff"];

  // ボタンスタイル
  const buttonStyle: React.CSSProperties = {
    padding: "20px",
    fontSize: "24px",
    borderRadius: "10px",
    border: "2px solid #666",
    cursor: "pointer",
    width: "100%",
    height: "100px",
    fontWeight: "bold",
    color: "#333",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: 32, marginBottom: 14 }}>単語の復習</h2>
      <h3 style={{ fontSize: 26, marginBottom: 20 }}>復習方法</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <button
          style={{ ...buttonStyle, backgroundColor: buttonColors[0] }}
          onClick={() => nav("/review_meaning")}
        >
          例文ミニテスト方式
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: buttonColors[1] }}
          onClick={() => nav("/review_meaning_weak")}
        >
          例文ミニテスト苦手単語集
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: buttonColors[2] }}
          onClick={() => nav("/review_fillin")}
        >
          文章穴埋め方式
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: buttonColors[3] }}
          onClick={() => nav("/reading_comprehension")}
        >
          実践読解テスト
        </button>
      </div>
    </div>
  );
}
