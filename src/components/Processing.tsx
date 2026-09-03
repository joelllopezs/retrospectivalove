"use client";

import { useEffect, useRef, useState } from "react";
import { extractChatBundle, hasAcceptedExtension } from "@/lib/utils/loadChatFile";
import { parseWhatsAppChat } from "@/lib/parser/whatsapp";
import { analyzeConversation } from "@/lib/analytics";
import { buildPhotoMoments, type PhotoMoment } from "@/lib/photos";
import type { AnalysisResult } from "@/types/analysis";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Garante que cada etapa fique visível por pelo menos `ms`, mesmo se o trabalho real for instantâneo. */
async function withMinDelay<T>(work: () => Promise<T> | T, ms: number): Promise<T> {
  const [result] = await Promise.all([Promise.resolve(work()), wait(ms)]);
  return result;
}

function formatCount(n: number): string {
  return n.toLocaleString("pt-BR");
}

interface ProcessingProps {
  file: File;
  onComplete: (result: AnalysisResult, photos: PhotoMoment[]) => void;
  onReset: () => void;
}

type Phase = "running" | "error";

export function Processing({ file, onComplete, onReset }: ProcessingProps) {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Verificando arquivo...");
  const [detail, setDetail] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("running");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function run() {
      try {
        // 1. Verificar extensão
        await withMinDelay(() => {
          if (!hasAcceptedExtension(file.name)) {
            throw new Error("Esse arquivo não é uma conversa exportada do WhatsApp. Envie um .txt ou .zip.");
          }
        }, 300);
        if (cancelledRef.current) return;
        setProgress(10);

        // 2. Ler .txt ou extrair do .zip (texto + fotos, se houver)
        const isZip = file.name.toLowerCase().endsWith(".zip");
        setLabel(isZip ? "Extraindo conversa do .zip..." : "Lendo conversa...");
        const bundle = await withMinDelay(() => extractChatBundle(file), 500);
        if (cancelledRef.current) return;
        setProgress(35);

        // 3. Parser
        setLabel("Interpretando as mensagens...");
        const { conversation, warnings } = await withMinDelay(() => parseWhatsAppChat(bundle.text), 550);
        if (cancelledRef.current) return;

        if (conversation.messages.length === 0) {
          throw new Error(
            "Não conseguimos encontrar mensagens nesse arquivo. Confira se é o .txt exportado do WhatsApp."
          );
        }

        setProgress(65);
        setDetail(`Encontramos ${formatCount(conversation.messages.length)} mensagens...`);
        if (warnings.length > 0) {
          // Não bloqueia o fluxo — só um sinal pra gente investigar depois, se muitas linhas forem ignoradas.
          console.warn(`Parser ignorou ${warnings.length} linha(s):`, warnings.slice(0, 5));
        }

        // 4. Separar as fotos (se o zip trouxe mídia)
        const photos = buildPhotoMoments(conversation, bundle.mediaFiles);
        setProgress(80);
        if (photos.length > 0) {
          setDetail(`Encontramos ${formatCount(conversation.messages.length)} mensagens e ${photos.length} fotos...`);
        }

        // 5. Analytics
        setLabel("Calculando as estatísticas...");
        const result = await withMinDelay(() => analyzeConversation(conversation), 400);
        if (cancelledRef.current) return;
        setProgress(95);

        setLabel("Pronto!");
        await wait(300);
        if (cancelledRef.current) return;
        setProgress(100);
        await wait(250);
        if (cancelledRef.current) return;

        onComplete(result, photos);
      } catch (err) {
        if (cancelledRef.current) return;
        const message = err instanceof Error ? err.message : "Não foi possível processar esse arquivo.";
        setErrorMessage(message);
        setPhase("error");
      }
    }

    run();

    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  if (phase === "error") {
    return (
      <div className="rounded-[28px] border border-rose/70 bg-wine/40 p-8 text-center">
        <p className="font-body text-base text-paper">{errorMessage}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-block rounded-full bg-rose px-6 py-2.5 font-body text-sm font-semibold text-paper transition-colors hover:bg-rose-soft"
        >
          Tentar outro arquivo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-paper/15 bg-wine/40 p-8 text-center">
      <p className="font-display text-xl italic text-paper">❤️ Analisando sua história...</p>

      <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-ink/50">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--rose) 0%, var(--gold) 100%)",
          }}
        />
      </div>

      <p className="mt-3 font-body text-sm text-muted">
        {progress}% — {label}
      </p>

      {detail && <p className="mt-2 font-body text-sm text-gold">{detail}</p>}
    </div>
  );
}
