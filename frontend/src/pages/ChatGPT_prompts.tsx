import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

type Prompt = {
  id: string;
  title: string;
  text: string;
};

const PROMPTS: Prompt[] = [
  {
    id: "speaking",
    title: "英会話の練習用",
    text:
      "Hi, I want to practice speaking English. Please ask me some questions in the subject of (everyday life/ university studies/ future plans…etc). After I answer, give me feedback and then ask another question. Use words I know, but sometimes a few harder ones so I can learn. My English level is (A1/A2/B1/B2/C1/C2).",
  },
  {
    id: "eiken",
    title: "英検対策（例：１級の面接）",
    text:
      "I would like to prepare for the Eiken grade 1 Speaking section. Could you please present me with a topic that is relevant to Eiken grade 1? Then I will try to give a presentation on this topic. Afterwards, you could correct my presentation and show me how I could improve it. It would also be helpful if you could later ask me a few questions about my presentation.",
  },
  {
    id: "toefl",
    title: "TOEFLライティングの練習",
    text:
      "Can you give me an example of a typical writing task given in the TOEFL iBT writing part (1/2)? I will type in my answer, so please fix grammatical mistakes, and teach me how I can further improve my vocabulary use.",
  },
  {
    id: "rewrite",
    title: "自由ライティングの添削",
    text: "Can you revise this text for me? / Can you improve this text for me?",
  },
  {
    id: "vocab",
    title: "学んだ表現のリスト化",
    text:
      "Can you create a list of vocabularies and phrases you taught me today that might be useful in the future?",
  },
];

export default function TestPage() {
  const nav = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = useCallback(async (text: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts or older browsers
        const ta = document.createElement("textarea");
        ta.value = text;
        // prevent scrolling to bottom
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1400);
    } catch (e) {
      // If copy fails, try the fallback (which is best-effort)
      console.error("Copy failed", e);
      alert("コピーに失敗しました。ブラウザの設定を確認してください。");
    }
  }, []);

  return (
    <div style={{ paddingTop: "92px" }}>
      <button
        onClick={() => nav("/ohers")}
        style={{
          marginBottom: 12,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          backgroundColor: "#555",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        その他の機能一覧に戻る
      </button>

      <h2 style={{ marginBottom: 12 }}>ChatGPTのプロンプト</h2>

      <p style={{ marginTop: 0, marginBottom: 16, maxWidth: 760 }}>
        下のカードのボタンでプロンプトをコピーできます。クリップボードAPIは安全なコンテキスト（https）で動作します。古いブラウザや非安全なコンテキストではフォールバック（テキストエリア経由）を使います。
      </p>

      <div className="prompt-grid" role="list">
        {PROMPTS.map((p) => (
          <article className="prompt-card" key={p.id} role="listitem">
            <div className="prompt-header">
              <strong>{p.title}</strong>
              <button
                className="copy-btn"
                onClick={() => copyText(p.text, p.id)}
                aria-label={`Copy prompt: ${p.title}`}
              >
                {copiedId === p.id ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="prompt-text" aria-hidden>
{p.text}
            </pre>
          </article>
        ))}
      </div>

      <style>{`
        /* keep the background untouched */
        :root { --card-bg: rgba(255,255,255,0.04); }

        .prompt-grid {
          display: grid;
          gap: 16px;
          /* mobile: 1 column */
          grid-template-columns: 1fr;
          margin-bottom: 40px;
        }

        /* medium screens: 2 columns */
        @media (min-width: 640px) {
          .prompt-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* large screens: 3 columns */
        @media (min-width: 1000px) {
          .prompt-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* very large: max 4 columns (so it won't expand to 6 etc.) */
        @media (min-width: 1400px) {
          .prompt-grid { grid-template-columns: repeat(4, 1fr); }
        }

        .prompt-card {
          background: var(--card-bg);
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          min-height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: inherit; /* don't force text color */
        }

        .prompt-header {
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .copy-btn {
          padding: 6px 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #2b6ea3;
          color: #fff;
          font-weight: 600;
        }

        .copy-btn:active { transform: translateY(1px); }

        .prompt-text {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 14px;
          line-height: 1.4;
          opacity: 0.95;
        }

        /* smaller font for very small screens */
        @media (max-width: 360px) {
          .prompt-text { font-size: 13px; }
          .copy-btn { padding: 6px 8px; }
        }
      `}</style>
    </div>
  );
}
