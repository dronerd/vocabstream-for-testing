import React, { useState, useEffect } from "react";

export default function LessonWithParticlesAndSound() {
  const [particles, setParticles] = useState<{ id: number; emoji: string; left: string; top: string }[]>([]);

  // --- SOUND EFFECTS ---
  const playCorrectSound = () => {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = 880; // A5, brighter tone
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  };

  const playWrongSound = () => {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 523; // C5, softer error tone
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  };

  // --- PARTICLES ---
  const triggerParticles = (emoji: string, count: number) => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      left: `${Math.random() * 80 + 10}%`, // anywhere across width
      top: `${Math.random() * 40 + 30}%`, // CENTER range (30–70%)
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.slice(count));
    }, 1000);
  };

  const handleCorrect = () => {
    playCorrectSound();
    triggerParticles("🌸", 26);
  };

  const handleWrong = () => {
    playWrongSound();
    triggerParticles("💨", 10);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#ffe4e1] text-black overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">Particle & Sound Test</h1>
      <div className="flex gap-4">
        <button
          onClick={handleCorrect}
          className="px-6 py-3 rounded-2xl bg-[#e9967a] hover:bg-[#d97b5e] shadow-md text-white"
        >
          Correct
        </button>
        <button
          onClick={handleWrong}
          className="px-6 py-3 rounded-2xl bg-[#e9967a] hover:bg-[#d97b5e] shadow-md text-white"
        >
          Wrong
        </button>
      </div>

      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            fontSize: "1.8rem",
            animation: "float 1s ease-out",
          }}
        >
          {p.emoji}
        </span>
      ))}

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
