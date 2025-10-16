import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollToTop = useCallback((e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault?.();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="landing-root" style={{ padding: "20px", paddingTop: "92px", fontFamily: "Inter, Arial, sans-serif" }}>
      <style>{`
        :root{
          --accent:#234E52;
          --muted:#666;
          /* 全体の薄い青グレー背景 */
          --page-bg: #0f2740;
          --card-bg: #ffffff;
          --subcard-bg: #e0e4e7; /* 創設者用の薄いグレー箱 */
          --chip-bg: #f1f3f4;
          --btn-bg: #0B3D91;
          --card-border: rgba(11,61,145,0.06);
          --radius: 14px;
          --container-max: 1800px; /* ボックスを左右にさらに広げるための最大幅 */
          --hero-bottom-gap-mobile: 22px; /* mobile gap between hero and main — tweakable */
        }

        *{box-sizing:border-box}
        html,body,#root{height:100%; margin:0; padding:0; background:var(--page-bg)}
        .landing-root{color:#222;width:100%;min-height:100vh;overflow-x:hidden;background:transparent}

        :root { --base-font: clamp(13px, 1.8vw, 16px); }
        .landing-root{font-size:var(--base-font)}

        /* Top hero card that stretches across on large screens */
        .hero-wrap{padding:18px 3.5vw}
        .hero-card{background:var(--card-bg);border-radius:20px;padding:22px;box-shadow:0 8px 24px rgba(20,40,80,0.06);border:1px solid var(--card-border);max-width:var(--container-max);margin:0 auto;width:100%;box-sizing:border-box}

        .hero-grid{display:grid;grid-template-columns:1fr;gap:18px;align-items:center}
        .hero-main{padding-right:8px;min-width:0}

        h1{font-size: clamp(22px, 4.5vw, 38px); margin:6px 0;line-height:1.08;overflow-wrap:break-word;word-break:break-word}
        p.lead{margin-top:8px;color:#444;font-size: clamp(14px, 1.9vw, 16px);max-width:980px;overflow-wrap:break-word}

        .actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
        .btn-primary{background:var(--btn-bg);color:#fff;padding:10px 16px;border-radius:12px;font-weight:700;border:0;cursor:pointer}

        /* inside hero card: founder box that is a subtle gray box */
        .founder-box{background:var(--subcard-bg);padding:14px;border-radius:12px;border:1px solid rgba(0,0,0,0.04);box-sizing:border-box;max-width:100%;overflow:hidden}
        .founder-top{display:flex;gap:12px;align-items:center}
        .founder-avatar{width:72px;height:72px;border-radius:12px;object-fit:cover;flex-shrink:0;max-width:100%}
        .founder-name{font-weight:700;font-size:1.05em}
        .founder-meta{color:#333}

        /* main content grid for feature cards below */
        main{width:100%;padding:18px 3.5vw}
        .grid-stack{max-width:var(--container-max);margin:0 auto;display:grid;gap:18px}

        .card{background:var(--card-bg);padding:18px;border-radius:14px;box-shadow:0 6px 18px rgba(20,40,80,0.04);border:1px solid var(--card-border);box-sizing:border-box}

        /* larger screens: hero becomes 2 columns (main + founder box) and grid below becomes 2x2 */
        @media(min-width:760px){
          .hero-grid{grid-template-columns:1fr 450px;gap:24px}
          .hero-card{padding:28px}
          /* Allow cards to size to their content instead of stretching to match each other */
          .grid-stack{grid-template-columns:repeat(2, minmax(0,1fr));grid-auto-rows:auto}
          .card{display:block;height:auto}
          /* remove forced flex children so vertical whitespace is determined by content */
          .card > *{flex:initial}
          .card p{flex:initial}
        }

        /* ensure very large screens keep layout but do not change look */
        @media(min-width:1100px){
          .hero-card{max-width:calc(var(--container-max) - 40px)}
          .grid-stack{gap:24px}
        }

        /* MOBILE-SPECIFIC: make white boxes extend closer to the edges and prevent overflow */
        @media(max-width:700px){
          /* increase bottom gap of the hero so 'About' doesn't sit too close */
          .hero-wrap{padding:8px 10px; margin-bottom: var(--hero-bottom-gap-mobile);} 
          /* slightly larger main top padding so it visually separates from hero */
          main{padding:8px 10px; margin-top: 8px;}

          /* make hero-card not overflow and reach full width */
          .hero-card{max-width:100%;}

          /* grid becomes single column; cards take full width */
          .grid-stack{max-width:100%;grid-template-columns:1fr;gap:12px}
          .card{padding:12px}

          /* founder box ensure it stays within the card and doesn't overflow */
          .founder-box{width:100%;padding:10px;border-radius:10px}
          .founder-top{gap:10px;align-items:center}
          .founder-avatar{width:70px;height:70px}

          .founder-meta {
            font-size: 0.86em; /* 通常より少し小さく */
          }

          /* さらに小さい画面ではもっと小さく */
          @media(max-width:450px){
            .founder-meta {
              font-size: 0.8em;
            }
          }

          /* prevent any content inside from causing horizontal scroll */
          .hero-main, .hero-main *{min-width:0}
          h1, p.lead{word-break:break-word;overflow-wrap:break-word}
        }

        /* small screens polish */
        @media(max-width:450px){
          .founder-avatar{width:56px;height:56px}
          h1{font-size:20px}
        }

      `}</style>

      <section className="hero-wrap">
        <div className="hero-card" role="region" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-main">
              <h1 id="hero-title">VocabStream</h1>
              <p><strong>〜英単語は「英語で」学ぶ！〜</strong></p>
              <p className="lead">VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。</p>

              <div className="actions" role="navigation" aria-label="Primary actions">
                <button
                  onClick={() => { navigate("/"); scrollToTop(); }}
                  className="btn-primary"
                  aria-label="アプリを使用する"
                >
                  アプリを使用する
                </button>

                <a
                  href="https://note.com/projectfluence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  role="button"
                  aria-label="Project Fluenceのホームページ（新しいタブで開く）"
                  style={{ padding: "10px 14px", borderRadius: 12, border: "4px solid rgba(19, 1, 1, 0.36)", textDecoration: "none", color: "#0b3d91", fontWeight: 700 }}
                >
                  Noteを見る
                </a>

                <a
                  href="https://projectfluence.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  role="button"
                  aria-label="Note をフォロー（新しいタブで開く）"
                  style={{ padding: "10px 14px", borderRadius: 12, border: "4px solid rgba(19, 1, 1, 0.36)", textDecoration: "none", color: "#0b3d91", fontWeight: 700 }}
                >
                  Project Fluenceのホームページ
                </a>
              </div>

            </div>

            {/* Founder box placed INSIDE the same white hero card, as a gray sub-box */}
            <div className="founder-box" aria-labelledby="founder-title">
              <h3 id="founder-title" style={{ margin: 0, fontSize: "1rem", textTransform: "uppercase", color: "#334" }}><strong>プロジェクト創設/開発・運営</strong></h3>

              <div className="founder-top" style={{ marginTop: 12 }}>
                <img src="/profile.JPG" alt="Yuto Kuroki" className="founder-avatar" />

                <div>
                  <div className="founder-name">
                  <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer" style={{fontSize: "1.6em"}}>黒木勇人</a>
                  </div>


                  <div className="founder-meta">早稲田大学 基幹理工学部(情報系)</div>
                  <div className="founder-meta text-xs">yutokuroki.projectfluence@gmail.com</div>
                </div>
              </div>

              <p style={{ marginTop: 12, color: "#333", fontSize: "0.95em", lineHeight: 1.5 }}>
              英語を英語で学ぶ効率的な方法を追求し、中学2年時に英検1級に上位1%のスコアで合格。現在はTOEFL iBT 116/120点, TOEIC満点 990/990点。ドイツ語もネイティブレベル(Goethe Zertifikat C1)を達成。専門は情報工学で、ISEFなどの国際イベントにて研究発表の経験を持つ。
              </p>           
              <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer"><strong>→ プロフィール</strong></a>
              <br />
              <a href="https://www.linkedin.com/in/yuto-kuroki-a5b32b383/" target="_blank" rel="noopener noreferrer"><strong>→ LinkedIn</strong></a>
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
              中高では成績や受験に、大学では授業や研究に、そして社会人になれば海外とのやり取りや情報収集に大きな力を発揮します。 翻訳を待たずに世界中の情報にアクセスでき、キャリアや人生の選択肢を大きく広げてくれるのです。これほどリターンの大きい学習分野は他に多くありません。
              もちろん、英語学習は時に大変で、思わず投げ出したくなる瞬間もあるでしょう。 しかし、コツコツ続けていけば必ず「自分の言葉で伝えられる」日がやってきます。 そのときの達成感は何ものにも代えがたいはずです。 そして英語を通じて海外の人とつながれれば、新しい価値観や考え方に触れ、自分の世界も大きく広がっていきます。
            </p>
          </article>

          <article className="card">
            <h2 style={{ marginTop: 0 }}>効果的な学習方法 — 単語は英語で学ぶ</h2>
            <p style={{ marginTop: 8, color: "#444", lineHeight: 1.8 }}>
              多くの日本人の英語学習には２つの特徴があります。
              日英変換：英単語や英文を日本語に置き換えて理解する方法。多くの単語帳やフラッシュカードはこの仕組みです。
              文法の論理的理解：be動詞、否定文、仮定法などを段階的に学び、問題集で繰り返し練習します。
              これらは試験対策には有効ですが、「学ぶ」と「使えるようになる」は別物です。単語や文法を覚えても、
              ・相手の言葉が聞き取れない
              ・思考が翻訳で遅くなる
              ・言いたいことが出てこない
              といった問題が残ります。文法中心だと一語一句を日本語に変換し、文法の正しさを気にしすぎてしまうのです。
              本質的な英語力とは、日本語と同じように意味をそのまま理解し、アイデアを直接言葉にできること。 日本語の文をいちいち分解しないように、英語も自然に理解・発信できる状態が理想です。
              1: 英単語は「英語で」学ぶ
              英単語を日本語訳で覚えるのではなく、英語の定義や例文と結びつけて学ぶことをおすすめします。 これは、私たちが日本語の知らない単語を国語辞典で調べ、よりやさしい日本語で説明を理解するのと同じ仕組みです。 英語の定義や例文と結び付けて学ぶと、以下のような細かい部分が分かるようになるというメリットもあります。
              ・どんな場面で使えるのか
              ・どんな文で自然に使われるのか
              ・細かなニュアンスの違いは何か

              例：Perseverence (忍耐)
              (定義)"Perseverance means keeping on and not giving up, even when something is hard or takes a long time."
              (例文) "She showed great perseverance by practicing the piano every day until she finally mastered the song."
              (類義語) Determination, Persistence, Dedication, Endurance
              (対義語) Giving up, Surrender
              英英辞書・英英単語帳を使い、この学習方法を実践できます。

              また、ChatGPTなどの生成AIに以下のように質問することも効果的です。
              （その他の機能からアクセスできます）
              単語の説明を求める
              Can you give me the definition, an example sentence, synonyms, and antonyms for the word (“ “)? Please use words that are easier than the word itself to explain.
              Copy
              自作した例文の添削
              Can you correct and improve this sentence for me?
              Copy
              この学習法を効率化するために、英単語アプリVocabStreamを開発しました。
            </p>
          </article>
        </div>

        <footer style={{ maxWidth: 'var(--container-max)', margin: "28px auto 0", padding: 18, textAlign: "center", color: "white" }}>
          <div>All content © 2025 Project Fluence — 黒木 勇人</div>
          <div style={{ marginTop: 8 }}><a href="/privacy" style={{ color: 'white', textDecoration: 'underline' }}>Privacy Policy</a></div>
        </footer>
      </main>
    </div>
  );
}
