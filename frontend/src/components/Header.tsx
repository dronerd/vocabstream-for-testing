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
  const isPrivacyPage = location.pathname === "/privacy";

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

  const handleKeyToScroll = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
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

        /* MADE POSITIONED so z-index works on mobile overlapping cases */
        .header-left { position: relative; display:flex; gap:12px; align-items:center; z-index: 3; }
        .header-right { position: relative; display:flex; gap:8px; align-items:center; justify-self:end; z-index: 3; }
        .header-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          /* default: do NOT receive pointer events on large screens (keeps original behavior) */
          pointer-events: none;
          z-index: 2;
          width: min(60%, 640px);
          text-align: center;
        }

        /* main title used on large screens */
        .header-center > .vocab-title {
          margin:0;
          font-weight:700;
          color:#333;
          font-size: clamp(18px, 4.5vw, 36px);
          line-height:1;
          white-space:nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
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

        /* LITTLE center button that appears only on small screens (and not on /privacy) */
        .center-top-btn {
          display: none; /* hidden by default (large screens) */
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          width: 100%;
          text-align: center;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex-direction: column;
        }
        .center-top-btn:focus {
          outline: 3px solid rgba(0,123,255,0.15);
          outline-offset: 3px;
        }
        .center-top-btn .btn-title {
          font-weight: 700;
          /* same visual style as vocab-title but we hide the main one on small screens */
          font-size: clamp(16px, 4.5vw, 28px);
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .center-top-btn .screen-top {
          display: block;
          font-size: clamp(10px, 1.6vw, 12px); /* very small text */
          line-height: 1;
          color: #666;
          margin-top: 2px;
        }

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
          .header-center { width: 70%; pointer-events: auto; } /* allow the center to receive touches on small screens */
          .page-top { display: none; }
          .home-link { display: none; }
          .cta-full { display: none; }
          .cta-short { display: inline; }
          .intro-full { display: none; }
          .intro-short { display: inline; }
          .app-header img { height: 44px !important; }

          /* ensure logo receives touch events reliably on mobile */
          .header-left img, .header-right img { pointer-events: auto; touch-action: manipulation; cursor: pointer; }

          /* show the center button on small screens (not on /privacy; see conditional render) */
          .center-top-btn { display: inline-flex; pointer-events: auto; }

          /* when small screen button is visible, hide the original (absolute) h1 to avoid duplicate visuals */
          .header-center > .vocab-title { display: none; }
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate("/landing_page");
                }
              }}
            />
          ) : isLandingPage ? (
            <>
              <img
                src="/logo.png"
                alt="App Logo"
                style={{ height: 60, width: "auto", cursor: "pointer" }}
                onClick={scrollToTop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    scrollToTop();
                  }
                }}
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

        <div className="header-center">
          {/* original title (visible on large screens) */}
          <h1 className="vocab-title">VocabStream</h1>

          {/* small-screen tappable area (only rendered if NOT the privacy page) */}
          {!isPrivacyPage && (
            <button
              type="button"
              className="center-top-btn"
              onClick={scrollToTop}
              onKeyDown={handleKeyToScroll}
              aria-label="スクリーントップへ（VocabStream）"
            >
              <span className="btn-title">VocabStream</span>
              <span className="screen-top">スクリーントップへ</span>
            </button>
          )}
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
