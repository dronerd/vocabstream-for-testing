import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToTop = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault?.();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="landing-root" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <style>{`
        :root{
          --accent:#234E52;
          --muted:#666;
          --page-bg: #eef3f6;
          --card-bg: #ffffff;
          --chip-bg: #f1f3f4;
          --btn-bg: #0B3D91;
          --card-border: rgba(11,61,145,0.06);
          --radius: 12px;
        }

        /* reset / layout */
        *{box-sizing:border-box}
        html,body,#root{height:100%; margin:0; padding:0; background:var(--page-bg)}
        .landing-root{color:#222;width:100%;min-height:100vh;overflow-x:hidden;background:transparent}

        /* responsive base font using clamp */
        :root { --base-font: clamp(13px, 1.8vw, 16px); }
        .landing-root{font-size:var(--base-font)}

        /* Hero */
        .hero{padding:20px 5vw 18px}
        .hero-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr;gap:14px;align-items:start}

        /* cards */
        .hero-card, .card{background:var(--card-bg);padding:16px;border-radius:var(--radius);box-shadow:0 6px 18px rgba(20,40,80,0.04); border: 1px solid var(--card-border)}

        /* profile (aside) */
        .profile-card{background:var(--card-bg);padding:12px;border-radius:var(--radius);display:flex;gap:12px;align-items:center;max-width:100%;border: 1px solid var(--card-border)}
        .profile-card img{flex:0 0 auto;width:56px;height:56px;border-radius:10px;object-fit:cover}
        .profile-meta{min-width:0;flex:1 1 auto;overflow:hidden}
        .profile-top-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .role-label{background:transparent;color:#000;font-weight:700;font-size:0.95em;white-space:nowrap}
        .profile-name{font-size:1.02em;font-weight:700;color:#222;text-decoration:none}

        h1{font-size: clamp(20px, 6vw, 36px); margin:6px 0;line-height:1.08}
        h2{font-size: clamp(15px, 2.6vw, 20px); margin:0 0 8px}
        p.lead{margin-top:8px;color:#444;font-size: clamp(13px, 2.2vw, 16px);max-width:980px}

        .chips{margin-top:10px;display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:6px}
        .chip{background:var(--chip-bg);padding:8px 12px;border-radius:999px;font-size:13px;color:#222;flex:0 0 auto}

        main{width:100%;padding:18px 5vw}
        .grid-stack{max-width:1100px;margin:0 auto;display:grid;gap:14px}

        footer{padding:18px;text-align:center;color:var(--muted);font-size:13px}
        a.inline-link{color:var(--accent);text-decoration:underline}

        /* Buttons: stack on small screens, inline on larger */
        .btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;flex-direction:column}
        .btn-primary, .btn-secondary {
          appearance:none;border:0;cursor:pointer;padding:12px 14px;border-radius:12px;font-weight:700;font-size: clamp(14px, 1.6vw, 15px);min-height:44px;display:inline-flex;align-items:center;justify-content:center;width:100%;
        }
        .btn-primary{background:var(--btn-bg);color:#fff}
        .btn-secondary{background:transparent;border:1px solid rgba(0,0,0,0.06);color:#222}

        /* social */
        .social-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        .social-btn{background:var(--btn-bg);color:#fff;padding:8px 12px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:8px}
        .social-btn.secondary{background:transparent;color:var(--btn-bg);border:1px solid var(--btn-bg)}

        /* bio */
        .bio{color:#444;font-size: clamp(13px, 1.6vw, 15px);line-height:1.6;margin-top:8px;overflow-wrap:anywhere}
        .email{margin-top:6px;margin-bottom:12px;font-size:0.95em}

        /* focus styles */
        .btn-primary:focus, .btn-secondary:focus, .social-btn:focus, a:focus{outline:3px solid rgba(11,61,145,0.16);outline-offset:2px}

        /* larger screens adjustments */
        @media(min-width:760px){
          .hero{padding:36px 6vw 28px}
          .hero-inner{grid-template-columns:1fr 320px;gap:20px}
          .btn-row{flex-direction:row}
          .btn-primary, .btn-secondary{width:auto;min-width:140px}
          .profile-card{flex-direction:column;align-items:flex-start;padding:18px;border-radius:14px}
          .profile-card img{width:76px;height:76px}
          .profile-meta{width:100%}
          /* make aside sticky so it stays visible on larger viewports */
          .profile-card{position:sticky;top:24px}
        }

        /* very large screens */
        @media(min-width:1100px){
          .hero-inner{max-width:1200px}
          .grid-stack{grid-template-columns:repeat(2, minmax(0,1fr));gap:18px}
        }

        /* small-screen polish */
        @media(max-width:420px){
          .profile-card img{width:48px;height:48px}
          h1{font-size:20px}
        }

        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
      `}</style>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-inner">
          <div className="hero-card" role="region" aria-labelledby="hero-title">
            <h1 id="hero-title">〜あなたの未来に、英語の力を〜</h1>
            <p className="lead">
              効率的に英語を学び、世界で活躍する力を身につける。Project Fluenceはそんな学びを応援する個人プロジェクトです。最新情報はNoteをフォローしてください。
            </p>

            <div className="btn-row" role="navigation" aria-label="Primary actions">
              <button
                onClick={() => { navigate("/"); scrollToTop(); }}
                className="btn-primary"
                aria-label="アプリを使用する"
              >
                アプリを使用する
              </button>

              <a
                href="https://projectfluence.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                role="button"
                aria-label="Project Fluenceのホームページ（新しいタブで開く）"
              >
                ホームページ
              </a>

              <a
                href="https://note.com/projectfluence"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                role="button"
                aria-label="Note をフォロー（新しいタブで開く）"
              >
                Note をフォロー
              </a>
            </div>

            <p style={{ marginTop: 10, fontSize: "0.9em" }}>
              *大学生による個人プロジェクトのため、アプリの機能が安定していない可能性があります。ご意見やフィードバックは大歓迎です。
            </p>

            <div className="chips" aria-hidden>
              <span className="chip">中級〜超上級語彙</span>
              <span className="chip">ビジネス表現</span>
              <span className="chip">留学で使う表現</span>
              <span className="chip">英語スラング</span>
              <span className="chip">穴埋め復習</span>
            </div>
          </div>

          <aside className="profile-card" aria-labelledby="profile-title">
            <img src="/profile.JPG" alt="Yuto Kuroki" loading="lazy" />

            <div className="profile-meta">
              <div className="profile-top-row" aria-hidden>
                <span className="role-label">創設者 / 開発・運営</span>
                <a className="profile-name" href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer">黒木 勇人</a>
              </div>

              <div style={{ marginTop: 6, fontSize: "0.95em" }}>早稲田大学 基幹理工学部 1年</div>
              <div className="email">yutokuroki.projectfluence@gmail.com</div>

              <p className="bio" aria-live="polite">
                英語を英語で学ぶ効率的な方法を追求し、中学2年時に英検1級に合格（上位1%）。現在はTOEFL iBT 116/120、TOEIC 990/990。ドイツ語はC1取得。専門は情報工学。ISEFなど国際イベントでの発表経験あり。
              </p>

              <div className="social-row">
                <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer" className="social-btn">プロフィール</a>
                <a href="https://www.linkedin.com/in/yuto-kuroki-a5b32b383/" target="_blank" rel="noopener noreferrer" className="social-btn">LinkedIn</a>
                <a href="https://note.com/projectfluence" target="_blank" rel="noopener noreferrer" className="social-btn">Note</a>
                <a href="https://github.com/dronerd" target="_blank" rel="noopener noreferrer" className="social-btn">GitHub</a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main>
        <div className="grid-stack">
          <article className="card" role="article" aria-labelledby="vocabstream-title">
            <h2 id="vocabstream-title">VocabStream とは</h2>
            <p style={{ marginTop: 0, color: "#444", lineHeight: 1.8 }}>
              VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <span className="chip">中級〜超上級語彙</span>
              <span className="chip">ビジネス表現</span>
              <span className="chip">留学で使う表現</span>
            </div>
          </article>

          <article className="card" role="article" aria-labelledby="why-title">
            <h2 id="why-title">なぜ英語を学ぶのか</h2>
            <p style={{ color: "#444", lineHeight: 1.8 }}>
              英語は人生で非常に役立つスキルです。成績や受験、大学での研究、社会人になってからの海外とのやり取りや情報収集など、活用範囲が広く効果が長く続きます。翻訳を待たず世界中の情報にアクセスでき、キャリアアップにもつながります。
            </p>
          </article>

          <article className="card" role="article" aria-labelledby="method-title">
            <h2 id="method-title">効果的な学習 — 単語は英語で学ぶ</h2>
            <p style={{ color: "#444", lineHeight: 1.8 }}>
              単語を日本語訳で覚えるのではなく、英語の定義や例文と結びつけます。
              例: comfortable → “A chair is comfortable if it feels nice and soft.”
              この学習法を効率化するために、VocabStreamを開発しました。
            </p>
          </article>

          <article className="card" role="article" aria-labelledby="features-title">
            <h2 id="features-title">主な機能</h2>
            <ul style={{ marginTop: 8, color: "#444", lineHeight: 1.7 }}>
              <li>中級〜超上級の単語・熟語の学習</li>
              <li>ビジネス表現の学習</li>
              <li>留学で使う表現の学習</li>
              <li>英語スラングの学習</li>
              <li>穴埋めによる復習機能</li>
            </ul>
          </article>
        </div>

        <div style={{ maxWidth: 1100, margin: "18px auto 0" }}>
          <a href="/privacy" target="_blank"><strong>Privacy Policy</strong></a>
        </div>
      </main>

      <footer style={{ padding: 20, textAlign: "center", color: "#666" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>© Project Fluence — VocabStream</div>
      </footer>
    </div>
  );
}
