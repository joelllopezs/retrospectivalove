"use client";

import { useEffect, useState } from "react";

import { UploadConversation } from "@/components/UploadConversation";
import { RelationshipStartForm } from "@/components/RelationshipStartForm";
import { Processing } from "@/components/Processing";
import { Statistics } from "@/components/Statistics";
import { Story } from "@/components/Story";
import { WaxSeal } from "@/components/WaxSeal";

import {
  revokePhotoMoments,
  type PhotoMoment,
} from "@/lib/photos";

import type { AnalysisResult } from "@/types/analysis";

type Stage =
  | "upload"
  | "relationship"
  | "processing"
  | "done";

type RelationshipData = {
  type: "dating" | "marriage";
  date: Date;
};

export default function Home() {
  const [stage, setStage] =
    useState<Stage>("upload");

  const [file, setFile] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [photos, setPhotos] =
    useState<PhotoMoment[]>([]);

  const [isStoryOpen, setIsStoryOpen] =
    useState(false);

  /**
   * Informações do relacionamento.
   *
   * Por enquanto usamos a data no contador.
   * Depois também poderemos usar o tipo
   * (namoro/casamento) na retrospectiva.
   */
  const [
    relationshipData,
    setRelationshipData,
  ] = useState<RelationshipData | null>(
    null
  );

  /**
   * Libera a memória dos object URLs
   * das fotos se o usuário fechar a página.
   */
  useEffect(() => {
    return () => {
      revokePhotoMoments(photos);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Arquivo ZIP/TXT selecionado.
   *
   * Antes de processar a conversa,
   * mostramos a tela perguntando
   * quando começou o relacionamento.
   */
  const handleFileAccepted = (
    selected: File
  ) => {
    setFile(selected);

    setStage("relationship");
  };

  /**
   * Usuário informou namoro/casamento
   * e a data de início.
   */
  const handleRelationshipComplete = (
    data: RelationshipData
  ) => {
    setRelationshipData(data);

    setStage("processing");
  };

  /**
   * Análise da conversa concluída.
   */
  const handleComplete = (
    analysis: AnalysisResult,
    newPhotos: PhotoMoment[]
  ) => {
    setResult(analysis);

    setPhotos(newPhotos);

    setStage("done");
  };

  /**
   * Volta tudo ao início.
   *
   * Também apaga a data do relacionamento
   * para evitar misturar uma nova conversa
   * com os dados anteriores.
   */
  const handleReset = () => {
    revokePhotoMoments(photos);

    setStage("upload");

    setFile(null);

    setResult(null);

    setPhotos([]);

    setRelationshipData(null);

    setIsStoryOpen(false);
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">

      {/* ================================================= */}
      {/* LUZ DE FUNDO                                     */}
      {/* ================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--rose) 0%, transparent 70%)",
        }}
      />

      {/* ================================================= */}
      {/* RESULTADO                                        */}
      {/* ================================================= */}

      {stage === "done" && result ? (
        <div className="relative">
          <Statistics
            result={result}
            photos={photos}
            onReset={handleReset}
            onOpenStory={() =>
              setIsStoryOpen(true)
            }
          />
        </div>
      ) : (
        /* ================================================= */
        /* FLUXO INICIAL                                     */
        /* ================================================= */

        <div className="relative w-full max-w-md">

          {/* Logo / selo */}
          <WaxSeal className="mx-auto mb-6 h-14 w-14" />

          <h1 className="text-center font-display text-5xl italic tracking-tight text-paper">
            Love Wrapped
          </h1>

          <p className="mx-auto mt-4 max-w-xs text-center font-body text-base leading-relaxed text-muted">
            A conversa de vocês,
            transformada em uma
            retrospectiva da história
            que construíram juntos.
          </p>

          {/* ================================================= */}
          {/* CARD                                              */}
          {/* ================================================= */}

          <div className="mt-10 -rotate-1 rounded-[32px] bg-wine p-2 shadow-2xl shadow-black/40">

            <div className="rotate-1">

              {/* ============================================= */}
              {/* UPLOAD                                        */}
              {/* ============================================= */}

              {stage === "upload" && (
                <UploadConversation
                  onFileAccepted={
                    handleFileAccepted
                  }
                />
              )}

              {/* ============================================= */}
              {/* DATA DO RELACIONAMENTO                        */}
              {/* ============================================= */}

              {stage ===
                "relationship" &&
                file && (
                  <div className="rounded-[26px] bg-ink/40 p-6 backdrop-blur-sm">

                    <RelationshipStartForm
                      onComplete={
                        handleRelationshipComplete
                      }
                    />

                    {/* Permite escolher outro arquivo */}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);

                        setRelationshipData(
                          null
                        );

                        setStage(
                          "upload"
                        );
                      }}
                      className="mt-5 w-full text-center font-body text-xs text-muted transition-colors hover:text-paper"
                    >
                      ← Escolher outro
                      arquivo
                    </button>
                  </div>
                )}

              {/* ============================================= */}
              {/* PROCESSAMENTO                                 */}
              {/* ============================================= */}

              {stage ===
                "processing" &&
                file && (
                  <Processing
                    file={file}
                    onComplete={
                      handleComplete
                    }
                    onReset={
                      handleReset
                    }
                  />
                )}
            </div>
          </div>

          {/* ================================================= */}
          {/* TEXTO INFERIOR                                   */}
          {/* ================================================= */}

          {stage === "upload" && (
            <p className="mx-auto mt-6 max-w-sm text-center font-body text-sm text-muted">
              Exporte a conversa no
              WhatsApp e envie o .txt
              ou .zip aqui. Tudo é
              processado no seu
              navegador — nada é
              enviado para nenhum
              servidor.
            </p>
          )}

          {stage ===
            "relationship" && (
              <p className="mx-auto mt-6 max-w-sm text-center font-body text-sm text-muted">
                ❤️ Essa data será
                usada para mostrar há
                quanto tempo vocês
                estão juntos.
              </p>
            )}

          {stage ===
            "processing" &&
            relationshipData && (
              <p className="mx-auto mt-6 max-w-sm text-center font-body text-sm text-muted">
                {relationshipData.type ===
                "dating"
                  ? "💕 Preparando a retrospectiva do namoro..."
                  : "💍 Preparando a retrospectiva do casamento..."}
              </p>
            )}
        </div>
      )}

      {/* ================================================= */}
      {/* STORY                                            */}
      {/* ================================================= */}

      {isStoryOpen &&
        result && (
          <Story
            result={result}
            photos={photos}

            /**
             * Aqui está a parte importante:
             *
             * enviamos a data escolhida
             * para o CounterSlide através
             * do Story.
             */
            relationshipStart={
              relationshipData?.date ??
              null
            }

            onExit={() =>
              setIsStoryOpen(false)
            }

            onReset={handleReset}
          />
        )}
    </main>
  );
}