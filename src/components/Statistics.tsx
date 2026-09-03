"use client";

import { WaxSeal } from "@/components/WaxSeal";
import { MessagesTimelineChart } from "@/components/MessagesTimelineChart";
import { CountUpNumber } from "@/components/CountUpNumber";
import { RelationshipDateInput } from "@/components/RelationshipDateInput";
import { BackgroundPhotoPicker } from "@/components/BackgroundPhotoPicker";
import { ShareLink } from "@/components/ShareLink";
import { useElapsedTime } from "@/lib/hooks/useElapsedTime";
import { formatNumber, formatPercent, formatMonthLabel } from "@/lib/utils/format";
import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";

/**
 * Emojis de coração considerados pro card "corações enviados". Casais nem sempre
 * usam o ❤️ vermelho — juntamos as variações de cor pra não subestimar o número.
 */
const HEART_EMOJIS = new Set([
  "❤️", "❤", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "🩷", "🩵", "🩶",
  "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
]);

const CORE_DECLARATION_KEYS = ["eu te amo", "te amo", "amo você", "amo vc"];

function StatCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-wine/50 p-5 text-center">
      <p className="font-display text-3xl text-gold">{value}</p>
      <p className="mt-1 font-body text-xs text-muted">{label}</p>
    </div>
  );
}

function CounterCard({ startDate }: { startDate: Date }) {
  const elapsed = useElapsedTime(startDate);
  if (!elapsed) return null;

  return (
    <div className="mt-4 rounded-2xl bg-wine/40 p-6 text-center">
      <p className="font-display text-lg italic text-paper">⏳ Juntos há</p>
      <p className="mt-2 font-body text-sm text-paper">
        {elapsed.years} {elapsed.years === 1 ? "ano" : "anos"}, {elapsed.months}{" "}
        {elapsed.months === 1 ? "mês" : "meses"} e {elapsed.days} {elapsed.days === 1 ? "dia" : "dias"}
      </p>
      <p className="mt-1 font-body text-xs tabular-nums text-muted">
        {String(elapsed.hours).padStart(2, "0")}:{String(elapsed.minutes).padStart(2, "0")}:
        {String(elapsed.seconds).padStart(2, "0")}
      </p>
    </div>
  );
}

function PhotoGallery({ photos }: { photos: PhotoMoment[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl bg-wine/40 p-6">
      <p className="font-display text-lg italic text-paper">📷 Fotos do casal</p>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element -- URLs de blob locais, não servem pra next/image
          <img
            key={photo.url}
            src={photo.url}
            alt=""
            className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function TalkerSplit({
  byParticipant,
  totalMessages,
}: {
  byParticipant: Record<string, number>;
  totalMessages: number;
}) {
  const entries = Object.entries(byParticipant);
  if (entries.length === 0 || totalMessages === 0) return null;

  if (entries.length === 2) {
    const [[nameA, countA], [nameB, countB]] = entries;
    const pctA = (countA / totalMessages) * 100;
    const pctB = (countB / totalMessages) * 100;

    return (
      <div>
        <div className="flex justify-between font-body text-sm text-paper">
          <span>
            {nameA} <span className="text-muted">{formatPercent(pctA)}%</span>
          </span>
          <span>
            <span className="text-muted">{formatPercent(pctB)}%</span> {nameB}
          </span>
        </div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink/50">
          <div style={{ width: `${pctA}%`, background: "var(--rose)" }} />
          <div style={{ width: `${pctB}%`, background: "var(--gold)" }} />
        </div>
      </div>
    );
  }

  // Mais de 2 (ou só 1) participantes: cai pra uma lista de barras individuais.
  return (
    <div className="space-y-3">
      {entries
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => {
          const pct = (count / totalMessages) * 100;
          return (
            <div key={name}>
              <div className="flex justify-between font-body text-sm text-paper">
                <span>{name}</span>
                <span className="text-muted">{formatPercent(pct)}%</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/50">
                <div style={{ width: `${pct}%`, background: "var(--rose)" }} className="h-full rounded-full" />
              </div>
            </div>
          );
        })}
    </div>
  );
}

function EmojiRankingList({ ranking }: { ranking: { emoji: string; count: number }[] }) {
  if (ranking.length === 0) {
    return <p className="font-body text-sm text-muted">Vocês não usaram muitos emojis por aqui.</p>;
  }

  const top = ranking.slice(0, 5);
  const max = top[0].count;

  return (
    <div className="space-y-2.5">
      {top.map(({ emoji, count }) => (
        <div key={emoji} className="flex items-center gap-3">
          <span className="w-7 text-xl leading-none">{emoji}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/50">
            <div
              className="h-full rounded-full"
              style={{ width: `${(count / max) * 100}%`, background: "var(--gold)" }}
            />
          </div>
          <span className="w-14 text-right font-body text-sm text-muted">{formatNumber(count)}</span>
        </div>
      ))}
    </div>
  );
}

export function Statistics({
  result,
  photos,
  relationshipStartDateValue,
  onRelationshipStartDateChange,
  backgroundPhotoUrl,
  onBackgroundPhotoChange,
  onReset,
  onOpenStory,
}: {
  result: AnalysisResult;
  photos: PhotoMoment[];
  relationshipStartDateValue: string;
  onRelationshipStartDateChange: (value: string) => void;
  backgroundPhotoUrl: string | null;
  onBackgroundPhotoChange: (url: string | null) => void;
  onReset: () => void;
  onOpenStory: () => void;
}) {
  const relationshipStartDate = relationshipStartDateValue
    ? new Date(`${relationshipStartDateValue}T00:00:00`)
    : null;

  const heartsTotal = result.emojis.ranking
    .filter((entry) => HEART_EMOJIS.has(entry.emoji))
    .reduce((sum, entry) => sum + entry.count, 0);

  const declarationsTotal = CORE_DECLARATION_KEYS.reduce(
    (sum, key) => sum + (result.love.declarations[key] ?? 0),
    0
  );

  return (
    <div className="w-full max-w-xl">
      <WaxSeal className="mx-auto mb-5 h-12 w-12" />
      <h1 className="text-center font-display text-4xl italic tracking-tight text-paper">
        Vocês em números
      </h1>
      {result.participants.length > 0 && (
        <p className="mt-2 text-center font-body text-sm text-muted">
          {result.participants.join(" & ")}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3">
        <StatCard value={<CountUpNumber value={result.overview.totalMessages} />} label="mensagens" />
        <StatCard value={<CountUpNumber value={result.overview.totalDays} />} label="dias conversando" />
        <StatCard
          value={
            <>
              <CountUpNumber value={heartsTotal} /> ❤️
            </>
          }
          label="corações enviados"
        />
        <StatCard value={<CountUpNumber value={declarationsTotal} />} label="declarações de amor" />
      </div>

      {relationshipStartDate && <CounterCard startDate={relationshipStartDate} />}

      <PhotoGallery photos={photos} />

      <div className="mt-4 rounded-2xl bg-wine/40 p-6">
        <p className="font-display text-lg italic text-paper">📈 Ao longo do tempo</p>
        <div className="mt-4">
          <MessagesTimelineChart series={result.timeline.series} />
        </div>
        {result.messages.mostActiveMonth && (
          <p className="mt-3 font-body text-xs text-muted">
            Mês mais ativo: {formatMonthLabel(result.messages.mostActiveMonth.key)} — {" "}
            {formatNumber(result.messages.mostActiveMonth.count)} mensagens
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-wine/40 p-6">
        <p className="font-display text-lg italic text-paper">💬 Quem falou mais?</p>
        <div className="mt-4">
          <TalkerSplit byParticipant={result.messages.byParticipant} totalMessages={result.overview.totalMessages} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-wine/40 p-6">
        <p className="font-display text-lg italic text-paper">😂 Emoji favorito</p>
        <div className="mt-4">
          <EmojiRankingList ranking={result.emojis.ranking} />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-5 rounded-2xl bg-wine/30 p-6">
        <p className="font-display text-base italic text-paper">✨ Personalizar</p>
        <RelationshipDateInput value={relationshipStartDateValue} onChange={onRelationshipStartDateChange} />
        <BackgroundPhotoPicker backgroundUrl={backgroundPhotoUrl} onChange={onBackgroundPhotoChange} />
        <div className="h-px w-full bg-paper/10" />
        <ShareLink
          result={result}
          photos={photos}
          relationshipStartDateValue={relationshipStartDateValue}
          backgroundPhotoUrl={backgroundPhotoUrl}
        />
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onOpenStory}
          className="rounded-full bg-rose px-7 py-3 font-body text-sm font-semibold text-paper transition-colors hover:bg-rose-soft"
        >
          Ver retrospectiva em Story ✨
        </button>
        <div className="mt-4">
          <button
            type="button"
            onClick={onReset}
            className="font-body text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:text-paper"
          >
            Enviar outra conversa
          </button>
        </div>
      </div>
    </div>
  );
}
