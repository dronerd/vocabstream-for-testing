import React from "react"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();


  const buttonStyles = [ //リストを作っていて、あとで使用する。インデックスで呼び出す
  { backgroundColor: "#6fa8dc" }, // 柔らかいブルー
  { backgroundColor: "#e9967a" }, // サーモン系のレッド
  { backgroundColor: "#77dd77" }, // パステルグリーン
  { backgroundColor: "#b0b0b0" }, // ライトグレー
  ];

  const options = [ //リストを作っていて、あとで使用する
    { label: "単語を学習する", path: "/learn" },
    { label: "単語を復習する", path: "/review" },
    { label: "統計を見る", path: "/stats" },
    { label: "このアプリについて", path: "/settings" },
  ];

  return (
    
    <div style={{ padding: 20, paddingTop: 92, fontFamily: "sans-serif" }}>
      {/* Main heading */}
      <h1 style={{ fontSize: 50, margin: "4px 0" }}>Home</h1>

      {/* Subtitle / description */}
      <p style={{ 
        fontSize: 20, 
        color: "black", 
        margin: "8px 0 20px 0", 
        lineHeight: 1.6 
      }}>
      <strong>VocabStream</strong>
      は、
      <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer" style={{textDecoration: "underline" }}>
      <strong>黒木勇人</strong>
      </a>
      が創設し個人で開発・運営している
      <a href="https://projectfluence.vercel.app" target="_blank" rel="noopener noreferrer" style={{textDecoration: "underline" }}>
      <strong>「Project Fluence」</strong>
      </a>
      の一環として制作された、無料の英単語学習アプリです。
      </p>

      {/* User info box */}
      <div
        style={{
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 12,
          marginBottom: 12,
          fontSize: 30,
        }}
      >
        <div>Level: <strong>{user?.level ?? "—"}</strong></div>
        <div>累計獲得単語数: <strong>{user?.total_words ?? 0}</strong></div>
      </div>

      {/* Option buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => nav(opt.path)}
            style={{
              ...buttonStyles[idx],
              padding: 40,
              border: "none",
              borderRadius: 12,
              color: "#1c1c1c",
              
              fontSize: 40,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <a href="/privacy" target="_blank"><strong>Privacy Policy</strong></a>
    </div>
  );
}
