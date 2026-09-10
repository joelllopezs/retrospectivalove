"use client";

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";

type Status = "idle" | "dragging" | "error" | "selected";

const ACCEPTED_EXTENSIONS = [".txt", ".zip"];

function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface UploadConversationProps {
  /** Chamado quando um arquivo válido é selecionado. A extração/parse fica pra próxima fase. */
  onFileAccepted?: (file: File) => void;
}

export function UploadConversation({ onFileAccepted }: UploadConversationProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;

      if (!hasAcceptedExtension(candidate.name)) {
        setErrorMessage("Esse arquivo não é uma conversa exportada do WhatsApp. Envie um .txt ou .zip.");
        setStatus("error");
        setFile(null);
        return;
      }

      setErrorMessage(null);
      setFile(candidate);
      setStatus("selected");
      onFileAccepted?.(candidate);
    },
    [onFileAccepted]
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    acceptFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (status !== "selected") setStatus("dragging");
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (status === "dragging") setStatus("idle");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
  };

  const handleReset = () => {
    setFile(null);
    setErrorMessage(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isDragging = status === "dragging";
  const hasError = status === "error";
  const hasFile = status === "selected" && file;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-[28px] border p-8 text-center transition-colors duration-200 ${
        isDragging
          ? "border-gold bg-wine-soft/60"
          : hasError
            ? "border-rose/70 bg-wine/40"
            : "border-paper/15 bg-wine/40"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.zip"
        onChange={handleInputChange}
        className="sr-only"
        id="conversation-file"
      />

      {!hasFile && (
        <>
          <svg
            viewBox="0 0 48 36"
            className={`mx-auto mb-5 h-10 w-14 transition-transform duration-200 ${isDragging ? "scale-105" : ""}`}
            aria-hidden="true"
          >
            <path
              d="M3 6 L24 21 L45 6"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="2"
              y="3"
              width="44"
              height="30"
              rx="4"
              fill="none"
              stroke="var(--paper)"
              strokeOpacity="0.35"
              strokeWidth="2"
            />
          </svg>

          <p className="font-body text-base text-paper">
            Arraste aqui a conversa exportada do WhatsApp
          </p>
          <p className="mt-1 font-body text-sm text-muted">ou</p>

          <label
            htmlFor="conversation-file"
            className="mt-4 inline-block cursor-pointer rounded-full bg-rose px-6 py-2.5 font-body text-sm font-semibold text-paper transition-colors hover:bg-rose-soft"
          >
            Escolher arquivo
          </label>

          {hasError && (
            <p role="alert" className="mt-4 font-body text-sm text-rose-soft">
              {errorMessage}
            </p>
          )}
        </>
      )}

      {hasFile && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-ink/40 px-4 py-3">
            <p className="font-body text-sm font-semibold text-paper">{file.name}</p>
            <p className="font-body text-xs text-muted">{formatFileSize(file.size)}</p>
          </div>
          <p className="font-body text-sm text-muted">
            Arquivo pronto. O processamento entra na próxima fase.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="font-body text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:text-paper"
          >
            Trocar arquivo
          </button>
        </div>
      )}
    </div>
  );
}
