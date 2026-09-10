"use client";

import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import { startAmbientSound, stopAmbientSound } from "@/lib/audio/ambientSound";

interface Track {
  title: string;
  src: string;
}

type SourceKind = "ambient" | "playlist" | "custom";

/**
 * Música de fundo do Story. Três fontes possíveis:
 *  1. "Ambiente" — som gerado por código (ver lib/audio/ambientSound.ts), toca
 *     por padrão sem precisar de nenhum arquivo. Sem questão de direito autoral.
 *  2. Playlist local — o que você mesmo montar em public/audio/playlist.json
 *     + public/audio/playlist/*.mp3 (royalty-free/CC que você escolher).
 *  3. Upload na hora — a pessoa vendo a retrospectiva pode enviar uma música
 *     do próprio aparelho; fica só na memória da sessão dela.
 */
export function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [customTrack, setCustomTrack] = useState<Track | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [sourceKind, setSourceKind] = useState<SourceKind>("ambient");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetch("/audio/playlist.json")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPlaylist(Array.isArray(data) ? data : []))
      .catch(() => setPlaylist([]));
  }, []);

  // Libera o object URL da faixa enviada pelo usuário, e desliga o ambiente, ao desmontar.
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (customTrack) URL.revokeObjectURL(customTrack.src);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTrack: Track | null =
    sourceKind === "custom" ? customTrack : sourceKind === "playlist" ? (playlist[trackIndex] ?? null) : null;

  // Único lugar que efetivamente toca/pausa — reage a qualquer troca de fonte/faixa.
  useEffect(() => {
    if (!isPlaying) {
      stopAmbientSound();
      audioRef.current?.pause();
      return;
    }

    if (sourceKind === "ambient") {
      audioRef.current?.pause();
      startAmbientSound();
    } else {
      stopAmbientSound();
      const audio = audioRef.current;
      if (audio && activeTrack) {
        audio.load();
        audio.play().catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    }
  }, [isPlaying, sourceKind, activeTrack]);

  function stop(event: MouseEvent) {
    event.stopPropagation();
  }

  const togglePanel = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    setIsPanelOpen((open) => !open);
  };

  const togglePlay = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    setIsPlaying((playing) => !playing);
  };

  const selectAmbient = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    setSourceKind("ambient");
  };

  const selectPlaylistTrack = (event: MouseEvent<HTMLButtonElement>, i: number) => {
    stop(event);
    setSourceKind("playlist");
    setTrackIndex(i);
  };

  const selectCustom = (event: MouseEvent<HTMLButtonElement>) => {
    stop(event);
    if (customTrack) setSourceKind("custom");
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;
    if (customTrack) URL.revokeObjectURL(customTrack.src);
    setCustomTrack({ title: file.name.replace(/\.[^.]+$/, ""), src: URL.createObjectURL(file) });
    setSourceKind("custom");
  };

  const sourceLabel =
    sourceKind === "ambient" ? "🎼 Som ambiente" : activeTrack ? activeTrack.title : "Nenhuma música ainda";

  function pillClass(active: boolean) {
    return `rounded-full border px-3 py-1.5 font-body text-[11px] transition-colors ${
      active ? "border-gold bg-gold/15 text-paper" : "border-paper/20 text-muted"
    }`;
  }

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
        <div className="mt-2 w-56 rounded-2xl bg-ink/95 p-3 shadow-xl ring-1 ring-paper/10">
          <p className="truncate font-body text-xs text-paper">{sourceLabel}</p>

          <button
            type="button"
            onClick={togglePlay}
            className="mt-2 rounded-full bg-rose px-3 py-1 font-body text-xs text-paper"
          >
            {isPlaying ? "Pausar" : "Tocar"}
          </button>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button type="button" onClick={selectAmbient} className={pillClass(sourceKind === "ambient")}>
              🎼 Ambiente
            </button>
            {playlist.map((track, i) => (
              <button
                key={track.src}
                type="button"
                onClick={(event) => selectPlaylistTrack(event, i)}
                className={pillClass(sourceKind === "playlist" && trackIndex === i)}
              >
                {track.title}
              </button>
            ))}
            {customTrack && (
              <button type="button" onClick={selectCustom} className={pillClass(sourceKind === "custom")}>
                {customTrack.title}
              </button>
            )}
          </div>

          <label className="mt-3 block cursor-pointer text-center font-body text-xs text-gold underline decoration-gold/40 underline-offset-4">
            📤 Enviar sua música
            <input type="file" accept="audio/*" className="sr-only" onChange={handleUpload} />
          </label>
        </div>
      )}
    </div>
  );
}
