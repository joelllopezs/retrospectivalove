"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import {
  CoverSlide,
  CounterSlide,
  OverviewSlide,
  TalkerSlide,
  LoveSlide,
  EmojiSlide,
  MomentsSlide,
  HourlySlide,
  AwardsSlide,
  LetterSlide,
} from "@/components/story/slides";
import { AudioController } from "@/components/story/AudioController";
import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";

interface SlideDef {
  id: string;
  /** ms até avançar sozinho. `null` = não avança sozinho (fica até o usuário agir). */
  duration: number | null;
  render: (result: AnalysisResult, onReset: () => void) => React.ReactNode;
}

function buildSlides(photos: PhotoMoment[], relationshipStart: Date | null): SlideDef[] {
  const slides: SlideDef[] = [{ id: "cover", duration: 3500, render: (r) => <CoverSlide result={r} /> }];

  if (relationshipStart) {
    slides.push({ id: "counter", duration: 6000, render: () => <CounterSlide startDate={relationshipStart} /> });
  }

  slides.push(
    { id: "overview", duration: 5000, render: (r) => <OverviewSlide result={r} /> },
    { id: "talker", duration: 5000, render: (r) => <TalkerSlide result={r} /> },
    { id: "love", duration: 5500, render: (r) => <LoveSlide result={r} /> },
    { id: "emoji", duration: 5000, render: (r) => <EmojiSlide result={r} /> }
  );

  if (photos.length > 0) {
    slides.push({ id: "moments", duration: 5500, render: () => <MomentsSlide photos={photos} /> });
  }

  slides.push(
    { id: "hourly", duration: 5000, render: (r) => <HourlySlide result={r} /> },
    { id: "awards", duration: 5500, render: (r) => <AwardsSlide result={r} /> },
    { id: "letter", duration: null, render: (r, onReset) => <LetterSlide result={r} onReset={onReset} /> }
  );

  return slides;
}

const SWIPE_THRESHOLD = 40;

export function Story({
  result,
  photos,
  relationshipStart,
  backgroundPhotoUrl,
  onExit,
  onReset,
}: {
  result: AnalysisResult;
  photos: PhotoMoment[];
  relationshipStart: Date | null;
  backgroundPhotoUrl: string | null;
  onExit: () => void;
  onReset: () => void;
}) {
  const slides = useMemo(() => buildSlides(photos, relationshipStart), [photos, relationshipStart]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Avanço automático, reiniciado toda vez que o slide muda.
  useEffect(() => {
    const duration = slides[index].duration;
    if (duration === null) return;
    if (index === slides.length - 1) return;

    const timer = setTimeout(goNext, duration);
    return () => clearTimeout(timer);
  }, [index, goNext, slides]);

  // Setas do teclado, pra quem estiver no desktop.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "Escape") onExit();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, onExit]);

  const handleContainerClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    if (ratio < 0.35) goPrev();
    else goNext();
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-6">
      <div
        className="relative h-full w-full overflow-hidden sm:h-[780px] sm:max-h-[90vh] sm:w-[390px] sm:rounded-[36px] sm:shadow-2xl sm:ring-1 sm:ring-paper/10"
        style={
          backgroundPhotoUrl
            ? { backgroundImage: `url(${backgroundPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
        {!backgroundPhotoUrl && <div className="absolute inset-0 bg-ink" />}
        {backgroundPhotoUrl && (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(28,15,22,0.55) 0%, rgba(28,15,22,0.9) 100%)" }}
          />
        )}

        {/* Barra de progresso segmentada, uma tira por slide */}
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1.5">
          {slides.map((slide, i) => (
            <div key={slide.id} className="h-1 flex-1 overflow-hidden rounded-full bg-paper/20">
              {i < index && <div className="h-full w-full bg-paper" />}
              {i === index && slide.duration !== null && (
                <div
                  key={index}
                  className="h-full bg-paper"
                  style={{ animation: `story-progress-fill ${slide.duration}ms linear forwards` }}
                />
              )}
              {i === index && slide.duration === null && <div className="h-full w-full bg-paper" />}
            </div>
          ))}
        </div>

        <AudioController />

        <button
          type="button"
          onClick={onExit}
          aria-label="Fechar"
          className="absolute right-3 top-7 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 font-body text-lg text-paper"
        >
          ×
        </button>

        <div
          className="relative h-full w-full"
          onClick={handleContainerClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            key={index}
            className="relative h-full w-full pt-10"
            style={{ animation: "story-slide-enter 320ms ease-out" }}
          >
            {slides[index].render(result, onReset)}
          </div>
        </div>
      </div>
    </div>
  );
}
