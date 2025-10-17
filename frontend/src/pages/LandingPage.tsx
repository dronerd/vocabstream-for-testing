import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 text-gray-100" style={{ padding: "8px 2mm" }}>
      {/* HERO / TOP */}
      <section className="max-w-5xl mx-auto mt-6">
        {/* outer card (reduced inner padding) */}
        <div className="bg-white bg-opacity-95 rounded-2xl shadow-xl overflow-hidden" style={{ padding: '14px' }}>
          {/* Grid: on md+ two columns (left = founder area wider), on mobile stacked */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">

            {/* LEFT: Founder + logo+name block (spans 2 cols on md to make it wider) */}
            <div className="md:col-span-2">
              {/* Inner small card containing logo + name + meta (reduced inner padding) */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white rounded-xl" style={{ padding: '10px' }}>
                {/* Logo: circular */}
                <img
                  src="/logo.png"
                  alt="Project Fluence logo"
                  className="w-28 h-28 md:w-36 md:h-36 object-cover rounded-full md:-ml-4"
                />

                {/* Name and meta */}
                <div className="flex-1 min-w-0">
                  {/* Name (larger) */}
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight truncate" style={{ color: '#0f2540' }}>VocabStream</h1>
                    <span className="text-xl md:text-2xl font-bold text-gray-800 ml-1">黒木勇人</span>
                  </div>

                  {/* University and email on a single row */}
                  <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-3 items-center" style={{ color: '#334' }}>
                    <span className="truncate">早稲田大学 基幹理工学部 (情報系)</span>
                    <span className="opacity-50">|</span>
                    <a href="mailto:yutokuroki.projectfluence@gmail.com" className="truncate text-blue-700 underline">yutokuroki.projectfluence@gmail.com</a>
                  </div>
                </div>
              </div>

              {/* short intro under founder/logo block */}
              <p className="mt-3 text-gray-800 leading-relaxed" style={{ color: '#333' }}>
                VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。
              </p>

            </div>

            {/* RIGHT: Founder description box (narrow column) */}
            <aside className="bg-gray-50 rounded-xl p-3 md:p-4">
              <h3 className="text-sm font-semibold text-gray-800">プロジェクト創設 / 開発・運営</h3>

              <div className="mt-3 flex items-start gap-3">
                <img src="/profile.JPG" alt="Yuto Kuroki" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">黒木 勇人</div>
                  <div className="text-xs text-gray-700 truncate">早稲田大学 基幹理工学部(情報系)</div>
                  <a href="mailto:yutokuroki.projectfluence@gmail.com" className="text-xs text-blue-600 underline truncate">yutokuroki.projectfluence@gmail.com</a>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">中学2年時に英検1級（上位1%）、TOEFL iBT 116/120、TOEIC 990/990。ドイツ語 Goethe C1。情報工学を専門に、国際学会での発表経験あり。</p>

              <div className="mt-3 flex gap-3">
                <a href="https://yutokuroki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-700">→ プロフィール</a>
                <a href="https://www.linkedin.com/in/yuto-kuroki-a5b32b383/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-700">→ LinkedIn</a>
              </div>
            </aside>

          </div>
        </div>

        {/* Actions (buttons) */}
        <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
          <a href="/" className="inline-block px-5 py-2 rounded-full font-bold bg-gradient-to-r from-blue-500 to-blue-700 text-white">アプリを使用</a>
          <a href="https://note.com/projectfluence" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-full border-2 border-blue-200 text-blue-100">Noteを見る</a>
          <a href="https://projectfluence.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 rounded-full border-2 border-blue-200 text-blue-100">Project Fluenceのホームページ</a>
        </div>

      </section>

      {/* Main content cards */}
      <main className="max-w-5xl mx-auto mt-6 px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white bg-opacity-95 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900">About</h2>
            <p className="mt-2 text-gray-700">VocabStreamは、黒木勇人が創設・開発・運営するProject Fluenceの一環として制作された無料の英単語学習アプリです。英語を英語で学ぶことを通じて、自然に英語を理解・運用する力を育てます。</p>
          </article>

          <article className="bg-white bg-opacity-95 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900">Project Fluenceについて</h2>
            <p className="mt-2 text-gray-700">英語と専門分野の力で夢を実現する人を増やすことを目指し、Project Fluenceを立ち上げ、開発・運営を個人で行っています。</p>
          </article>

          <article className="bg-white bg-opacity-95 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900">なぜ英語を学ぶのか</h2>
            <p className="mt-2 text-gray-700">英語を学ぶことで出会える人や文化、広がる可能性は、学習の努力をはるかに上回る価値を持っています。</p>
          </article>

          <article className="bg-white bg-opacity-95 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-gray-900">効果的な学習方法 — 単語は英語で学ぶ</h2>
            <p className="mt-2 text-gray-700">多くの日本人の英語学習には日英変換の習慣があります。VocabStreamは英語で英語を学ぶ設計を支援します。</p>
          </article>
        </div>

        <footer className="text-center text-sm text-gray-300 mt-6 mb-8">All content © 2025 Project Fluence — 黒木 勇人</footer>
      </main>
    </div>
  );
}