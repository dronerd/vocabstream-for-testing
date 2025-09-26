import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        color: "#222",
        width: "100%",                 
        minHeight: "100vh",
        boxSizing: "border-box",      
        overflowX: "hidden",         
        margin: 0,
        padding: 0,
      }}
    >
      {/* Hero (full width background, content centered) */}
      <section
        style={{
          padding: "64px 6vw",
          textAlign: "left",
          background: "linear-gradient(90deg, #f7fbff 0%, #ffffff 100%)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
          <h1 style={{ fontSize: 48, margin: 6, lineHeight: 1.02 }}>〜あなたの未来に、英語の力を〜</h1>
          <p style={{ marginTop: 14, color: "#444", fontSize: 20, maxWidth: 980, wordBreak: "break-word" }}>
            効率的に英語を学び、世界で活躍する力を身につける。Project Fluenceはそんな学びを応援する個人プロジェクトです。最新情報はNoteをフォローしてください。
          </p>

          <div style={{ marginTop: 30, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 26px",
                borderRadius: 10,
                border: "none",
                background: "#234E52",
                color: "white",
                fontSize: 17,
                cursor: "pointer",
                boxShadow: "0 8px 22px rgba(35,78,82,0.12)",
              }}
            >
              ログインして使用する
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                padding: "14px 22px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                color: "#222",
                fontSize: 17,
                cursor: "pointer",
              }}
            >
              ログインせずに試す
            </button>

            <button
              onClick={() => navigate("/note")}
              style={{
                padding: "14px 22px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                color: "#222",
                fontSize: 17,
                cursor: "pointer",
              }}
            >
              Note をフォロー
            </button>

            <p style={{ margin: 0, color: "#666", fontSize: 15 }}>*ログインして使用すると進歩状況を保存できます</p>
          </div>
        </div>
      </section>

      {/* Main content: single-column, stacked */}
      <main style={{ width: "100%", padding: "40px 6vw", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gap: 26, maxWidth: 1100, margin: "0 auto", boxSizing: "border-box" }}>
          <article style={{ background: "white", padding: 28, borderRadius: 14, boxShadow: "0 8px 28px rgba(20,40,80,0.04)" }}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 26 }}>VocabStream とは</h2>
            <p style={{ marginTop: 0, color: "#444", lineHeight: 1.8, fontSize: 18, wordBreak: "break-word" }}>
              VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。
              英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <span style={{ background: "#f0f6f6", padding: "10px 14px", borderRadius: 10, fontSize: 15 }}>中級〜超上級語彙</span>
              <span style={{ background: "#f0f6f6", padding: "10px 14px", borderRadius: 10, fontSize: 15 }}>ビジネス表現</span>
              <span style={{ background: "#f0f6f6", padding: "10px 14px", borderRadius: 10, fontSize: 15 }}>留学で使う表現</span>
              <span style={{ background: "#f0f6f6", padding: "10px 14px", borderRadius: 10, fontSize: 15 }}>英語スラング</span>
              <span style={{ background: "#f0f6f6", padding: "10px 14px", borderRadius: 10, fontSize: 15 }}>穴埋め復習</span>
            </div>
          </article>

          <article style={{ background: "white", padding: 28, borderRadius: 14, boxShadow: "0 8px 28px rgba(20,40,80,0.04)" }}>
            <h2 style={{ marginTop: 0, fontSize: 26 }}>なぜ英語を学ぶのか</h2>
            <p style={{ color: "#444", lineHeight: 1.8, fontSize: 18, wordBreak: "break-word" }}>
              英語は人生で非常に役立つスキルです。成績や受験、大学での研究、社会人になってからの海外とのやり取りや情報収集など、活用範囲が広く効果が長く続きます。
              翻訳を待たず世界中の情報にアクセスでき、キャリアアップにもつながります。
            </p>
          </article>

          <article style={{ background: "white", padding: 28, borderRadius: 14, boxShadow: "0 8px 28px rgba(20,40,80,0.04)" }}>
            <h2 style={{ marginTop: 0, fontSize: 26 }}>効果的な学習 — 単語は英語で学ぶ</h2>
            <p style={{ color: "#444", lineHeight: 1.8, fontSize: 18, wordBreak: "break-word" }}>
              単語を日本語訳で覚えるのではなく、英語の定義や例文と結びつけます。
              例: comfortable → “A chair is comfortable if it feels nice and soft.”
              この学習法を効率化するために、VocabStreamを開発しました。
            </p>
          </article>

          <article style={{ background: "white", padding: 28, borderRadius: 14, boxShadow: "0 8px 28px rgba(20,40,80,0.04)" }}>
            <h2 style={{ marginTop: 0, fontSize: 26 }}>主な機能</h2>
            <ul style={{ marginTop: 8, color: "#444", fontSize: 18, lineHeight: 1.7 }}>
              <li>中級〜超上級の単語・熟語の学習</li>
              <li>ビジネス表現の学習</li>
              <li>留学で使う表現の学習</li>
              <li>英語スラングの学習</li>
              <li>穴埋めによる復習機能</li>
            </ul>
          </article>

          <article style={{ background: "white", padding: 28, borderRadius: 14, boxShadow: "0 8px 28px rgba(20,40,80,0.04)" }}>
            <h2 style={{ marginTop: 0, fontSize: 26 }}>アプリ作成者・運営者</h2>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>黒木 勇人 (Yuto Kuroki)</p>
            <p style={{ margin: "6px 0", color: "#666", fontSize: 16 }}>早稲田大学 基幹理工学部 1年</p>

            <p style={{ color: "#444", lineHeight: 1.7, fontSize: 17, wordBreak: "break-word" }}>
              英語を英語で学ぶ効率的な方法を追求し、中学2年時に英検1級に合格（上位1%）。現在はTOEFL iBT 116/120、TOEIC 990/990。ドイツ語はC1取得。専門は情報工学。ISEFなど国際イベントでの発表経験あり。
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <a href="/profile" style={{ fontSize: 16, textDecoration: "none", color: "#234E52" }}>→ プロフィール</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" style={{ fontSize: 16, textDecoration: "none", color: "#234E52" }}>→ LinkedIn</a>
            </div>

            <p style={{ marginTop: 12, fontSize: 15, color: "#999" }}>
              連絡: ...@gmail.com
            </p>

            <p style={{ marginTop: 12, fontSize: 14, color: "#999" }}>
              ＊大学生による個人プロジェクトのため、アプリの機能が安定していない可能性があります。ご意見やフィードバックは大歓迎です。
            </p>
          </article>
        </div>
      </main>

      <footer style={{ padding: 20, textAlign: "center", color: "#666", fontSize: 15 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>© Project Fluence — VocabStream</div>
      </footer>
    </div>
  );
}
