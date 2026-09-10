"use client";

import { useState, type MouseEvent } from "react";
import type { QuizQuestion } from "@/lib/quiz";

function SlideRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-8 text-center">
      {children}
    </div>
  );
}

export function QuizIntroSlide() {
  return (
    <SlideRoot>
      <p className="font-display text-4xl italic text-paper">🎯 Quiz</p>
      <p className="font-body text-base text-muted">Será que vocês prestam atenção um no outro?</p>
      <p className="font-body text-sm text-muted">Toque pra responder</p>
    </SlideRoot>
  );
}

export function QuizSlide({ question, index, total }: { question: QuizQuestion; index: number; total: number }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (event: MouseEvent<HTMLButtonElement>, optionId: string) => {
    event.stopPropagation();
    if (selectedId === null) setSelectedId(optionId);
  };

  const isCorrect = selectedId === question.correctOptionId;

  return (
    <SlideRoot>
      <p className="font-body text-xs text-muted">
        Pergunta {index + 1} de {total}
      </p>
      <p className="font-body text-lg text-paper">{question.prompt}</p>

      <div className="grid w-full max-w-xs grid-cols-2 gap-3">
        {question.options.map((option) => {
          const showResult = selectedId !== null;
          const isThisCorrect = option.id === question.correctOptionId;
          const isThisSelected = option.id === selectedId;

          let stateClasses = "border-paper/20 bg-wine/50 text-paper";
          if (showResult && isThisCorrect) stateClasses = "border-gold bg-gold/15 text-paper";
          else if (showResult && isThisSelected) stateClasses = "border-rose bg-rose/15 text-paper";
          else if (showResult) stateClasses = "border-paper/10 bg-wine/30 text-muted";

          return (
            <button
              key={option.id}
              type="button"
              onClick={(event) => handleSelect(event, option.id)}
              className={`rounded-xl border px-3 py-3 font-body text-sm transition-colors ${stateClasses}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedId !== null && (
        <p className="font-body text-sm text-muted">
          {isCorrect ? "Acertaram! 🎉 " : "Quase! "}
          {question.explanation}
        </p>
      )}
    </SlideRoot>
  );
}
