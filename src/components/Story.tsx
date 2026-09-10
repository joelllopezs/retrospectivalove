"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";

import {
  CoverSlide,
  CounterSlide,
  OverviewSlide,
  TalkerSlide,
  LoveSlide,
  EmojiSlide,
  MomentsSlide,
  HourlySlide,
  PersonalitySlide,
  AwardsSlide,
  LetterSlide,
} from "@/components/story/slides";

import {
  QuizIntroSlide,
  QuizSlide,
} from "@/components/story/QuizSlides";

import { buildQuizQuestions } from "@/lib/quiz";
import { AudioController } from "@/components/story/AudioController";

import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";

interface SlideDef {
  id: string;

  /**
   * Tempo até avançar automaticamente.
   * null = permanece no slide até o usuário interagir.
   */
  duration: number | null;

  render: (
    result: AnalysisResult,
    onReset: () => void
  ) => React.ReactNode;
}

function buildSlides(
  result: AnalysisResult,
  photos: PhotoMoment[],
  relationshipStart: Date | null
): SlideDef[] {
  const slides: SlideDef[] = [
    {
      id: "cover",
      duration: 3500,
      render: (r) => <CoverSlide result={r} />,
    },
  ];

  if (relationshipStart) {
    slides.push({
      id: "counter",
      duration: 6000,
      render: () => (
        <CounterSlide startDate={relationshipStart} />
      ),
    });
  }

  slides.push(
    {
      id: "overview",
      duration: 5000,
      render: (r) => <OverviewSlide result={r} />,
    },

    {
      id: "talker",
      duration: 5000,
      render: (r) => <TalkerSlide result={r} />,
    },

    {
      id: "love",
      duration: 5500,
      render: (r) => <LoveSlide result={r} />,
    },

    {
      id: "emoji",
      duration: 5000,
      render: (r) => <EmojiSlide result={r} />,
    }
  );

  if (photos.length > 0) {
    slides.push({
      id: "moments",
      duration: 5500,
      render: () => <MomentsSlide photos={photos} />,
    });
  }

  slides.push({
    id: "hourly",
    duration: 5000,
    render: (r) => <HourlySlide result={r} />,
  });

  const quizQuestions = buildQuizQuestions(result);

  if (quizQuestions.length > 0) {
    slides.push({
      id: "quiz-intro",
      duration: 2500,
      render: () => <QuizIntroSlide />,
    });

    quizQuestions.forEach((question, i) => {
      slides.push({
        id: `quiz-${question.id}`,

        // Aguarda o usuário responder.
        duration: null,

        render: () => (
          <QuizSlide
            question={question}
            index={i}
            total={quizQuestions.length}
          />
        ),
      });
    });
  }

  slides.push(

{
  id: "personality",
  duration: 6000,
  render: (r) => (
    <PersonalitySlide result={r} />
  ),
},

{
  id: "awards",
  duration: 6500,
  render: (r) => (
    <AwardsSlide result={r} />
  ),
},

{
  id: "letter",
  duration: null,
  render: (r, onReset) => (
    <LetterSlide
      result={r}
      onReset={onReset}
    />
  ),
},
  );

  return slides;
}

const SWIPE_THRESHOLD = 40;

export function Story({
  result,
  photos,
  relationshipStart = null,
  backgroundPhotoUrl = null,
  onExit,
  onReset,
}: {
  result: AnalysisResult;

  photos: PhotoMoment[];

  /**
   * Opcional para não quebrar telas que ainda
   * não enviam uma data de início.
   */
  relationshipStart?: Date | null;

  /**
   * Opcional para permitir Story sem foto de fundo.
   */
  backgroundPhotoUrl?: string | null;

  onExit: () => void;

  onReset: () => void;
}) {
  const slides = useMemo(
    () =>
      buildSlides(
        result,
        photos,
        relationshipStart
      ),
    [
      result,
      photos,
      relationshipStart,
    ]
  );

  const [index, setIndex] = useState(0);

  const touchStartX = useRef<number | null>(
    null
  );

  const touchStartY = useRef<number | null>(
    null
  );

  const goNext = useCallback(() => {
    setIndex((currentIndex) =>
      Math.min(
        currentIndex + 1,
        slides.length - 1
      )
    );
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setIndex((currentIndex) =>
      Math.max(currentIndex - 1, 0)
    );
  }, []);

  /**
   * Avanço automático.
   *
   * O timer é recriado toda vez que o slide muda.
   */
  useEffect(() => {
    const currentSlide = slides[index];

    if (!currentSlide) return;

    const { duration } = currentSlide;

    if (duration === null) return;

    if (index === slides.length - 1) {
      return;
    }

    const timer = window.setTimeout(
      goNext,
      duration
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    index,
    goNext,
    slides,
  ]);

  /**
   * Navegação pelo teclado.
   */
  useEffect(() => {
    function handleKey(
      event: KeyboardEvent
    ) {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }

      if (event.key === "Escape") {
        onExit();
      }
    }

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, [
    goNext,
    goPrev,
    onExit,
  ]);

  /**
   * Verifica se o clique aconteceu em algum elemento
   * que possui interação própria.
   *
   * Isso é especialmente importante para o Quiz,
   * evitando que clicar em uma resposta também
   * avance o Story.
   */
  const isInteractiveElement = (
    target: EventTarget | null
  ) => {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    return Boolean(
      target.closest(
        [
          "button",
          "a",
          "input",
          "textarea",
          "select",
          "label",
          "[role='button']",
          "[data-story-interactive]",
        ].join(",")
      )
    );
  };

  /**
   * Navegação semelhante aos Stories.
   *
   * 35% da esquerda = voltar.
   * restante = avançar.
   */
  const handleContainerClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    if (
      isInteractiveElement(event.target)
    ) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const ratio =
      (event.clientX - rect.left) /
      rect.width;

    if (ratio < 0.35) {
      goPrev();
    } else {
      goNext();
    }
  };

  /**
   * Guarda a posição inicial do toque.
   */
  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>
  ) => {
    const touch = event.touches[0];

    touchStartX.current =
      touch.clientX;

    touchStartY.current =
      touch.clientY;
  };

  /**
   * Detecta swipe horizontal.
   *
   * Também verifica o movimento vertical para
   * evitar trocar de slide durante um scroll.
   */
  const handleTouchEnd = (
    event: TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch =
      event.changedTouches[0];

    const deltaX =
      touch.clientX -
      touchStartX.current;

    const deltaY =
      touch.clientY -
      touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /**
     * Movimento predominantemente vertical.
     * Não interpreta como swipe.
     */
    if (
      Math.abs(deltaY) >
      Math.abs(deltaX)
    ) {
      return;
    }

    if (
      Math.abs(deltaX) <
      SWIPE_THRESHOLD
    ) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const currentSlide =
    slides[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 backdrop-blur-md sm:p-6">

      {/* ================================================= */}
      {/* CONTAINER PRINCIPAL DO STORY                      */}
      {/* ================================================= */}

      <div className="relative h-full w-full overflow-hidden bg-ink sm:h-[780px] sm:max-h-[90vh] sm:w-[390px] sm:rounded-[36px] sm:shadow-2xl sm:ring-1 sm:ring-paper/10">

        {/* ================================================= */}
        {/* FOTO DE FUNDO                                     */}
        {/* ================================================= */}

        {backgroundPhotoUrl && (
          <div
            className="absolute -inset-6 scale-110 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundPhotoUrl})`,
              animation:
                "story-background-drift 16s ease-in-out infinite alternate",
            }}
          />
        )}

        {/* ================================================= */}
        {/* FUNDO PADRÃO                                      */}
        {/* ================================================= */}

        {!backgroundPhotoUrl && (
          <>
            <div className="absolute inset-0 bg-ink" />

            {/* Luz suave superior */}
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,120,165,0.7), transparent 70%)",
              }}
            />

            {/* Luz suave inferior */}
            <div
              className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(186,120,255,0.65), transparent 70%)",
              }}
            />
          </>
        )}

        {/* ================================================= */}
        {/* OVERLAY DA FOTO                                   */}
        {/* ================================================= */}

        {backgroundPhotoUrl && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(28,15,22,0.48) 0%, rgba(28,15,22,0.72) 42%, rgba(28,15,22,0.94) 100%)",
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.08), transparent 50%)",
              }}
            />
          </>
        )}

        {/* ================================================= */}
        {/* BRILHOS DE FUNDO                                  */}
        {/* ================================================= */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="absolute left-[12%] top-[20%] h-1 w-1 rounded-full bg-paper/70"
            style={{
              animation:
                "story-sparkle 4s ease-in-out infinite",
            }}
          />

          <span
            className="absolute right-[17%] top-[34%] h-1.5 w-1.5 rounded-full bg-paper/50"
            style={{
              animation:
                "story-sparkle 5.5s ease-in-out 1s infinite",
            }}
          />

          <span
            className="absolute bottom-[28%] left-[18%] h-1 w-1 rounded-full bg-paper/60"
            style={{
              animation:
                "story-sparkle 6s ease-in-out 2s infinite",
            }}
          />

          <span
            className="absolute bottom-[18%] right-[12%] h-1 w-1 rounded-full bg-paper/40"
            style={{
              animation:
                "story-sparkle 4.8s ease-in-out 0.5s infinite",
            }}
          />
        </div>

        {/* ================================================= */}
        {/* BARRA DE PROGRESSO                                */}
        {/* ================================================= */}

        <div className="absolute inset-x-3 top-3 z-30 flex gap-1.5">
          {slides.map(
            (slide, slideIndex) => (
              <div
                key={slide.id}
                className="h-1 flex-1 overflow-hidden rounded-full bg-paper/20 backdrop-blur-sm"
              >
                {slideIndex < index && (
                  <div className="h-full w-full rounded-full bg-paper" />
                )}

                {slideIndex === index &&
                  slide.duration !==
                    null && (
                    <div
                      key={`${index}-${slide.id}`}
                      className="h-full rounded-full bg-paper"
                      style={{
                        animation: `story-progress-fill ${slide.duration}ms linear forwards`,
                      }}
                    />
                  )}

                {slideIndex === index &&
                  slide.duration ===
                    null && (
                    <div className="h-full w-full rounded-full bg-paper" />
                  )}
              </div>
            )
          )}
        </div>

        {/* ================================================= */}
        {/* ÁUDIO                                             */}
        {/* ================================================= */}

        <div
          className="relative z-30"
          data-story-interactive
        >
          <AudioController />
        </div>

        {/* ================================================= */}
        {/* FECHAR                                            */}
        {/* ================================================= */}

        <button
          type="button"
          onClick={onExit}
          aria-label="Fechar retrospectiva"
          data-story-interactive
          className="absolute right-3 top-7 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 font-body text-lg text-paper backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-black/50 active:scale-95"
        >
          ×
        </button>

        {/* ================================================= */}
        {/* CONTEÚDO                                          */}
        {/* ================================================= */}

        <div
          className="relative z-10 h-full w-full"
          onClick={
            handleContainerClick
          }
          onTouchStart={
            handleTouchStart
          }
          onTouchEnd={
            handleTouchEnd
          }
        >
          <div
            key={currentSlide.id}
            className="relative h-full w-full pt-10"
            style={{
              animation:
                "story-slide-enter 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
              willChange:
                "transform, opacity, filter",
            }}
          >
            {currentSlide.render(
              result,
              onReset
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* VINHETA                                           */}
        {/* ================================================= */}

        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            boxShadow:
              "inset 0 -80px 100px rgba(0,0,0,0.16), inset 0 50px 80px rgba(0,0,0,0.12)",
          }}
        />

        {/* ================================================= */}
        {/* ANIMAÇÕES LOCAIS                                  */}
        {/* ================================================= */}

        <style jsx global>{`
          @keyframes story-slide-enter {
            0% {
              opacity: 0;
              transform: translateY(22px)
                scale(0.97);
              filter: blur(6px);
            }

            55% {
              opacity: 1;
            }

            100% {
              opacity: 1;
              transform: translateY(0)
                scale(1);
              filter: blur(0);
            }
          }

          @keyframes story-background-drift {
            0% {
              transform: scale(1.08)
                translate3d(-1%, -1%, 0);
            }

            100% {
              transform: scale(1.15)
                translate3d(1.5%, 1%, 0);
            }
          }

          @keyframes story-sparkle {
            0%,
            100% {
              opacity: 0.2;
              transform: scale(0.7);
            }

            45% {
              opacity: 0.9;
              transform: scale(1.5);
            }

            70% {
              opacity: 0.45;
              transform: scale(1);
            }
          }

          @media (
            prefers-reduced-motion:
              reduce
          ) {
            [style*="story-slide-enter"],
            [style*="story-background-drift"],
            [style*="story-sparkle"] {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}