"use client";

import { useState } from "react";
import { saveRetrospective } from "@/lib/supabase/saveRetrospective";
import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";

type Status = "idle" | "saving" | "success" | "error";

export function ShareLink({
  result,
  photos,
  relationshipStartDateValue,
  backgroundPhotoUrl,
}: {
  result: AnalysisResult;
  photos: PhotoMoment[];
  relationshipStartDateValue: string;
  backgroundPhotoUrl: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const id = await saveRetrospective({ result, photos, relationshipStartDateValue, backgroundPhotoUrl });
      setLink(`${window.location.origin}/r/${id}`);
      setStatus("success");
    } catch (err) {
      console.error("Erro ao gerar link:", err);
      setErrorMessage(err instanceof Error ? err.message : "Não foi possível gerar o link.");
      setStatus("error");
    }
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard pode falhar (permissão, contexto não-seguro); o link já está visível pra copiar na mão.
    }
  }

  if (status === "success" && link) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="font-body text-xs text-muted">Link pronto pra mandar pra pessoa amada:</p>
        <div className="flex items-center gap-2 rounded-full bg-ink/40 py-1.5 pl-4 pr-1.5">
          <span className="max-w-[200px] truncate font-body text-xs text-paper">{link}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-rose px-3 py-1.5 font-body text-xs font-semibold text-paper transition-colors hover:bg-rose-soft"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === "saving"}
        className="rounded-full border border-gold/50 px-5 py-2 font-body text-sm text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
      >
        {status === "saving" ? "Gerando link..." : "🔗 Gerar link pra compartilhar"}
      </button>
      {status === "error" && errorMessage && (
        <p className="max-w-xs text-center font-body text-xs text-rose-soft">{errorMessage}</p>
      )}
    </div>
  );
}
