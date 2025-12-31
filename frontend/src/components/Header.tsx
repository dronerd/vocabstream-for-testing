import React from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

type HeaderProps = {
  title?: string;
  currentPath?: string;
  isLoginPage?: boolean;
  isAIChatPage?: boolean;
  mode?: string;
  level?: string;
  onNavigateHome?: () => void;
  step?: string;
};

export default function Header({ title, isLoginPage, isAIChatPage, mode, level, onNavigateHome, step }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  const scrollToTop = () => {
    const opts: any = { top: 0, behavior: "smooth" };
    try {
      if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(opts);
      if (document?.documentElement?.scrollTo) document.documentElement.scrollTo(opts);
      if (document?.body?.scrollTo) document.body.scrollTo(opts);

      const possibleContainers = document.querySelectorAll<HTMLElement>(
        "main, #root, .app-root, .content, .page-content, #__next"
      );
      possibleContainers.forEach((c) => {
        try {
          if (c.scrollTop !== 0 && c.scrollTo) c.scrollTo(opts);
        } catch (e) {
          /* ignore */
        }
      });
    } catch (err) {
      try {
        document.documentElement && (document.documentElement.scrollTop = 0);
        document.body && (document.body.scrollTop = 0);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleLogoutAndGotoLanding = async () => {
    try {
      await logout?.();
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      navigate("/");
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
        /* ====== Header: more prominent CTAs while keeping responsive layout ====== */
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
          padding: 8px 14px;
          border-bottom: 1px solid #e6e6e6;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
          min-height: 72px;
          width: 100%;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .header-left { position: relative; display:flex; gap:12px; align-items:center; z-index: 3; }
        .header-right { position: relative; display:flex; gap:8px; align-items:center; justify-self:end; z-index: 3; }

        /* keep center visually centered but non-interactive on large screens */
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

        .header-center > .vocab-title {
          margin:0;
          font-weight:700;
          color:#000;
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

        /* Primary CTA (アプリを使用) - make it visually dominant */
        .cta-btn {
          font-weight: 800;
          color: #fff;
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, #1e88ff 0%, #005ec2 100%);
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(30,136,255,0.16);
          transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
          font-size: clamp(13px, 1.8vw, 16px);
        }
        .cta-btn:hover, .cta-btn:focus { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(30,136,255,0.18); outline: none; }

        /* Secondary CTA (紹介ページ) - still prominent but less heavy */
        .intro-btn {
          font-size: clamp(13px, 1.6vw, 16px);
          padding: 8px 12px;
          border-radius:8px;
          cursor:pointer;
          background: linear-gradient(180deg,#ffffff 0%, #f7fbff 100%);
          border: 1px solid rgba(0,123,255,0.18);
          color: #005ec2;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(2,6,23,0.04);
          transition: transform 140ms ease, box-shadow 140ms ease;
        }
        .intro-btn:hover, .intro-btn:focus { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(2,6,23,0.06); outline: none; }

        /* responsive text toggles */
        .cta-full { display: inline; }
        .cta-short { display: none; }
        .intro-full { display: inline; }
        .intro-short { display: none; }
        .page-top { display: inline; }

        /* center small-screen button */
        .center-top-btn {
          display: none;
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
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          touch-action: manipulation;
          appearance: none;
        }
        .center-top-btn:focus { outline: 3px solid rgba(0,123,255,0.12); outline-offset: 3px; }
        .center-top-btn .btn-title { font-weight: 800; color: #000; font-size: clamp(16px, 4.5vw, 28px); line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .center-top-btn .screen-top { display: block; font-size: clamp(10px, 1.6vw, 12px); line-height: 1; color: #666; margin-top: 2px; }

        /* larger touch targets on mobile */

        /* --- small screen tweaks: reduce CTA size so it doesn't overlap title --- */
        @media (max-width: 520px) {
          html, body { margin: 0; padding: 0; overflow-x: hidden; }
          .app-header { padding: 8px 10px; min-height: 64px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
          .header-left, .header-right { gap:8px; }

          /* allow center to receive touches on small screens */
          .header-center { width: 70%; pointer-events: auto; }

          .page-top { display: none; }
          .home-link { display: none; }

          /* shorten CTA labels on very small screens to avoid wrapping */
          .cta-full { display: none; }
          .cta-short { display: inline; }
          .intro-full { display: none; }
          .intro-short { display: inline; }

          .app-header img { height: 44px !important; }

          .header-left img, .header-right img { pointer-events: auto; touch-action: manipulation; cursor: pointer; }

          /* show the center button on small screens */
          .center-top-btn { display: inline-flex; pointer-events: auto; }

          /* hide large-screen title when small screen center button is present */
          .header-center > .vocab-title { display: none; }

          /* increase CTA hit area on mobile (default) -- override to smaller below */
          /* .cta-btn { padding: 12px 16px; border-radius: 12px; font-size: 15px; } */

          /* ----- NEW: make primary CTA visually smaller on narrow screens ----- */
          .cta-btn {
            /* visually smaller */
            font-size: 13px;                /* smaller text */
            padding: 8px 10px;             /* reduce horizontal space */
            border-radius: 10px;           /* slightly smaller radius */
            min-width: 0;                  /* allow it to shrink */
            max-width: 140px;              /* prevent extremely wide button */
            white-space: nowrap;           /* prevent wrapping */
            overflow: hidden;
            text-overflow: ellipsis;
            box-shadow: 0 6px 12px rgba(30,136,255,0.12); /* reduced shadow */
          }

          /* show only the short label if still needed; keeps UI compact */
          .cta-full { display: none; }
          .cta-short { display: inline; }

          /* also slightly shrink intro button */
          .intro-btn {
            padding: 8px 10px;
            border-radius: 9px;
            font-size: 13px;
          }

          /* tiny screens: make it even smaller so nothing overlaps */
          @media (max-width: 380px) {
            .cta-btn {
              font-size: 12px;
              padding: 6px 8px;
              max-width: 110px;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(30,136,255,0.10);
            }
            .intro-btn { font-size: 12px; padding: 6px 8px; }
          }
        }

        @media (max-width: 420px) {
          .intro-full { display: none; }
          .intro-short { display: inline; }
          .header-center { width: 75%; }
        }

        /* small accessibility tweak so focus is always visible when keyboard navigating */
        .app-header button:focus, .app-header a:focus { box-shadow: 0 0 0 3px rgba(0,123,255,0.12); }
        /* When a page requests hiding global navs (e.g. AI chat), allow a simple body class to hide header */
        .hide-global-navs .app-header { display: none !important; }
      `}</style>

      <header className="app-header" role="banner">
        {isAIChatPage || step === "chatting" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, position: "sticky", top: "0", zIndex: 1100, background: "white", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
            <h1 style={{ margin: 0, fontSize: 20 }}>
              {mode === "casual" ? "AIとの会話" : "AIレッスン"}
            </h1>
            <button
              onClick={onNavigateHome || (() => navigate("/home"))}
              style={{
                padding: "4px 6px",
                borderRadius: "10px",
                background: "#fff7f0",
                color: "#ff6a00",
                border: "2px solid #ff8a3d",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background 0.2s ease, transform 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffe0c4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff7f0")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              ← ページを出る
            </button>
            <div style={{ fontSize: 13, color: "#374151", minWidth: 88 }}>
              <strong>レベル:</strong> <span style={{ marginLeft: 6 }}>{level}</span>
            </div>
          </div>
        ) : (
          <>
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
              <Link to="/home">
                <img src="/logo.png" alt="App Logo" style={{ height: 60, width: "auto" }} />
              </Link>
              <Link to="/home" className="home-link">Home🏠</Link>
              {title && <h3 className="small-title">{title}</h3>}
            </>
          )}
        </div>

        <div className="header-center" aria-hidden>
          <h1 className="vocab-title">VocabStream</h1>

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
        </div>

        <div className="header-right">
          {!isLandingPage && !user && (
            <button className="intro-btn" onClick={() => navigate("/")} aria-label="紹介ページへ">
              <span className="intro-full">Vocabstreamの紹介ページ</span>
              <span className="intro-short">紹介ページ</span>
            </button>
          )}

          {isLandingPage ? (
            <button className="cta-btn" onClick={() => navigate("/home")} aria-label="アプリを使用する">
              <span className="cta-full">アプリを使用する</span>
              <span className="cta-short">使用</span>
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
          </>
        )}
      </header>
    </>
  );
}
