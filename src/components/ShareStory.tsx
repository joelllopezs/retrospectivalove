"use client";

import { useState } from "react";

import type { StoryData } from "@/types/story";
import { getStoryUrl } from "@/lib/storage/storyStorage";

interface ShareStoryProps {
  story: StoryData;
}

export function ShareStory({
  story,
}: ShareStoryProps) {
  const [copied, setCopied] =
    useState(false);

  const url = getStoryUrl(story);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch {
      console.error(
        "Não foi possível copiar o link."
      );
    }
  }

  async function handleShare() {
    if (
      typeof navigator !== "undefined" &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: story.title,
          text:
            "Preparei uma retrospectiva da nossa história ❤️",
          url,
        });

        return;
      } catch {
        // Usuário cancelou o compartilhamento
      }
    }

    handleCopy();
  }

  return (
    <div className="mt-6 rounded-[28px] border border-paper/15 bg-wine/40 p-6 text-center backdrop-blur-sm">

      <p className="font-display text-xl italic text-paper">
        ❤️ Sua história está pronta
      </p>

      <p className="mt-2 font-body text-sm text-muted">
        Compartilhe esse momento especial.
      </p>

      <div className="mt-5 flex flex-col gap-3">

        <button
          type="button"
          onClick={handleShare}
          className="rounded-full bg-rose px-6 py-3 font-body text-sm font-semibold text-paper transition hover:bg-rose-soft"
        >
          Compartilhar história
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-paper/20 px-6 py-3 font-body text-sm text-paper transition hover:bg-paper/10"
        >
          {copied
            ? "✓ Link copiado"
            : "Copiar link"}
        </button>

      </div>

      <p className="mt-4 break-all font-body text-xs text-muted">
        {url}
      </p>

    </div>
  );
}