import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();

  // 非表示にする条件
  if (
    location.pathname === "/privacy" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/lesson/")
  ) {
    return null;
  }

  const navItems = [
    { path: "/home", label: "Home", color: "#000000", background: "#ffffff" },
    { path: "/learn", label: "学習", color: "#000000", background: "#6fa8dc" }, // 柔らかいブルー
    { path: "/review", label: "復習", color: "#000000", background: "#e9967a" }, // サーモン系のレッド
    { path: "/others", label: "その他の機能", color: "#000000", background: "#77dd77" }, // パステルグリーン
  ];

  const style = `
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
      padding: 10px 8px;
      border-radius: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.2s ease;
    }

    .nav-bottom .bottom-link.active {
      font-weight: 800;
      filter: brightness(0.9);
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
        {navItems.map(({ path, label, background, color }) => (
          <Link
            key={path}
            to={path}
            className={`bottom-link ${location.pathname === path ? "active" : ""}`}
            style={{
              backgroundColor: background,
              color: color,
              fontWeight: location.pathname === path ? "800" : "600",
              filter: location.pathname === path ? "brightness(0.9)" : "none",
            }}
            aria-current={location.pathname === path ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
