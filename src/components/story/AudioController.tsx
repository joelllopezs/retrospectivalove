"use client";

import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";

interface Track {
  title: string;
  src: string;
}

/**
 * Música de fundo do Story. Duas fontes possíveis, nenhuma delas com direito
 * autoral embutido no projeto (ver public/audio/README.md):
 *  1. Uma playlist local que você mesmo monta em public/audio/playlist.json
 *     + public/audio/playlist/*.mp3 (músicas royalty-free/CC que você escolher).
 *  2. A pessoa que estiver usando o app pode enviar a própria música na hora,
 *     direto do aparelho dela — fica só na memória da sessão, nunca é enviada.
 * Sem nenhuma das duas, o botão mostra "Nenhuma música ainda" e não quebra nada.
 */
export function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [customTrack, setCustomTrack] = useState<Track | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetch("/audio/playlist.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPlaylist(Array.isArray(data) ? data : []))
      .catch(() => setPlaylist([]));
  }, []);

  // Libera o object URL da faixa enviada pelo usuário ao desmontar.
  useEffect(() => {
    return () => {
      if (customTrack) URL.revokeObjectURL(customTrack.src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTrack = customTrack ?? playlist[trackIndex] ?? null;

  // Troca de faixa: recarrega o <audio> e retoma o play se já estava tocando.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    audio.load();
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack?.src]);

  function stop(event: MouseEvent) {
    event.stopPropagation();
  }

  const togglePanel = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    setIsPanelOpen((open) => !open);
  };

  const togglePlay = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const nextTrack = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    if (customTrack || playlist.length <= 1) return;
    setTrackIndex((i) => (i + 1) % playlist.length);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;
    if (customTrack) URL.revokeObjectURL(customTrack.src);
    setCustomTrack({ title: file.name.replace(/\.[^.]+$/, ""), src: URL.createObjectURL(file) });
    setIsPlaying(false);
  };

  const clearCustomTrack = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    if (customTrack) URL.revokeObjectURL(customTrack.src);
    setCustomTrack(null);
    setIsPlaying(false);
    setTrackIndex(0);
  };

  return (
    <div className="absolute left-3 top-7 z-10" onClick={stop}>
      <audio ref={audioRef} src={activeTrack?.src} onEnded={() => setIsPlaying(false)} />

      <button
        type="button"
        onClick={togglePanel}
        aria-label="Música"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-base text-paper"
      >
        {isPlaying ? "🔊" : "🎵"}
      </button>

      {isPanelOpen && (
        <div className="mt-2 w-52 rounded-2xl bg-ink/95 p-3 shadow-xl ring-1 ring-paper/10">
          <p className="truncate font-body text-xs text-paper">
            {activeTrack ? activeTrack.title : "Nenhuma música ainda"}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!activeTrack}
              className="rounded-full bg-rose px-3 py-1 font-body text-xs text-paper disabled:opacity-40"
            >
              {isPlaying ? "Pausar" : "Tocar"}
            </button>

            {!customTrack && playlist.length > 1 && (
              <button
                type="button"
                onClick={nextTrack}
                className="rounded-full border border-paper/30 px-3 py-1 font-body text-xs text-paper"
              >
                Próxima
              </button>
            )}
          </div>

          <label className="mt-3 block cursor-pointer text-center font-body text-xs text-gold underline decoration-gold/40 underline-offset-4">
            📤 Enviar sua música
            <input type="file" accept="audio/*" className="sr-only" onChange={handleUpload} />
          </label>

          {customTrack && (
            <button
              type="button"
              onClick={clearCustomTrack}
              className="mt-1 w-full text-center font-body text-[11px] text-muted underline decoration-muted/40 underline-offset-4"
            >
              Voltar pra playlist padrão
            </button>
          )}
        </div>
      )}
    </div>
  );
}
