"use client";

import { useMemo } from "react";

const HEART_GLYPHS = ["❤️", "💕", "💗", "💖"];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Decoração puramente visual — não intercepta cliques (pointer-events-none). */
export function FloatingHearts({ count = 6 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: randomBetween(5, 95),
        delay: randomBetween(0, 4),
        duration: randomBetween(6, 10),
        size: randomBetween(0.9, 1.6),
        glyph: HEART_GLYPHS[i % HEART_GLYPHS.length],
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute bottom-0 opacity-0"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}rem`,
            animation: `float-up ${heart.duration}s ease-in ${heart.delay}s infinite`,
          }}
        >
          {heart.glyph}
        </span>
      ))}
    </div>
  );
}
