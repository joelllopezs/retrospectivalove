"use client";

import { WaxSeal } from "@/components/WaxSeal";
import { MessagesTimelineChart } from "@/components/MessagesTimelineChart";
import { CountUpNumber } from "@/components/CountUpNumber";
import { ShareStory } from "@/components/ShareStory";

import {
  formatNumber,
  formatPercent,
  formatMonthLabel,
} from "@/lib/utils/format";

import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";
import type { StoryData } from "@/types/story";

/**
 * Emojis de coração considerados pro card "corações enviados".
 */
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

const CORE_DECLARATION_KEYS = [
  "eu te amo",
  "te amo",
  "amo você",
  "amo vc",
];

function StatCard({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-wine/50 p-5 text-center">
      <p className="font-display text-3xl text-gold">
        {value}
      </p>

      <p className="mt-1 font-body text-xs text-muted">
        {label}
      </p>
    </div>
  );
}

function LoveSentence({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mt-2 font-body text-xs leading-relaxed text-muted">
      {children}
    </p>
  );
}

function PhotoGallery({
  photos,
}: {
  photos: PhotoMoment[];
}) {
  if (photos.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl bg-wine/40 p-6">
      <p className="font-display text-lg italic text-paper">
        📷 Fotos do casal
      </p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {photos.map((photo) => (
          // eslint-disable-next-line @next/next/no-img-element
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

  if (
    entries.length === 0 ||
    totalMessages === 0
  ) {
    return null;
  }

  if (entries.length === 2) {
    const [
      [nameA, countA],
      [nameB, countB],
    ] = entries;

    const pctA =
      (countA / totalMessages) * 100;

    const pctB =
      (countB / totalMessages) * 100;

    return (
      <div>
        <div className="flex justify-between font-body text-sm text-paper">
          <span>
            {nameA}{" "}
            <span className="text-muted">
              {formatPercent(pctA)}%
            </span>
          </span>

          <span>
            <span className="text-muted">
              {formatPercent(pctB)}%
            </span>{" "}
            {nameB}
          </span>
        </div>

        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink/50">
          <div
            style={{
              width: `${pctA}%`,
              background:
                "var(--rose)",
            }}
          />

          <div
            style={{
              width: `${pctB}%`,
              background:
                "var(--gold)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries
        .sort(([, a], [, b]) => b - a)
        .map(([name, count]) => {
          const pct =
            (count / totalMessages) * 100;

          return (
            <div key={name}>
              <div className="flex justify-between font-body text-sm text-paper">
                <span>{name}</span>

                <span className="text-muted">
                  {formatPercent(pct)}%
                </span>
              </div>

              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/50">
                <div
                  style={{
                    width: `${pct}%`,
                    background:
                      "var(--rose)",
                  }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

function EmojiRankingList({
  ranking,
}: {
  ranking: {
    emoji: string;
    count: number;
  }[];
}) {
  if (ranking.length === 0) {
    return (
      <p className="font-body text-sm text-muted">
        Vocês não usaram muitos emojis por aqui.
      </p>
    );
  }

  const top = ranking.slice(0, 5);

  const max = top[0].count;

  return (
    <div className="space-y-2.5">
      {top.map(({ emoji, count }) => (
        <div
          key={emoji}
          className="flex items-center gap-3"
        >
          <span className="w-7 text-xl">
            {emoji}
          </span>

          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/50">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(count / max) * 100}%`,
                background:
                  "var(--gold)",
              }}
            />
          </div>

          <span className="w-14 text-right font-body text-sm text-muted">
            {formatNumber(count)}
          </span>
        </div>
      ))}
    </div>
  );
}

function AwardsSection({
  awards,
}: {
  awards: AnalysisResult["awards"];
}) {
  const items = [
    {
      icon: "💬",
      title: "Conversador oficial",
      description:
        "Quem mais esteve presente nessa história",
      value: awards.talker,
    },
    {
      icon: "❤️",
      title: "Coração da relação",
      description:
        "Quem mais demonstrou carinho por aqui",
      value: awards.romantic,
    },
    {
      icon: "🌙",
      title: "Companheiro(a) da madrugada",
      description:
        "Quem mais apareceu nas conversas noturnas",
      value: awards.nightOwl,
    },
  ];

  const available = items.filter(
    (item) => item.value
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl bg-wine/40 p-6">

      <p className="font-display text-lg italic text-paper">
        🏆 Momentos especiais
      </p>

      <div className="mt-4 space-y-3">

        {available.map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-ink/30 p-4"
          >

            <div className="flex items-start gap-3">

              <span className="text-2xl">
                {item.icon}
              </span>

              <div>

                <p className="font-display text-lg text-paper">
                  {item.title}
                </p>

                <p className="mt-1 font-body text-xs text-muted">
                  {item.description}
                </p>

                <p className="mt-2 font-display text-xl text-gold">
                  {item.value}
                </p>

              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export function Statistics({
  result,
  photos,
  story,
  showShare = false,
  onReset,
  onOpenStory,
  
}: {
  result: AnalysisResult;
  photos: PhotoMoment[];
  story: StoryData | null;
  onReset: () => void;
  onOpenStory: () => void;
  showShare?: boolean;
}) {
  const heartsTotal =
    result.emojis.ranking
      .filter((entry) =>
        HEART_EMOJIS.has(entry.emoji)
      )
      .reduce(
        (sum, entry) =>
          sum + entry.count,
        0
      );

  const declarationsTotal =
    CORE_DECLARATION_KEYS.reduce(
      (sum, key) =>
        sum +
        (result.love.declarations[key] ??
          0),
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

      <div className="mt-8 space-y-4">

  <div className="rounded-3xl bg-wine/50 p-6 text-center">

    <p className="font-display text-5xl text-gold">
      <CountUpNumber
        value={result.overview.totalMessages}
      />
    </p>

    <p className="mt-2 font-display text-xl text-paper">
      mensagens
    </p>

    <LoveSentence>
      Conversas que construíram a história de vocês.
    </LoveSentence>

  </div>


  <div className="grid grid-cols-2 gap-3">

    <div className="rounded-2xl bg-wine/50 p-5 text-center">

      <p className="font-display text-3xl text-gold">
        <CountUpNumber
          value={result.overview.totalDays}
        />
      </p>

      <p className="mt-1 font-body text-xs text-muted">
        dias juntos nessa jornada
      </p>

    </div>


    <div className="rounded-2xl bg-wine/50 p-5 text-center">

      <p className="font-display text-3xl text-gold">
        <CountUpNumber
          value={heartsTotal}
        /> ❤️
      </p>

      <p className="mt-1 font-body text-xs text-muted">
        pequenos gestos de carinho
      </p>

    </div>

  </div>


  <div className="rounded-3xl bg-wine/50 p-6 text-center">

    <p className="font-display text-4xl text-gold">
      <CountUpNumber
        value={declarationsTotal}
      />
    </p>

    <p className="mt-2 font-display text-xl text-paper">
      declarações de amor
    </p>

    <LoveSentence>
      Palavras que fizeram parte da história de vocês.
    </LoveSentence>

  </div>

</div>

      <PhotoGallery photos={photos} />

      <div className="mt-4 rounded-2xl bg-wine/40 p-6">

        <p className="font-display text-lg italic text-paper">
          📈 Ao longo do tempo
        </p>

        <div className="mt-4">
          <MessagesTimelineChart
            series={
              result.timeline.series
            }
          />
        </div>

        {result.messages.mostActiveMonth && (
          <p className="mt-3 font-body text-xs text-muted">
            Mês mais ativo:{" "}
            {formatMonthLabel(
              result.messages
                .mostActiveMonth.key
            )}{" "}
            —{" "}
            {formatNumber(
              result.messages
                .mostActiveMonth.count
            )}{" "}
            mensagens
          </p>
        )}

      </div>

      <div className="mt-4 rounded-2xl bg-wine/40 p-6">

        <p className="font-display text-lg italic text-paper">
          💬 Quem falou mais?
        </p>

        <div className="mt-4">
          <TalkerSplit
            byParticipant={
              result.messages.byParticipant
            }
            totalMessages={
              result.overview.totalMessages
            }
          />
        </div>

      </div>


      <div className="mt-4 rounded-2xl bg-wine/40 p-6">

        <p className="font-display text-lg italic text-paper">
          😂 Emoji favorito
        </p>

        <div className="mt-4">
          <EmojiRankingList
            ranking={
              result.emojis.ranking
            }
          />
        </div>

      </div>

<AwardsSection
  awards={result.awards}
/>
      <div className="mt-8 space-y-4">

        {showShare && story && (
  <ShareStory story={story} />
)}

        <div className="text-center">

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

    </div>
  );
}