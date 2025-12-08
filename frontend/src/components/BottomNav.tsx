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

  // 各リンクの色を少し濃くしたバージョン
  const navItems = [
    { path: "/home", label: "Home", color: "#081230" }, // blackより少し明るめで見やすい
    { path: "/learn", label: "単語学習", color: "#4a86c5" }, // 柔らかいブルーより少し濃い
    { path: "/ai_chat", label: "AIと話す", color: "#d4795e" }, // サーモンより少し濃い
    { path: "/others", label: "その他の機能", color: "#52b788" }, // パステルグリーンより少し濃い
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
      padding: 6px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: font-weight 0.2s ease;
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
        {navItems.map(({ path, label, color }) => {
          const isActive = location.pathname === path;

          const activeStyle = isActive
            ? {
                fontWeight: "800",
                background: `${color}20`, // 透明度つき背景
                border: `1.5px solid ${color}55`,
                padding: "6px 10px",
                borderRadius: "8px",
              }
            : {};

          return (
            <Link
              key={path}
              to={path}
              className="bottom-link"
              style={{
                color,
                fontWeight: isActive ? "800" : "600",
                ...activeStyle,
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}

      </nav>
    </>
  );
}
