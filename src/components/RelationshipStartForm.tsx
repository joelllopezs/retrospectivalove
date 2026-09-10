"use client";

import { useState } from "react";

interface RelationshipData {
  type: "dating" | "marriage";
  date: Date;
}

export function RelationshipStartForm({
  onComplete,
}: {
  onComplete: (data: RelationshipData) => void;
}) {
  const [type, setType] = useState<"dating" | "marriage">("dating");

  const [date, setDate] = useState("");

  function handleSubmit() {
    if (!date) return;

    const parsedDate = new Date(date + "T00:00:00");

    onComplete({
      type,
      date: parsedDate,
    });
  }

  return (
    <div className="space-y-6 text-center">

      <div>
        <h2 className="font-display text-3xl text-paper">
          ❤️ Quando começou a história de vocês?
        </h2>

        <p className="mt-2 text-sm text-muted">
          Essa data será usada no contador da retrospectiva.
        </p>
      </div>


      <div className="flex justify-center gap-3">

        <button
          type="button"
          onClick={() => setType("dating")}
          className={
            type === "dating"
              ? "rounded-full bg-rose px-5 py-2 text-paper"
              : "rounded-full border border-paper/20 px-5 py-2 text-paper"
          }
        >
          💕 Namoro
        </button>


        <button
          type="button"
          onClick={() => setType("marriage")}
          className={
            type === "marriage"
              ? "rounded-full bg-gold px-5 py-2 text-black"
              : "rounded-full border border-paper/20 px-5 py-2 text-paper"
          }
        >
          💍 Casamento
        </button>

      </div>


      <input
        type="date"
        value={date}
        onChange={(e)=>setDate(e.target.value)}
        className="
          w-full rounded-2xl
          bg-black/20
          px-5 py-3
          text-center
          text-paper
          outline-none
        "
      />


      <button
        onClick={handleSubmit}
        disabled={!date}
        className="
          rounded-full
          bg-rose
          px-8 py-3
          font-semibold
          text-paper
          disabled:opacity-40
        "
      >
        Continuar ❤️
      </button>

    </div>
  );
}