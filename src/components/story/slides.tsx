"use client";

import { useState } from "react";
import { WaxSeal } from "@/components/WaxSeal";
import { CountUpNumber } from "@/components/CountUpNumber";
import { FloatingHearts } from "@/components/story/FloatingHearts";
import { useElapsedTime } from "@/lib/hooks/useElapsedTime";
import { formatNumber, formatPercent, formatMonthLabel, formatLongDate } from "@/lib/utils/format";
import type { AnalysisResult } from "@/types/analysis";
import type { NarrativePayload } from "@/types/narrative";
import type { PhotoMoment } from "@/lib/photos";

const HEART_EMOJIS = new Set([
  "❤️", "❤", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "🩷", "🩵", "🩶",
  "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
]);

const CORE_DECLARATION_KEYS = ["eu te amo", "te amo", "amo você", "amo vc"];

export function heartsTotal(result: AnalysisResult): number {
  return result.emojis.ranking
    .filter((entry) => HEART_EMOJIS.has(entry.emoji))
    .reduce((sum, entry) => sum + entry.count, 0);
}

export function declarationsTotal(result: AnalysisResult): number {
  return CORE_DECLARATION_KEYS.reduce((sum, key) => sum + (result.love.declarations[key] ?? 0), 0);
}

/** Título grande e centralizado que todo slide usa em cima. */
function SlideTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-display text-2xl italic text-paper">{children}</p>;
}

function SlideRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-8 text-center">
      {children}
    </div>
  );
}

export function CoverSlide({ result }: { result: AnalysisResult }) {
  return (
    <SlideRoot>
      <FloatingHearts count={5} />
      <WaxSeal className="h-16 w-16" />
      <div>
        <p className="font-display text-4xl italic text-paper">Love Wrapped</p>
        {result.participants.length > 0 && (
          <p className="mt-3 font-body text-base text-muted">{result.participants.join(" & ")}</p>
        )}
      </div>
      <p className="font-body text-sm text-muted">Toque para ver a história de vocês ❤️</p>
    </SlideRoot>
  );
}

function CounterUnit({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-4xl text-gold">{value}</p>
      <p className="font-body text-xs text-muted">{label}</p>
    </div>
  );
}

export function CounterSlide({ startDate }: { startDate: Date }) {
  const elapsed = useElapsedTime(startDate);
  if (!elapsed) return null;

  return (
    <SlideRoot>
      <FloatingHearts count={4} />
      <SlideTitle>⏳ Juntos há</SlideTitle>
      <div className="grid grid-cols-3 gap-4">
        <CounterUnit value={elapsed.years} label={elapsed.years === 1 ? "ano" : "anos"} />
        <CounterUnit value={elapsed.months} label={elapsed.months === 1 ? "mês" : "meses"} />
        <CounterUnit value={elapsed.days} label={elapsed.days === 1 ? "dia" : "dias"} />
      </div>
      <p className="font-body text-lg tabular-nums text-paper">
        {String(elapsed.hours).padStart(2, "0")}:{String(elapsed.minutes).padStart(2, "0")}:
        {String(elapsed.seconds).padStart(2, "0")}
      </p>
      <p className="font-body text-xs text-muted">e contando... ❤️</p>
    </SlideRoot>
  );
}

export function OverviewSlide({ result }: { result: AnalysisResult }) {
  return (
    <SlideRoot>
      <SlideTitle>Nossa história</SlideTitle>
      <div>
        <p className="font-display text-6xl text-gold">
          <CountUpNumber value={result.overview.totalMessages} />
        </p>
        <p className="mt-1 font-body text-sm text-muted">mensagens trocadas</p>
      </div>
      <div>
        <p className="font-display text-4xl text-paper">
          <CountUpNumber value={result.overview.totalDays} />
        </p>
        <p className="mt-1 font-body text-sm text-muted">dias de conversa</p>
      </div>
      {result.messages.mostActiveMonth && (
        <p className="font-body text-sm text-muted">
          {formatMonthLabel(result.messages.mostActiveMonth.key)} foi o mês mais movimentado, com{" "}
          {formatNumber(result.messages.mostActiveMonth.count)} mensagens.
        </p>
      )}
    </SlideRoot>
  );
}

export function TalkerSlide({ result }: { result: AnalysisResult }) {
  const entries = Object.entries(result.messages.byParticipant).sort(([, a], [, b]) => b - a);
  const total = result.overview.totalMessages;

  return (
    <SlideRoot>
      <SlideTitle>💬 Quem falou mais?</SlideTitle>
      <div className="w-full max-w-xs space-y-5">
        {entries.map(([name, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={name}>
              <p className="font-display text-3xl text-paper">{formatPercent(pct)}%</p>
              <p className="font-body text-sm text-muted">{name}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/50">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--rose)" }} />
              </div>
            </div>
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
      <FloatingHearts count={4} />
      <SlideTitle>💌 Quem ama mais?</SlideTitle>
      <div>
        <p className="font-display text-6xl text-gold">
          <CountUpNumber value={declarationsTotal(result)} />
        </p>
        <p className="mt-1 font-body text-sm text-muted">declarações de amor</p>
      </div>

      {top.length > 0 && (
        <ul className="font-body text-sm text-muted">
          {top.map(([key, count]) => (
            <li key={key}>
              &ldquo;{key}&rdquo; — {formatNumber(count)}x
            </li>
          ))}
        </ul>
      )}

      {result.love.firstDeclaration && (
        <p className="font-body text-xs text-muted">
          {result.love.firstDeclaration.author} foi quem disse primeiro, em{" "}
          {formatLongDate(result.love.firstDeclaration.date)}.
        </p>
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
        <p className="font-body text-sm text-muted">Vocês preferem palavras a emojis por aqui.</p>
      </SlideRoot>
    );
  }

  return (
    <SlideRoot>
      <SlideTitle>😂 Emoji favorito</SlideTitle>
      <div className="flex items-end justify-center gap-6">
        {top.map(({ emoji, count }, i) => (
          <div key={emoji} className="flex flex-col items-center gap-2">
            <span style={{ fontSize: i === 0 ? "3.5rem" : "2.25rem" }}>{emoji}</span>
            <span className="font-body text-xs text-muted">{formatNumber(count)}x</span>
          </div>
        ))}
      </div>
      <p className="font-body text-sm text-muted">
        <CountUpNumber value={heartsTotal(result)} /> corações enviados no total ❤️
      </p>
    </SlideRoot>
  );
}

export function MomentsSlide({ photos }: { photos: PhotoMoment[] }) {
  const shown = photos.slice(0, 4);

  return (
    <SlideRoot>
      <SlideTitle>📷 Momentos</SlideTitle>
      <div className="grid grid-cols-2 gap-3">
        {shown.map((photo, i) => (
          <div
            key={photo.url}
            className="overflow-hidden rounded-xl border-4 border-paper/90 shadow-lg"
            style={{ transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs de blob locais, não servem pra next/image */}
            <img
              src={photo.url}
              alt=""
              className="h-28 w-28 object-cover sm:h-32 sm:w-32"
            />
          </div>
        ))}
      </div>
      <p className="font-body text-sm text-muted">
        {formatNumber(photos.length)} {photos.length === 1 ? "foto guardada" : "fotos guardadas"} nessa conversa
      </p>
    </SlideRoot>
  );
}

const HOUR_PERIODS: { label: string; range: [number, number]; phrase: string }[] = [
  { label: "madrugada", range: [0, 5], phrase: "Vocês são almas de madrugada 🌙" },
  { label: "manhã", range: [6, 11], phrase: "Vocês começam o dia conversando ☀️" },
  { label: "tarde", range: [12, 17], phrase: "As tardes de vocês são de papo 🌤️" },
  { label: "noite", range: [18, 23], phrase: "As noites de vocês são de conversa 🌆" },
];

export function periodFor(hour: number) {
  return HOUR_PERIODS.find(({ range: [start, end] }) => hour >= start && hour <= end) ?? HOUR_PERIODS[0];
}

export function HourlySlide({ result }: { result: AnalysisResult }) {
  const byHour = result.messages.byHour;
  const hours = Array.from({ length: 24 }, (_, h) => byHour[h] ?? 0);
  const max = Math.max(...hours, 1);
  const peakHour = hours.indexOf(Math.max(...hours));
  const peak = periodFor(peakHour);

  return (
    <SlideRoot>
      <SlideTitle>🕐 Horário de vocês</SlideTitle>
      <div className="flex h-24 w-full max-w-xs items-end gap-[3px]">
        {hours.map((count, hour) => (
          <div
            key={hour}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${(count / max) * 100}%`,
              minHeight: 2,
              background: hour === peakHour ? "var(--gold)" : "var(--rose)",
              opacity: hour === peakHour ? 1 : 0.55,
            }}
          />
        ))}
      </div>
      <p className="font-body text-sm text-muted">
        Pico às {String(peakHour).padStart(2, "0")}h — {peak.phrase}
      </p>
    </SlideRoot>
  );
}

export function AwardsSlide({ result }: { result: AnalysisResult }) {
  const awards = [
    { icon: "🗣️", label: "Quem mais fala", name: result.awards.talker },
    { icon: "💌", label: "Mais romântico(a)", name: result.awards.romantic },
    { icon: "🌙", label: "Coruja da madrugada", name: result.awards.nightOwl },
  ];

  return (
    <SlideRoot>
      <SlideTitle>🏆 Prêmios</SlideTitle>
      <div className="w-full max-w-xs space-y-3">
        {awards.map(({ icon, label, name }) => (
          <div key={label} className="rounded-2xl bg-wine/50 px-5 py-4 text-left">
            <p className="font-body text-xs text-muted">
              {icon} {label}
            </p>
            <p className="mt-1 font-display text-xl text-paper">{name ?? "ninguém ainda"}</p>
          </div>
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
    parts.push(`Teve uma sequência de ${formatNumber(streak.length)} dias seguidos conversando sem parar.`);
  }

  const hearts = heartsTotal(result);
  const declarations = declarationsTotal(result);
  if (hearts > 0 || declarations > 0) {
    parts.push(
      `Já são ${formatNumber(hearts)} corações enviados e ${formatNumber(declarations)} declarações de amor.`
    );
  }

  parts.push("Que venham muitos mais \u201cbom dia, amor\u201d pela frente. ❤️");

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

export function LetterSlide({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
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
      <WaxSeal className="h-12 w-12" />
      <SlideTitle>Carta final</SlideTitle>
      <p className="font-body text-base italic leading-relaxed text-paper">{displayedText}</p>

      {status === "error" && (
        <p className="font-body text-xs text-rose-soft">
          Não foi possível gerar a carta com IA agora. Mostrando a versão padrão.
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        {!aiText && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleGenerate();
            }}
            disabled={status === "loading"}
            className="rounded-full border border-gold/50 px-5 py-2 font-body text-sm text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
          >
            {status === "loading" ? "Escrevendo..." : "✨ Gerar carta com IA"}
          </button>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onReset();
          }}
          className="rounded-full bg-rose px-6 py-2.5 font-body text-sm font-semibold text-paper transition-colors hover:bg-rose-soft"
        >
          Enviar outra conversa
        </button>
      </div>
    </SlideRoot>
  );
}
