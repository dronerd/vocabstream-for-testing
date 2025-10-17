import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToTop = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault?.();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="landing-root" style={{ padding: "8px 2mm", paddingTop: "92px", fontFamily: "Inter, Arial, sans-serif" }}>
      <style>{`
        :root{
          --accent:#234E52;
          --muted:#666;
          /* page background: deep navy gradient */
          --page-bg-1: #081230;
          --page-bg-2: #0f2740;
          --card-bg: #ffffff;
          --subcard-bg: #f1f5f8;
          --chip-bg: #f1f3f4;
          --btn-grad-a: #1e88ff;
          --btn-grad-b: #005ec2;
          --card-border: rgba(11,61,145,0.06);
          --radius: 14px;
          --container-max: 1200px;
          --hero-bottom-gap-mobile: 18px;
        }

        *{box-sizing:border-box}
        html,body,#root{height:100%; margin:0; padding:0; background: linear-gradient(180deg, var(--page-bg-1), var(--page-bg-2));}
        .landing-root{color:#111;width:100%;min-height:100vh;overflow-x:hidden;background:transparent}
        :root { --base-font: clamp(13px, 1.8vw, 16px); }
        .landing-root{font-size:var(--base-font)}

        /* HERO */
        .hero-wrap{padding:22px 3.5vw}
        .hero-card{background:linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,252,255,0.98));border-radius:20px;padding:28px;box-shadow:0 12px 36px rgba(2,6,23,0.28);border:1px solid var(--card-border);max-width:var(--container-max);margin:0 auto;width:100%;box-sizing:border-box;display:flex;align-items:flex-start;gap:18px}
        .hero-grid{display:grid;grid-template-columns:1fr;gap:18px;align-items:center}
        .hero-main{padding-right:8px;min-width:0}

        /* title row with logo */
        .hero-title-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .hero-logo{height:180px;width:auto;object-fit:contain}

        h1{font-size: clamp(26px, 4.8vw, 44px); margin:6px 0;line-height:1.02;overflow-wrap:break-word;word-break:break-word}
        p.lead{margin-top:8px;color:#444;font-size: clamp(14px, 1.9vw, 17px);max-width:980px;overflow-wrap:break-word}

        .actions{margin-top:18px;display:flex;gap:12px;flex-wrap:wrap}

        /* Primary CTA (same style as header) */
        .cta-btn {
          font-weight: 800;
          color: #fff;
          border: none;
          padding: 12px 18px;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, var(--btn-grad-a) 0%, var(--btn-grad-b) 100%);
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(30,136,255,0.14);
          transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
          font-size: clamp(14px, 1.9vw, 17px);
        }
        .cta-btn:hover, .cta-btn:focus { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(30,136,255,0.18); outline: none; }

        /* Secondary button (link style but elevated) */
        .intro-btn {
          font-size: clamp(13px, 1.6vw, 16px);
          padding: 10px 14px;
          border-radius:10px;
          cursor:pointer;
          background: linear-gradient(180deg,#ffffff 0%, #f7fbff 100%);
          border: 2px solid rgba(0,123,255,0.18);
          color: #005ec2;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 18px rgba(2,6,23,0.04);
          transition: transform 140ms ease, box-shadow 140ms ease;
          text-decoration: none;
        }
        .intro-btn:hover, .intro-btn:focus { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(2,6,23,0.06); outline: none; }

        /* subtle chip under title */
        .hero-chip{display:inline-block;background:var(--chip-bg);padding:6px 10px;border-radius:999px;font-weight:700;color:#0b3d91;border:1px solid rgba(11,61,145,0.06)}

        /* founder box styling */
        .founder-box{background:var(--subcard-bg);padding:16px;border-radius:12px;border:1px solid rgba(0,0,0,0.04);box-sizing:border-box;min-width:230px}
        .founder-top{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
        .founder-avatar{width:72px;height:72px;border-radius:12px;object-fit:cover;flex-shrink:0;max-width:100%}
        .founder-name{font-weight:900;font-size:1.25em;color:#0f2540}
        .founder-meta{color:#333; white-space:normal; overflow-wrap:break-word; word-break:break-word}
        .founder-meta-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:6px;font-size:0.95em;color:#333}

        /* grid cards */
        main{width:100%;padding:18px 3.5vw}
        .grid-stack{max-width:var(--container-max);margin:0 auto;display:grid;gap:18px}
        .card{background:var(--card-bg);padding:18px;border-radius:14px;box-shadow:0 10px 26px rgba(2,6,23,0.06);border:1px solid var(--card-border);box-sizing:border-box;transition:transform 160ms ease, box-shadow 160ms ease}
        .card:hover{transform: translateY(-6px);box-shadow:0 22px 48px rgba(2,6,23,0.08)}

        @media(min-width:760px){
          .hero-grid{grid-template-columns:1fr 380px;gap:24px}
          .hero-card{padding:32px}
          .grid-stack{grid-template-columns:repeat(2, minmax(0,1fr));grid-auto-rows:auto}
          /* nudge logo slightly left on large screens */
          .hero-logo{transform: translateX(-8px)}
          .founder-avatar{width:84px;height:84px}
        }

        @media(max-width:700px){
          /* reduce outer gutters to 2mm or less */
          .hero-wrap{padding:8px 2mm; margin-bottom: var(--hero-bottom-gap-mobile);} 
          main{padding:8px 2mm; margin-top: 8px;}
          .hero-card{max-width:100%;flex-direction:column;padding:16px}
          .grid-stack{max-width:100%;grid-template-columns:1fr;gap:12px}
          .card{padding:12px}
          .founder-box{width:100%;padding:12px;border-radius:10px}
          .founder-avatar{width:64px;height:64px;border-radius:50%}
          /* stack title and logo vertically on mobile */
          .hero-title-row{flex-direction:column;align-items:flex-start;gap:8px}
          /* make the logo smaller on mobile */
          .hero-logo{height:120px}
          /* reduce the inner spacing so the inner box sits closer to outer box */
          .hero-card{padding:14px}
        }

        footer{max-width:var(--container-max);margin:28px auto 0;padding:18px;text-align:center;color:#dfeeff}

        /* accessibility focus */
        .landing-root a:focus, .landing-root button:focus{box-shadow:0 0 0 4px rgba(30,136,255,0.12);outline:none}
      `}</style>

      <section className="hero-wrap">
        <div className="hero-card" role="region" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-main">
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <span className="hero-chip">Project Fluence</span>
                <br />
              </div>

              {/* title row: title on left, logo on right (from public/logo.png) */}
              <div className="hero-title-row">
                <h1 id="hero-title" style={{ margin: 0 }}>VocabStream</h1>
                {/* logo served from public/logo.png -> accessible at /logo.png */}
                <img src="/logo.png" alt="Project Fluence logo" className="hero-logo" />
              </div>

              <p><strong>〜英単語は「英語で」学ぶ！〜</strong></p>
              <p className="lead">VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。</p>

              <div className="actions" role="navigation" aria-label="Primary actions">
                <button
                  onClick={() => { navigate("/"); scrollToTop(); }}
                  className="cta-btn"
                  aria-label="アプリを使用"
                >
                  アプリを使用
                </button>

                <a
                  href="https://note.com/projectfluence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="intro-btn"
                  role="button"
                  aria-label="Project Fluenceのホームページ（新しいタブで開く）"
                >
                  Noteを見る
                </a>

                <a
                  href="https://projectfluence.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="intro-btn"
                  role="button"
                  aria-label="Project Fluenceのホームページ（新しいタブで開く）"
                >
                  Project Fluenceのホームページ
                </a>
              </div>

            </div>

            <div className="founder-box" aria-labelledby="founder-title">
              <h3 id="founder-title" style={{ margin: 0, fontSize: "1rem", textTransform: "uppercase", color: "#334" }}><strong>プロジェクト創設/開発・運営</strong></h3>

              <div className="founder-top" style={{ marginTop: 12 }}>
                <img src="/profile.JPG" alt="Yuto Kuroki" className="founder-avatar" />

                <div style={{minWidth:0,flex:1}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                    <div className="founder-name">黒木勇人</div>
                  </div>

                  <div className="founder-meta-row">
                    <div className="founder-meta" style={{ fontSize: "0.85em" }}>
                      早稲田大学 基幹理工学部(情報系)
                    </div>
                    <div className="founder-meta" style={{ fontSize: "0.85em" }}>
                      yutokuroki.projectfluence@gmail.com
                    </div>
                  </div>
                </div>
              </div>

              <p style={{ marginTop: 12, color: "#333", fontSize: "0.95em", lineHeight: 1.5 }}>
                英語を英語で学ぶ効率的な方法を追求し、中学2年時に英検1級に上位1%のスコアで合格。現在はTOEFL iBT 116/120点, TOEIC満点 990/990点。ドイツ語もネイティブレベル(Goethe Zertifikat C1)を達成。専門は情報工学で、ISEFなどの国際イベントにて研究発表の経験を持つ。
              </p>

              <div style={{display:'flex',gap:8,marginTop:10}}>
                <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer" style={{fontWeight:800,color:'#0b3d91'}}>→ プロフィール</a>
                <a href="https://www.linkedin.com/in/yuto-kuroki-a5b32b383/" target="_blank" rel="noopener noreferrer" style={{fontWeight:800,color:'#0b3d91'}}>→ LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        <div className="grid-stack">
          <article className="card">
            <h2 style={{ marginTop: 0 }}>About</h2>

            <p style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
              VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。
              主な機能：
              使い方：
            </p>
          </article>

          <article className="card">
            <h2 style={{ marginTop: 0 }}>Project Fluenceについて</h2>
            <p style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
              英語と専門分野の力で夢を実現する人を増やすことを目指し、Project Fluenceを立ち上げ、開発・運営を個人で行っています。Noteでの解説や無料アプリ提供を通じて支援していきます。
              効率的に英語を学び、世界で活躍する力を身につける。Project Fluenceはそんな学びを応援する個人プロジェクトです。最新情報はNoteをフォローしてください。
            </p>
          </article>

          <article className="card">
            <h2 style={{ marginTop: 0 }}>なぜ英語を学ぶのか</h2>
            <p style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
              英語を学ぶことで出会える人や文化、広がる可能性は、学習の努力をはるかに上回る価値を持っています。
            </p>
          </article>

          <article className="card">
            <h2 style={{ marginTop: 0 }}>効果的な学習方法 — 単語は英語で学ぶ</h2>
            <p style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
              多くの日本人の英語学習には２つの特徴があります。日英変換：英単語や英文を日本語に置き換えて理解する方法。多くの単語帳やフラッシュカードはこの仕組みです。これらは試験対策には有効ですが、「学ぶ」と「使えるようになる」は別物です。
            </p>
          </article>
        </div>

        <footer style={{ maxWidth: 'var(--container-max)', margin: "28px auto 0", padding: 18, textAlign: "center", color: "#dfeeff" }}>
          <div>All content © 2025 Project Fluence — 黒木 勇人</div>
          <div style={{ marginTop: 8 }}><a href="/privacy" style={{ color: '#dfeeff', textDecoration: 'underline' }}>Privacy Policy</a></div>
        </footer>
      </main>
    </div>
  );
}
