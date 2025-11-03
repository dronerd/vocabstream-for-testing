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
      "Hi, I want to practice speaking English. Please ask me some questions in the subject of (everyday life/ university studies/ future plans…etc). After I answer, give me feedback and then ask another question. Use words I know, but sometimes a few harder ones so I can learn. ",
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
  {
    id: "vocab_learn",
    title: "単語の説明を求める",
    text:
      "Can you give me the definition, an example sentence, synonyms, and antonyms for the word (' ')? Please use words that are easier than the word itself to explain.",
  },
  {
    id: "sentence_correction",
    title: "自作した例文の添削",
    text: "Can you correct and improve this sentence for me?",
  },
  {
    id: "level_setting",
    title: "レベルを指定する",
    text: "My English level is (A1/A2/B1/B2/C1/C2). Please use vocabulary appropriate for (A1/A2/B1/B2/C1/C2) learners.",
  },
   {
    id: "pronunciation_help",
    title: "発音を教えてほしいとき",
    text: "Please provide a phonetic transcription and tips to pronounce this sentence.",
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
        const ta = document.createElement("textarea");
        ta.value = text;
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
      console.error("Copy failed", e);
      alert("コピーに失敗しました。ブラウザの設定を確認してください。");
    }
  }, []);

  return (
    <div
      style={{
        paddingTop: "92px",
        minHeight: "100vh",
        color: "#1b4332",
        boxSizing: "border-box",
      }}
    >
      {/* make sure page edges are green by setting body background and removing default margin */}
      <style>{`html, body, #root { height: 100%; margin: 0; background-color: #d8f3dc; }

        .page-inner { padding-left: 16px; padding-right: 16px; }

        .prompt-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
          margin: 0 auto 40px;
          max-width: 800px; /* match how-to-use */
        }

        @media (min-width: 640px) {
          .prompt-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* keep 2 columns even on very large screens */
        @media (min-width: 1000px) {
          .prompt-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .prompt-card {
          background: #fff;
          border-radius: 12px;
          padding: 14px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          color: #1b4332;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .prompt-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.15); }

        .prompt-header { display:flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }

        .copy-btn { padding: 6px 10px; border-radius: 8px; border: none; cursor: pointer; background: #2d6a4f; color: #fff; font-weight: 600; }
        .copy-btn:hover { background: #1b4332; }

        .prompt-text { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 1.5; }

        .how-to-use { background: #ffffffb0; border-radius: 12px; padding: 20px; margin: 20px auto; max-width: 800px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

        .how-to-use h3 { color: #1b4332; margin-bottom: 10px; text-align: center; }
        .how-to-use ol { padding-left: 20px; }
        .how-to-use li { margin-bottom: 10px; line-height: 1.6; }
        .how-to-use a { color: #2d6a4f; text-decoration: underline; }
      `}</style>

      <div className="page-inner">
        <h2 style={{ marginBottom: 12, textAlign: "center", color: "#081c15" }}>
          ChatGPTのプロンプト集
        </h2>

        <button
          onClick={() => nav("/others")}
          style={{
            marginBottom: 20,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#40916c",
            color: "#fff",
            cursor: "pointer",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          ← 戻る
        </button>

        <p
          style={{
            marginTop: 0,
            marginBottom: 16,
            maxWidth: 760,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
            fontSize: "16px",
            color: "#1b4332",
          }}
        >
          下のカードの「コピーする」ボタンを押すと、プロンプトをコピーできます。ChatGPTでそのまま貼り付けて使いましょう。
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
                  {copiedId === p.id ? "コピーされました" : "コピーする"}
                </button>
              </div>
              <pre className="prompt-text">{p.text}</pre>
            </article>
          ))}
        </div>

        <section className="how-to-use">
          <h3>💡ChatGPTの使い方</h3>

          <p>
            以下は初めてChatGPTを使う方向けに、画面の開き方から音声入力、プロンプトの貼り付け・送信、良い質問の作り方までを順を追って丁寧に説明したものです。
            手順どおりに進めれば、プロンプトを効果的に使って学習や練習ができます。
          </p>

          <ol>
            <li>
              <strong>ChatGPTにアクセスする</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>
                    ブラウザで次のURLにアクセスします：
                    <br />
                    <a
                      href="https://chat.openai.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontWeight: 800, color: '#0b3d91', textDecoration: 'underline' }}
                    >
                      https://chat.openai.com/
                    </a>

                  </li>
                  <li>
                    スマートフォンなら
                    <a
                      href = "https://chatgpt.com/ja-JP/download/"
                      target = "_blank"
                      rel = "noopener noreferrer"
                      style = {{ fontWeight: 800, color: '#0b3d91', textDecoration: 'underline'}}
                    >
                    「ChatGPT」アプリ（iOS/Android）を公式ストアからダウンロードして開くことをおすすめします。
                    </a>
                  </li>
                  <li>
                    ※会社や学校のネットワークだとアクセス制限がかかっている場合があります。その場合は家庭のWi‑Fiやモバイル回線を試してください。
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <strong>アカウントでログインする／新規登録</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>
                    ログイン画面が出たら、既に持っている場合はメール／Google／Appleなどでログインします。
                  </li>
                  <li>
                    まだアカウントがない場合は「Sign up」から登録してください。メールアドレスの確認（受信したメールのリンクをクリックする）などが必要です。
                    ただ、アカウントが無くても使用は可能な場合があります。
                  </li>
                  <li>
                    無料プランでも基本機能は使えます。高度なモデルは有料プランで提供されることがありますので、必要に応じてプランを確認してください。
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <strong>このページからプロンプトをコピーして貼り付ける方法</strong>
              <div style={{ marginTop: 6 }}>
                <ol>
                  <li>このページの「コピーする」ボタンを押すとプロンプトがクリップボードにコピーされます。</li>
                  <li>
                    ChatGPTの入力欄をクリック（またはタップ）して、ペーストします。PCでは <code>Ctrl+V</code>（Macは <code>Cmd+V</code>）、スマホでは長押しで「貼り付け」を選びます。
                  </li>
                  <li>貼り付けた後、必要なら英語レベルや質問内容（例：B1）などを括弧の中に入れてカスタマイズしてから送信してください。</li>
                </ol>
              </div>
            </li>

            <li>
              <strong>メッセージの送信方法</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>PC：入力欄でメッセージを作成したら <code>Enter</code> を押すと送信できます。Shift+Enterで改行できます。</li>
                  <li>スマホ：入力欄の右側にある送信ボタン（紙飛行機のアイコンなど）をタップして送信します。</li>
                  <li>間違って送ってしまったときは、会話のメッセージを編集できる場合があります（すべての環境で編集可能とは限りません）。その場合はメッセージの編集または再送を行ってください。</li>
                </ul>
              </div>
            </li>

            <li>
              <strong>音声入力（マイク）の使い方</strong>
              <div style={{ marginTop: 6 }}>
                <ol>
                  <li>
                    ブラウザまたはアプリでマイクボタン（画面のどこかにあるマイクのアイコン）を探します。アプリだと画面下にあることが多いです。
                  </li>
                  <li>
                    初回利用時は「マイクへのアクセスを許可しますか？」というブラウザ／OSの確認が出ます。許可しないと音声入力はできません。
                  </li>
                  <li>
                    音声を話すと自動でテキストに変換されます。変換後に内容を編集してから送信できます。
                  </li>
                  <li>
                    <strong>注意点：</strong> 周囲がうるさいと認識精度が落ちます。はっきりと、ゆっくり話すと良い結果が得られやすいです。句読点や改行は自分で入れるか、短い文ごとに区切って話すと編集が楽になります。
                  </li>
                  <li>
                    マイクが動作しないときは、ブラウザのサイト設定（またはスマホのアプリ権限）でマイクがオンになっているか確認してください。
                  </li>
                </ol>
              </div>
            </li>

            <li>
              <strong>プロンプトをより効果的に使うコツ</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>
                    <strong>具体的に書く：</strong> 例：「私の英語レベルはB1です。日常会話の練習をしたいので、簡単な質問を5つ出してください。回答後に短いフィードバックをください。」のように要望を明確にします。
                  </li>
                  <li>
                    <strong>役割を指定する：</strong> "You are my English teacher." のように役割を先に伝えると応答が安定します。
                  </li>
                  <li>
                    <strong>段階的に進める：</strong> 一度に多くを求め過ぎず、小さなゴール（例：発音・語彙・文法のどれを重点にするか）を設定すると効果的です。
                  </li>
                  <li>
                    <strong>例文を出す：</strong> 自分の回答例や直したい文を必ず一緒に送ると添削が的確になります。
                  </li>
                </ul>
              </div>
            </li>


            <li>
              <strong>🗣️ スマホアプリで使える「会話モード」</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>
                    ChatGPT公式アプリ（iOS / Android対応）には「会話モード」が搭載されています。このモードでは、マイクボタンを押すとGPTとリアルタイムで英会話ができ、あなたの発話に対してGPTが音声で返答してくれます。
                    まるでAI講師と直接話しているような体験ができるため、リスニング・スピーキング練習に最適です。
                 </li>
                  <li>
                    会話モードを使うには、アプリ右下の「ヘッドフォン」または「マイク」アイコンをタップします。
                  </li>
                  <li>
                    なるべくはっきりとした発音で話すと、AIが自然な速度で返答します。
                  </li>
                </ul>
              </div>
            </li>


            <li>
              <strong>プライバシーと注意点</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>個人情報（住所、パスワード、クレジットカード番号など）は入力しないでください。</li>
                  <li>生成される回答は常に正しいとは限りません。特に重要な情報は他の信頼できる情報源で確認してください。</li>
                </ul>
              </div>
            </li>

            <li>
              <strong>トラブルシューティング（よくある問題）</strong>
              <div style={{ marginTop: 6 }}>
                <ul>
                  <li>
                    <strong>コピーできない：</strong> ブラウザのコンソールにエラーが出ているか、サイトが安全なコンテキスト（https）でない可能性があります。別のブラウザやhttps接続で再試行してください。
                  </li>
                  <li>
                    <strong>マイクが認識されない：</strong> ブラウザのサイト権限でマイクが許可されているか、OSの設定でマイクが無効になっていないか確認してください。
                  </li>
                  <li>
                    <strong>応答が遅い：</strong> ネットワーク状況やサーバー負荷の影響で遅延することがあります。時間をおいて再試行してください。
                  </li>
                </ul>
              </div>
            </li>
          </ol>

        </section>
      </div>
    </div>
  );
}
