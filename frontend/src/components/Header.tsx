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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogoutAndGotoLanding = async () => {
    try {
      await logout?.();
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      navigate("/landing_page");
    }
  };

  return (
    <>
      <style>{`
        .app-header {
          position: fixed;
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
          min-height: 72px;
          width: 100%;
          box-sizing: border-box;
          overflow-x: hidden; /* prevent horizontal scroll or extra space */
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
        .home-link { text-decoration:none; color:#007bff; font-weight:700; font-size: clamp(14px, 1.6vw, 20px); white-space:nowrap; cursor:pointer; display:inline-block; }
        .welcome { font-weight:700; font-size: clamp(14px, 1.6vw, 20px); white-space:nowrap; }

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

        .cta-full { display: inline; }
        .cta-short { display: none; }
        .intro-full { display: inline; }
        .intro-short { display: none; }
        .page-top { display: inline; }

        @media (max-width: 520px) {
          html, body { margin: 0; padding: 0; overflow-x: hidden; }
          .app-header {
            padding: 8px 10px;
            min-height: 60px;
            box-shadow: 0 1px 6px rgba(0,0,0,0.04);
            width: 100%;
            overflow-x: hidden;
          }
          .header-left, .header-right { gap:6px; }
          .vocab-title { font-size: 18px; }
          .header-center { width: 70%; }
          .page-top { display: none; }
          .home-link { display: none; }
          .cta-full { display: none; }
          .cta-short { display: inline; }
          .intro-full { display: none; }
          .intro-short { display: inline; }
          .app-header img { height: 44px !important; }
        }

        @media (max-width: 420px) {
          .intro-full { display: none; }
          .intro-short { display: inline; }
          .header-center { width: 75%; }
        }
      `}</style>

      <header className="app-header" role="banner">
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
              <span className="home-link page-top" onClick={scrollToTop}>
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

        <div className="header-center" aria-hidden>
          <h1 className="vocab-title">VocabStream</h1>
        </div>

        <div className="header-right">
          {!isLandingPage && !user && (
            <button className="intro-btn" onClick={() => navigate("/landing_page")} aria-label="紹介ページへ">
              <span className="intro-full">Vocabstreamの紹介ページ</span>
              <span className="intro-short">紹介ページ</span>
            </button>
          )}

          {isLandingPage ? (
            <button className="cta-btn" onClick={() => navigate("/")} aria-label="アプリを使用する">
              <span className="cta-full">アプリを使用する</span>
              <span className="cta-short">アプリを使用</span>
            </button>
          ) : isLoginPage ? (
            null
          ) : user ? (
            <>
              <span className="welcome">Welcome, {user.username}</span>
              <button className="cta-btn" onClick={handleLogoutAndGotoLanding} aria-label="ログアウトして紹介ページへ">
                <span className="cta-full">ログアウト（VocabStreamの紹介ページへ）</span>
                <span className="cta-short">ログアウト</span>
              </button>
            </>
          ) : (
            null
          )}
        </div>
      </header>
    </>
  );
}
