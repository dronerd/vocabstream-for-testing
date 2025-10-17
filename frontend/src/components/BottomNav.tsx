import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  // 非表示にする条件
  if (
    location.pathname === "/privacy" || // privacyページ
    location.pathname.startsWith("/lesson/") // lessonページ (/lesson/◯◯)
  ) {
    return null;
  }

  var style = `
    .nav-bottom {
      position: fixed;
      bottom: 12px;
      left: 0;
      right: 0;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px;
      width: calc(100% - 32px);
      max-width: 900px;
      background: #fff;
      border: 2px solid #001f3f;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
      z-index: 50;
      flex-wrap: nowrap;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .nav-bottom::-webkit-scrollbar { height: 6px; }
    .nav-bottom::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 6px; }
    .nav-bottom .bottom-link {
      flex: 1 1 0;
      min-width: 0;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      color: #000;
      padding: 6px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .nav-bottom .bottom-link.active {
      color: #0b63d6;
    }
    @media (max-width: 640px) {
      .nav-bottom {
        max-width: 480px;
        width: calc(100% - 24px);
        padding: 6px;
        gap: 6px;
        bottom: 8px;
        border-radius: 10px;
      }
      .nav-bottom .bottom-link {
        font-size: 13px;
        padding: 6px 6px;
      }
    }
    @media (max-width: 360px) {
      .nav-bottom { width: calc(100% - 12px); max-width: 360px; }
      .nav-bottom .bottom-link { font-size: 12px; }
    }
  `;

  return (
    <>
      <style>{style}</style>
      <nav className="nav-bottom" aria-label="Bottom navigation">
        <Link
          to="/"
          className={`bottom-link ${location.pathname === "/" ? "active" : ""}`}
          aria-current={location.pathname === "/" ? "page" : undefined}
        >
          Home
        </Link>
        <Link
          to="/learn"
          className={`bottom-link ${location.pathname === "/learn" ? "active" : ""}`}
          aria-current={location.pathname === "/learn" ? "page" : undefined}
        >
          学習
        </Link>
        <Link
          to="/review"
          className={`bottom-link ${location.pathname === "/review" ? "active" : ""}`}
          aria-current={location.pathname === "/review" ? "page" : undefined}
        >
          復習
        </Link>
        <Link
          to="/others"
          className={`bottom-link ${location.pathname === "/others" ? "active" : ""}`}
          aria-current={location.pathname === "/others" ? "page" : undefined}
        >
          その他の機能
        </Link>
      </nav>
    </>
  );
}
