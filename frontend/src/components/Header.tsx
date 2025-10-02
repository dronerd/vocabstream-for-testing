import React from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

type HeaderProps = {
  title?: string;
  currentPath?: string;
  isLoginPage: boolean;
};

export default function Header({ title, isLoginPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === "/landing_page";

  // ページトップにスクロール
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ログアウトして紹介ページへ遷移（async/awaitでTypeScriptの'void'チェック問題回避）
  const handleLogoutAndGotoLanding = async () => {
    try {
      await logout?.(); // logout が同期でも Promise<void> でも問題なし
    } catch (err) {
      console.error("logout error:", err);
      // エラー時に遷移させたくない場合はここで return する
    } finally {
      navigate("/landing_page");
    }
  };

  return (
    <>
      <style>{`
        /* Header の CSS（差し替え部分） */
        .app-header {
          position: fixed;    /* ← fixed に変更 */
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
          padding: 8px 14px;
          border-bottom: 1px solid #ddd;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          min-height: 72px;   /* この高さに合わせてコンテンツ側に余白を追加する */
          width: 100%;
        }
        .header-left { display:flex; gap:12px; align-items:center; z-index: 3; }
        .header-right { display:flex; gap:8px; align-items:center; justify-self:end; z-index: 3; }
        .header-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
          width: min(60%, 640px);
          text-align: center;
        }
        
        .vocab-title {
          margin:0;
          font-weight:700;
          color:#333;
          font-size: clamp(18px, 4.5vw, 36px);
          line-height:1;
          white-space:nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .small-title { margin:0; font-size: clamp(14px, 1.6vw, 18px); white-space:nowrap; }
        .home-link { text-decoration:none; color:#007bff; font-weight:700; font-size: clamp(14px, 1.6vw, 20px); white-space:nowrap; cursor:pointer; }
        .welcome { font-weight:700; font-size: clamp(14px, 1.6vw, 20px); white-space:nowrap; }

        /* CTA（太字・青・枠） */
        .cta-btn {
          font-weight: 700;
          color: #007bff;
          border: 1px solid #007bff;
          padding: 6px 10px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          cursor: pointer;
        }

        /* 紹介ボタン（目立ちすぎない別スタイル）*/
        .intro-btn {
          font-size: clamp(12px, 1.6vw, 16px);
          padding: 6px 10px;
          border-radius:6px;
          cursor:pointer;
          background: transparent;
          border: 1px solid transparent;
          color: #007bff;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* フルテキスト / 短縮テキストを切り替えるためのユーティリティ */
        .intro-full { display: inline; }
        .intro-short { display: none; }

        /* ブレークポイント：必要ならここを調整してください（例: 420px） */
        @media (max-width: 420px) {
          .intro-full { display: none; }
          .intro-short { display: inline; }
        }

        .link-as-btn { display:inline-block; }

        @media (max-width: 520px) {
          .app-header { padding: 8px 10px; }
          .header-left, .header-right { gap:6px; }
          .vocab-title { font-size: 18px; }
          .header-center { width: 70%; }
        }
      `}</style>

      <header className="app-header" role="banner">
        {/* 左 */}
        <div className="header-left">
          {isLoginPage ? (
            <img
              src="/logo.png"
              alt="App Logo"
              style={{ height: 60, width: "auto", cursor: "pointer" }}
              onClick={() => navigate("/landing_page")}
            />
          ) : isLandingPage ? (
            <>
              <img
                src="/logo.png"
                alt="App Logo"
                style={{ height: 60, width: "auto", cursor: "pointer" }}
                onClick={scrollToTop}
              />
              <span className="home-link" onClick={scrollToTop}>
                ページトップ
              </span>
            </>
          ) : (
            <>
              <Link to="/">
                <img src="/logo.png" alt="App Logo" style={{ height: 60, width: "auto" }} />
              </Link>
              <Link to="/" className="home-link">Homeに戻る</Link>
              {title && <h3 className="small-title">{title}</h3>}
            </>
          )}
        </div>

        {/* 中央（常に中央） */}
        <div className="header-center" aria-hidden>
          <h1 className="vocab-title">VocabStream</h1>
        </div>

        {/* 右 */}
        <div className="header-right">
          {/* （変更）単独の紹介ボタンは未ログインのときだけ表示する */}
          {!isLandingPage && !user && (
            <button className="intro-btn" onClick={() => navigate("/landing_page")} aria-label="紹介ページへ">
              <span className="intro-full">Vocabstreamの紹介ページ</span>
              <span className="intro-short">紹介ページ</span>
            </button>
          )}

          {isLandingPage ? (
            <button className="cta-btn" onClick={() => navigate("/")}>アプリを使用する</button>
          ) : isLoginPage ? (
            null
          ) : user ? (
            <>
              <span className="welcome">Welcome, {user.username}</span>
              {/* 統合ボタンのみ表示（これを押すと logout -> /landing_page） */}
              <button className="cta-btn" onClick={handleLogoutAndGotoLanding} aria-label="ログアウトして紹介ページへ">
                ログアウト（VocabStreamの紹介ページへ）
              </button>
            </>
          ) : (
            // ログインボタンは非表示のまま
            null
          )}
        </div>
      </header>
    </>
  );
}
