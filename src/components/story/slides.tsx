"use client";

import { useState, type ReactNode } from "react";
import { WaxSeal } from "@/components/WaxSeal";
import { CountUpNumber } from "@/components/CountUpNumber";
import { FloatingHearts } from "@/components/story/FloatingHearts";
import { useElapsedTime } from "@/lib/hooks/useElapsedTime";
import { periodFor, hourlyDistribution } from "@/lib/timeOfDay";
import {
  formatNumber,
  formatPercent,
  formatMonthLabel,
  formatLongDate,
} from "@/lib/utils/format";
import type { AnalysisResult } from "@/types/analysis";
import type { NarrativePayload } from "@/types/narrative";
import type { PhotoMoment } from "@/lib/photos";

const HEART_EMOJIS = new Set([
  "❤️",
  "❤",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🤎",
  "🖤",
  "🤍",
  "🩷",
  "🩵",
  "🩶",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "💟",
]);

const CORE_DECLARATION_KEYS = ["eu te amo", "te amo", "amo você", "amo vc"];

export function heartsTotal(result: AnalysisResult): number {
  return result.emojis.ranking
    .filter((entry) => HEART_EMOJIS.has(entry.emoji))
    .reduce((sum, entry) => sum + entry.count, 0);
}

export function declarationsTotal(result: AnalysisResult): number {
  return CORE_DECLARATION_KEYS.reduce(
    (sum, key) => sum + (result.love.declarations[key] ?? 0),
    0
  );
}

/**
 * Pequeno wrapper para fazer os elementos entrarem em sequência.
 * Não altera a lógica dos slides, apenas a apresentação.
 */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`story-reveal ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Título grande e centralizado que todo slide usa em cima. */
function SlideTitle({ children }: { children: ReactNode }) {
  return (
    <Reveal delay={80}>
      <p
        className="font-display text-2xl italic text-paper"
        style={{ textShadow: "0 4px 24px rgba(0,0,0,0.28)" }}
      >
        {children}
      </p>
    </Reveal>
  );
}

/**
 * Palco base dos slides.
 * Os dois círculos são só luzes desfocadas, para evitar um fundo completamente parado.
 */
function SlideRoot({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-[18%] h-52 w-52 rounded-full opacity-[0.12] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,126,171,0.9) 0%, transparent 70%)",
          animation: "story-orb-one 8s ease-in-out infinite alternate",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-[12%] h-56 w-56 rounded-full opacity-[0.1] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(224,182,104,0.9) 0%, transparent 70%)",
          animation: "story-orb-two 10s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-[1] flex w-full flex-col items-center justify-center gap-6">{children}</div>

      <style jsx global>{`
        .story-reveal {
          opacity: 0;
          animation: story-item-reveal 700ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
          will-change: transform, opacity, filter;
        }

        .story-glass-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.025)
          );
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(10px);
        }

        .story-soft-float {
          animation: story-soft-float 3.8s ease-in-out infinite;
        }

        .story-love-pulse {
          animation: story-love-pulse 2.2s ease-in-out infinite;
        }

        .story-prompt {
          animation: story-prompt 2s ease-in-out infinite;
        }

        .story-bar-fill {
          transform: scaleX(0);
          transform-origin: left center;
          animation: story-bar-grow 950ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .story-hour-bar {
          transform: scaleY(0);
          transform-origin: center bottom;
          animation: story-hour-grow 850ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .story-emoji-pop {
          opacity: 0;
          transform: translateY(18px) scale(0.45) rotate(-8deg);
          animation: story-emoji-pop 700ms cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        }

        .story-photo-frame {
          opacity: 0;
          animation: story-photo-enter 800ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
          will-change: transform, opacity;
        }

        .story-photo-image {
          transform: scale(1.03);
          animation: story-ken-burns 7s ease-in-out infinite alternate;
          will-change: transform;
        }

        .story-award-card {
          transition: transform 220ms ease, background 220ms ease,
            border-color 220ms ease;
        }

        .story-award-card:hover {
          transform: translateY(-2px) scale(1.01);
        }

        .story-letter-paper {
          position: relative;
          overflow: hidden;
        }

        .story-letter-paper::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.15) 45%,
            transparent 60%
          );
          transform: translateX(-120%);
          animation: story-paper-shine 5.5s ease-in-out infinite;
        }

        @keyframes story-item-reveal {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes story-soft-float {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-7px) rotate(1deg);
          }
        }

        @keyframes story-love-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes story-prompt {
          0%,
          100% {
            opacity: 0.55;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(3px);
          }
        }

        @keyframes story-bar-grow {
          to {
            transform: scaleX(1);
          }
        }

        @keyframes story-hour-grow {
          to {
            transform: scaleY(1);
          }
        }

        @keyframes story-emoji-pop {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.45) rotate(-8deg);
          }
          70% {
            opacity: 1;
            transform: translateY(-4px) scale(1.08) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0);
          }
        }

        @keyframes story-photo-enter {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.82) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        @keyframes story-ken-burns {
          0% {
            transform: scale(1.03) translate3d(-1%, -1%, 0);
          }
          100% {
            transform: scale(1.13) translate3d(1.5%, 1%, 0);
          }
        }

        @keyframes story-paper-shine {
          0%,
          60% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(140%);
          }
        }

        @keyframes story-orb-one {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(35px, -18px, 0) scale(1.18);
          }
        }

        @keyframes story-orb-two {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-28px, 20px, 0) scale(1.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .story-reveal,
          .story-soft-float,
          .story-love-pulse,
          .story-prompt,
          .story-bar-fill,
          .story-hour-bar,
          .story-emoji-pop,
          .story-photo-frame,
          .story-photo-image,
          .story-letter-paper::before {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export function CoverSlide({ result }: { result: AnalysisResult }) {
  return (
    <SlideRoot>
      <FloatingHearts count={7} />

      <Reveal delay={80}>
        <div className="story-soft-float relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-150 rounded-full bg-rose/20 blur-2xl"
          />
          <WaxSeal className="relative h-20 w-20 drop-shadow-2xl" />
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div>
          <p
            className="font-display text-5xl italic leading-none text-paper"
            style={{ textShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
          >
            Love Wrapped
          </p>
          <p className="mt-2 font-body text-[10px] uppercase tracking-[0.35em] text-gold/80">
            a história de vocês
          </p>

          {result.participants.length > 0 && (
            <div className="mt-5 inline-flex rounded-full border border-paper/10 bg-paper/5 px-4 py-2 backdrop-blur-sm">
              <p className="font-body text-sm text-muted">
                {result.participants.join(" & ")}
              </p>
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={520}>
        <div className="story-prompt flex flex-col items-center gap-1.5">
          <p className="font-body text-sm text-muted">
            Toque para ver a história de vocês ❤️
          </p>
          <span className="text-sm text-paper/50">⌄</span>
        </div>
      </Reveal>
    </SlideRoot>
  );
}

function CounterUnit({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="story-glass-card min-w-[76px] rounded-2xl px-3 py-4">
        <p className="font-display text-4xl leading-none text-gold">{value}</p>
        <p className="mt-1.5 font-body text-[11px] uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
      </div>
    </Reveal>
  );
}

export function CounterSlide({ startDate }: { startDate: Date }) {
  const elapsed = useElapsedTime(startDate);

  if (!elapsed) return null;

  return (
    <SlideRoot>
      <FloatingHearts count={7} />

      <SlideTitle>❤️ Nossa história</SlideTitle>

      <Reveal delay={180}>
        <p className="font-body text-sm uppercase tracking-[0.3em] text-muted">
          juntos há
        </p>
      </Reveal>

      <div className="grid grid-cols-3 gap-3">
        <CounterUnit
          value={elapsed.years}
          label="anos"
          delay={250}
        />

        <CounterUnit
          value={elapsed.months}
          label="meses"
          delay={380}
        />

        <CounterUnit
          value={elapsed.days}
          label="dias"
          delay={510}
        />
      </div>

      <Reveal delay={700}>
        <div className="story-glass-card rounded-[28px] px-8 py-5">
          <p className="font-display text-5xl tracking-[0.18em] text-gold">
            {String(elapsed.hours).padStart(2, "0")}:
            {String(elapsed.minutes).padStart(2, "0")}:
            {String(elapsed.seconds).padStart(2, "0")}
          </p>

          <p className="mt-2 font-body text-[10px] uppercase tracking-[0.35em] text-muted">
            horas • minutos • segundos
          </p>
        </div>
      </Reveal>

      <Reveal delay={900}>
        <p className="story-love-pulse font-body text-sm text-paper">
          Cada segundo virou uma memória ❤️
        </p>
      </Reveal>
    </SlideRoot>
  );
}

export function OverviewSlide({ result }: { result: AnalysisResult }) {
  return (
    <SlideRoot>
      <SlideTitle>Nossa história</SlideTitle>

      <Reveal delay={220} className="w-full max-w-xs">
        <div className="story-glass-card relative overflow-hidden rounded-[28px] px-5 py-7">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gold/10 blur-2xl"
          />
          <p className="relative font-display text-6xl leading-none text-gold">
            <CountUpNumber value={result.overview.totalMessages} />
          </p>
          <p className="relative mt-2 font-body text-sm text-muted">
            mensagens trocadas
          </p>
        </div>
      </Reveal>

      <Reveal delay={400}>
        <div className="flex items-baseline justify-center gap-2">
          <p className="font-display text-4xl text-paper">
            <CountUpNumber value={result.overview.totalDays} />
          </p>
          <p className="font-body text-sm text-muted">dias de conversa</p>
        </div>
      </Reveal>

      {result.messages.mostActiveMonth && (
        <Reveal delay={580} className="w-full max-w-xs">
          <p className="rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3 font-body text-sm leading-relaxed text-muted backdrop-blur-sm">
            <span className="text-paper">
              {formatMonthLabel(result.messages.mostActiveMonth.key)}
            </span>{" "}
            foi o mês mais movimentado, com{" "}
            <span className="text-gold">
              {formatNumber(result.messages.mostActiveMonth.count)} mensagens
            </span>
            .
          </p>
        </Reveal>
      )}
    </SlideRoot>
  );
}

export function TalkerSlide({ result }: { result: AnalysisResult }) {
  const entries = Object.entries(result.messages.byParticipant).sort(
    ([, a], [, b]) => b - a
  );
  const total = result.overview.totalMessages;

  return (
    <SlideRoot>
      <SlideTitle>💬 Quem falou mais?</SlideTitle>

      <div className="w-full max-w-xs space-y-3.5">
        {entries.map(([name, count], i) => {
          const pct = total > 0 ? (count / total) * 100 : 0;

          return (
            <Reveal key={name} delay={220 + i * 130}>
              <div className="story-glass-card rounded-2xl px-4 py-4 text-left">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-body text-sm text-muted">
                      {i === 0 ? "👑 " : ""}
                      {name}
                    </p>
                    <p className="mt-0.5 font-body text-xs text-paper/60">
                      {formatNumber(count)} mensagens
                    </p>
                  </div>

                  <p className="shrink-0 font-display text-3xl leading-none text-paper">
                    {formatPercent(pct)}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
                  <div
                    className="story-bar-fill h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background:
                        i === 0
                          ? "linear-gradient(90deg, var(--rose), var(--gold))"
                          : "var(--rose)",
                      animationDelay: `${420 + i * 150}ms`,
                    }}
                  />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </SlideRoot>
  );
}

export function LoveSlide({ result }: { result: AnalysisResult }) {
  const top = Object.entries(result.love.declarations)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <SlideRoot>
      <FloatingHearts count={6} />
      <SlideTitle>💌 Quem ama mais?</SlideTitle>

      <Reveal delay={220}>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 scale-150 rounded-full bg-rose/15 blur-3xl"
          />
          <p className="story-love-pulse relative font-display text-7xl leading-none text-gold">
            <CountUpNumber value={declarationsTotal(result)} />
          </p>
          <p className="relative mt-2 font-body text-sm text-muted">
            declarações de amor
          </p>
        </div>
      </Reveal>

      {top.length > 0 && (
        <div className="w-full max-w-xs space-y-2">
          {top.map(([key, count], i) => (
            <Reveal key={key} delay={420 + i * 100}>
              <div className="rounded-2xl border border-rose/15 bg-rose/5 px-4 py-2.5 backdrop-blur-sm">
                <p className="font-body text-sm text-muted">
                  <span className="italic text-paper">&ldquo;{key}&rdquo;</span>
                  <span className="mx-2 text-paper/30">•</span>
                  <span className="text-gold">{formatNumber(count)}x</span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {result.love.firstDeclaration && (
        <Reveal delay={760} className="w-full max-w-xs">
          <p className="font-body text-xs leading-relaxed text-muted">
            <span className="text-paper">{result.love.firstDeclaration.author}</span>{" "}
            foi quem disse primeiro, em{" "}
            <span className="text-paper">
              {formatLongDate(result.love.firstDeclaration.date)}
            </span>
            .
          </p>
        </Reveal>
      )}
    </SlideRoot>
  );
}

export function EmojiSlide({ result }: { result: AnalysisResult }) {
  const top = result.emojis.ranking.slice(0, 3);

  if (top.length === 0) {
    return (
      <SlideRoot>
        <SlideTitle>😂 Emojis</SlideTitle>
        <Reveal delay={260}>
          <p className="font-body text-sm text-muted">
            Vocês preferem palavras a emojis por aqui.
          </p>
        </Reveal>
      </SlideRoot>
    );
  }

  return (
    <SlideRoot>
      <SlideTitle>😂 Emoji favorito</SlideTitle>

      <div className="flex items-end justify-center gap-5">
        {top.map(({ emoji, count }, i) => (
          <div
            key={emoji}
            className="story-emoji-pop flex flex-col items-center gap-2"
            style={{ animationDelay: `${220 + i * 130}ms` }}
          >
            <div
              className={`${
                i === 0
                  ? "story-glass-card story-soft-float h-24 w-24"
                  : "h-16 w-16 bg-paper/5"
              } flex items-center justify-center rounded-full`}
            >
              <span
                style={{
                  fontSize: i === 0 ? "3.6rem" : "2.3rem",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.22))",
                }}
              >
                {emoji}
              </span>
            </div>

            <span className="font-body text-xs text-muted">
              {i === 0 && <span className="mr-1 text-gold">#1</span>}
              {formatNumber(count)}x
            </span>
          </div>
        ))}
      </div>

      <Reveal delay={700}>
        <div className="rounded-full border border-paper/10 bg-paper/5 px-4 py-2 backdrop-blur-sm">
          <p className="font-body text-sm text-muted">
            <span className="font-display text-lg text-paper">
              <CountUpNumber value={heartsTotal(result)} />
            </span>{" "}
            corações enviados no total ❤️
          </p>
        </div>
      </Reveal>
    </SlideRoot>
  );
}

export function MomentsSlide({ photos }: { photos: PhotoMoment[] }) {
  const shown = photos.slice(0, 4);

  return (
    <SlideRoot>
      <SlideTitle>📷 Momentos</SlideTitle>

      <div className="grid grid-cols-2 gap-3.5">
        {shown.map((photo, i) => {
          const rotation = i % 2 === 0 ? -4 : 4;

          return (
            <div
              key={photo.url}
              className="story-photo-frame"
              style={{ animationDelay: `${180 + i * 120}ms` }}
            >
              <div
                className="overflow-hidden rounded-xl border-[5px] border-paper/90 bg-paper shadow-2xl"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- URLs de blob locais, não servem pra next/image */}
                  <img
                    src={photo.url}
                    alt="Momento da conversa"
                    className="story-photo-image h-28 w-28 object-cover sm:h-32 sm:w-32"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Reveal delay={720}>
        <p className="font-body text-sm text-muted">
          <span className="text-paper">{formatNumber(photos.length)}</span>{" "}
          {photos.length === 1 ? "foto guardada" : "fotos guardadas"} nessa
          conversa
        </p>
      </Reveal>
    </SlideRoot>
  );
}

export function HourlySlide({ result }: { result: AnalysisResult }) {
  const hours = hourlyDistribution(result.messages.byHour);
  const max = Math.max(...hours, 1);
  const peakHour = hours.indexOf(Math.max(...hours));
  const peak = periodFor(peakHour);

  return (
    <SlideRoot>
      <SlideTitle>🕐 Horário de vocês</SlideTitle>

      <Reveal delay={200} className="w-full max-w-xs">
        <div className="story-glass-card rounded-3xl px-4 pb-4 pt-5">
          <div className="flex h-28 w-full items-end gap-[3px]">
            {hours.map((count, hour) => (
              <div
                key={hour}
                className="story-hour-bar flex-1 rounded-t-sm"
                style={{
                  height: `${(count / max) * 100}%`,
                  minHeight: 2,
                  background:
                    hour === peakHour
                      ? "linear-gradient(180deg, var(--gold), var(--rose))"
                      : "var(--rose)",
                  opacity: hour === peakHour ? 1 : 0.48,
                  animationDelay: `${260 + hour * 22}ms`,
                  boxShadow:
                    hour === peakHour ? "0 0 18px rgba(224,182,104,0.3)" : "none",
                }}
                title={`${String(hour).padStart(2, "0")}h: ${formatNumber(count)} mensagens`}
              />
            ))}
          </div>

          <div className="mt-2 flex justify-between font-body text-[9px] text-muted opacity-60">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={720}>
        <div className="rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3">
          <p className="font-body text-sm text-muted">
            Pico às{" "}
            <span className="font-display text-xl text-gold">
              {String(peakHour).padStart(2, "0")}h
            </span>{" "}
            — {peak.phrase}
          </p>
        </div>
      </Reveal>
    </SlideRoot>
  );
}


export function PersonalitySlide({ result }: { result: AnalysisResult }) {
  const messages = result.overview.totalMessages;
  const hearts = heartsTotal(result);
  const declarations = declarationsTotal(result);
  const emojis = result.emojis.ranking[0]?.emoji;
  const streak = result.messages.longestStreak?.length ?? 0;

  let title = "💕 Casal Romântico";
  let description =
    "Vocês transformam pequenas conversas em grandes memórias.";
  let level = 82;

  if (messages > 10000) {
    title = "💬 Casal Conversador";
    description =
      "Uma história construída em milhares de mensagens e momentos compartilhados.";
    level = 88;
  }

  if (hearts > 100 || declarations > 20) {
    title = "❤️ Casal Intensidade Máxima";
    description =
      "Carinho, declarações e muitos sinais de amor apareceram nessa história.";
    level = 96;
  }

  if (emojis === "😂" || emojis === "🤣") {
    title = "😂 Casal da Risada";
    description =
      "O humor virou uma das maiores marcas da conversa de vocês.";
    level = 90;
  }

  return (
    <SlideRoot>
      <FloatingHearts count={8} />

      <SlideTitle>✨ Personalidade de vocês</SlideTitle>

      <Reveal delay={180}>
        <p className="font-body text-xs uppercase tracking-[0.35em] text-muted">
          vocês são...
        </p>
      </Reveal>

      <Reveal delay={350} className="w-full max-w-xs">
        <div className="story-glass-card rounded-[32px] px-6 py-8">
          <p className="font-display text-4xl leading-tight text-gold">
            {title}
          </p>

          <p className="mt-5 font-body text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </Reveal>

      <Reveal delay={650} className="w-full max-w-xs">
        <div className="rounded-2xl border border-paper/10 bg-paper/5 px-4 py-3 backdrop-blur-sm">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-muted">
            nível de conexão
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="story-bar-fill h-full rounded-full"
              style={{
                width: `${level}%`,
                background:
                  "linear-gradient(90deg, var(--rose), var(--gold))",
              }}
            />
          </div>

          <p className="mt-2 font-display text-2xl text-gold">
            {level}%
          </p>
        </div>
      </Reveal>

      <Reveal delay={900}>
        <p className="font-body text-xs leading-relaxed text-paper">
          Não são apenas mensagens.
          <br />
          São pequenos pedaços de vocês ❤️
        </p>
      </Reveal>

      {streak > 0 && (
        <Reveal delay={1050}>
          <p className="font-body text-xs text-muted">
            🔥 {formatNumber(streak)} dias de sequência
          </p>
        </Reveal>
      )}
    </SlideRoot>
  );
}

export function AwardsSlide({ result }: { result: AnalysisResult }) {
  const awards = [
    {
      icon: "🗣️",
      title: "Rei/Rainha das mensagens",
      winner: result.awards.talker,
      detail: `${formatNumber(result.overview.totalMessages)} mensagens fizeram parte dessa história.`,
    },
    {
      icon: "💌",
      title: "Coração de ouro",
      winner: result.awards.romantic,
      detail: `${formatNumber(declarationsTotal(result))} declarações de amor encontradas.`,
    },
    {
      icon: "🌙",
      title: "Conversas de madrugada",
      winner: result.awards.nightOwl,
      detail: "Porque algumas das melhores conversas acontecem quando o mundo dorme.",
    },
    {
      icon: "❤️",
      title: "Mais corações enviados",
      winner: `${formatNumber(heartsTotal(result))} corações`,
      detail: "Pequenos símbolos que marcaram a conversa de vocês.",
    },
    
  ];

  return (
    <SlideRoot>
      <FloatingHearts count={5} />

      <SlideTitle>🏆 Prêmios da história</SlideTitle>

      <div className="w-full max-w-xs space-y-3">
        {awards.map(({ icon, title, winner, detail }, i) => (
          <Reveal key={title} delay={220 + i * 160}>
            <div className="story-award-card story-glass-card rounded-2xl px-4 py-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-wine/60 text-2xl">
                  {icon}
                </div>

                <div>
                  <p className="font-body text-[8px] uppercase tracking-[0.12em] text-muted">
                    {title}
                  </p>

                  <p className="mt-1 font-display text-xl text-gold">
                    {winner ?? "ninguém ainda"}
                  </p>
                </div>
              </div>

              <p className="mt-2 font-body text-xs leading-relaxed text-muted">
                {detail}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </SlideRoot>
  );
}

function buildLetter(result: AnalysisResult): string {
  const { totalDays, totalMessages, averagePerDay } = result.overview;
  const monthLabel = result.messages.mostActiveMonth
    ? formatMonthLabel(result.messages.mostActiveMonth.key)
    : null;
  const streak = result.messages.longestStreak;

  const parts: string[] = [
    `Nesses ${formatNumber(totalDays)} dias, vocês trocaram ${formatNumber(totalMessages)} mensagens — uma média de ${formatNumber(averagePerDay)} por dia.`,
  ];

  if (monthLabel) {
    parts.push(`${monthLabel} foi o mês em que mais se falaram.`);
  }

  if (streak && streak.length > 1) {
    parts.push(
      `Teve uma sequência de ${formatNumber(streak.length)} dias seguidos conversando sem parar.`
    );
  }

  const hearts = heartsTotal(result);
  const declarations = declarationsTotal(result);
  if (hearts > 0 || declarations > 0) {
    parts.push(
      `Já são ${formatNumber(hearts)} corações enviados e ${formatNumber(declarations)} declarações de amor.`
    );
  }

  parts.push("Que venham muitos mais “bom dia, amor” pela frente. ❤️");

  return parts.join(" ");
}

/** Monta os números resumidos que vão pra IA — nunca as mensagens em si. */
export function buildNarrativePayload(result: AnalysisResult): NarrativePayload {
  const byHour = result.messages.byHour;
  const hours = Array.from({ length: 24 }, (_, h) => byHour[h] ?? 0);
  const hasHourData = hours.some((count) => count > 0);
  const peakHour = hasHourData ? hours.indexOf(Math.max(...hours)) : null;

  return {
    participants: result.participants,
    totalMessages: result.overview.totalMessages,
    totalDays: result.overview.totalDays,
    averagePerDay: result.overview.averagePerDay,
    mostActiveMonthLabel: result.messages.mostActiveMonth
      ? formatMonthLabel(result.messages.mostActiveMonth.key)
      : null,
    favoriteEmoji: result.emojis.ranking[0]?.emoji ?? null,
    heartsTotal: heartsTotal(result),
    declarationsTotal: declarationsTotal(result),
    longestStreakDays: result.messages.longestStreak?.length ?? null,
    peakHourPeriod: peakHour !== null ? periodFor(peakHour).label : null,
    firstDeclaration: result.love.firstDeclaration
      ? {
          author: result.love.firstDeclaration.author,
          dateLabel: formatLongDate(result.love.firstDeclaration.date),
        }
      : null,
  };
}

type LetterStatus = "idle" | "loading" | "error";

export function LetterSlide({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  const [aiText, setAiText] = useState<string | null>(null);
  const [status, setStatus] = useState<LetterStatus>("idle");

  const displayedText = aiText ?? buildLetter(result);

  async function handleGenerate() {
    setStatus("loading");

    try {
      const response = await fetch("/api/narrative", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildNarrativePayload(result)),
      });

      const data = await response.json();

      if (!response.ok || !data.narrative) {
        throw new Error(data.error ?? "Falha ao gerar a carta.");
      }

      setAiText(data.narrative as string);
      setStatus("idle");
    } catch (err) {
      console.error("Erro ao gerar carta com IA:", err);
      setStatus("error");
    }
  }

  return (
    <SlideRoot>
      <FloatingHearts count={4} />

      <Reveal delay={80}>
        <div className="story-soft-float">
          <WaxSeal className="h-14 w-14 drop-shadow-xl" />
        </div>
      </Reveal>

      <SlideTitle>Carta final</SlideTitle>

      <Reveal delay={260} className="w-full max-w-xs">
        <div className="story-letter-paper story-glass-card max-h-[320px] overflow-y-auto rounded-[26px] border-gold/15 px-5 py-5 text-left">
          <div className="mb-3 h-px w-12 bg-gold/50" />
          <p className="relative font-body text-[14px] italic leading-[1.75] text-paper">
            {displayedText}
          </p>
        </div>
      </Reveal>

      {status === "error" && (
        <Reveal delay={100}>
          <p className="max-w-xs font-body text-xs text-rose-soft">
            Não foi possível gerar a carta com IA agora. Mostrando a versão padrão.
          </p>
        </Reveal>
      )}

      <Reveal delay={440}>
        <div className="flex flex-col items-center gap-3">
          {!aiText && (
            <button
              type="button"
              data-story-interactive
              onClick={(event) => {
                event.stopPropagation();
                handleGenerate();
              }}
              disabled={status === "loading"}
              className="rounded-full border border-gold/50 bg-gold/5 px-5 py-2.5 font-body text-sm text-gold backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold/10 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Escrevendo..." : "✨ Gerar carta com IA"}
            </button>
          )}

          <button
            type="button"
            data-story-interactive
            onClick={(event) => {
              event.stopPropagation();
              onReset();
            }}
            className="rounded-full bg-rose px-6 py-2.5 font-body text-sm font-semibold text-paper shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-soft active:translate-y-0"
          >
            Enviar outra conversa
          </button>
        </div>
      </Reveal>
    </SlideRoot>
  );
}
