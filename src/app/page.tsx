"use client";

import { useEffect, useState } from "react";
import { UploadConversation } from "@/components/UploadConversation";
import { Processing } from "@/components/Processing";
import { Statistics } from "@/components/Statistics";
import { Story } from "@/components/Story";
import { WaxSeal } from "@/components/WaxSeal";
import { revokePhotoMoments, type PhotoMoment } from "@/lib/photos";
import type { AnalysisResult } from "@/types/analysis";

type Stage = "upload" | "processing" | "done";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [photos, setPhotos] = useState<PhotoMoment[]>([]);
  const [relationshipStartDateValue, setRelationshipStartDateValue] = useState("");
  const [backgroundPhotoUrl, setBackgroundPhotoUrl] = useState<string | null>(null);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Libera a memória dos object URLs (fotos + fundo) se a pessoa fechar a aba/página.
  useEffect(() => {
    return () => {
      revokePhotoMoments(photos);
      if (backgroundPhotoUrl) URL.revokeObjectURL(backgroundPhotoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileAccepted = (selected: File) => {
    setFile(selected);
    setStage("processing");
  };

  const handleComplete = (analysis: AnalysisResult, newPhotos: PhotoMoment[]) => {
    setResult(analysis);
    setPhotos(newPhotos);
    setStage("done");
  };

  const handleBackgroundChange = (url: string | null) => {
    setBackgroundPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const handleReset = () => {
    revokePhotoMoments(photos);
    if (backgroundPhotoUrl) URL.revokeObjectURL(backgroundPhotoUrl);
    setStage("upload");
    setFile(null);
    setResult(null);
    setPhotos([]);
    setRelationshipStartDateValue("");
    setBackgroundPhotoUrl(null);
    setIsStoryOpen(false);
  };

  const relationshipStartDate = relationshipStartDateValue
    ? new Date(`${relationshipStartDateValue}T00:00:00`)
    : null;

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--rose) 0%, transparent 70%)" }}
      />

      {stage === "done" && result ? (
        <div className="relative">
          <Statistics
            result={result}
            photos={photos}
            relationshipStartDateValue={relationshipStartDateValue}
            onRelationshipStartDateChange={setRelationshipStartDateValue}
            backgroundPhotoUrl={backgroundPhotoUrl}
            onBackgroundPhotoChange={handleBackgroundChange}
            onReset={handleReset}
            onOpenStory={() => setIsStoryOpen(true)}
          />
        </div>
      ) : (
        <div className="relative w-full max-w-md">
          <WaxSeal className="mx-auto mb-6 h-14 w-14" />

          <h1 className="text-center font-display text-5xl italic tracking-tight text-paper">
            Love Wrapped
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-center font-body text-base leading-relaxed text-muted">
            A conversa de vocês, transformada numa carta com todos os números da sua história.
          </p>

          <div className="mt-10 -rotate-1 rounded-[32px] bg-wine p-2 shadow-2xl shadow-black/40">
            <div className="rotate-1">
              {stage === "upload" && <UploadConversation onFileAccepted={handleFileAccepted} />}

              {stage === "processing" && file && (
                <Processing file={file} onComplete={handleComplete} onReset={handleReset} />
              )}
            </div>
          </div>

          {stage === "upload" && (
            <p className="mx-auto mt-6 max-w-sm text-center font-body text-sm text-muted">
              Exporte a conversa no WhatsApp e envie o .txt ou .zip aqui. Tudo é processado no
              seu navegador — nada é enviado para nenhum servidor.
            </p>
          )}
        </div>
      )}

      {isStoryOpen && result && (
        <Story
          result={result}
          photos={photos}
          relationshipStart={relationshipStartDate}
          backgroundPhotoUrl={backgroundPhotoUrl}
          onExit={() => setIsStoryOpen(false)}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
