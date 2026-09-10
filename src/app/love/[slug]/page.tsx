"use client";

import { useEffect, useState } from "react";
import { use } from "react";

import { getStory } from "@/lib/storage/storyStorage";

import { Statistics } from "@/components/Statistics";
import { Story } from "@/components/Story";

import type { StoryData } from "@/types/story";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function LoveStoryPage({
  params,
}: PageProps) {
  const { slug } = use(params);

  const [story, setStory] =
    useState<StoryData | null>(null);

  const [isStoryOpen, setIsStoryOpen] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const savedStory = getStory(slug);

    setStory(savedStory);

    setLoaded(true);
  }, [slug]);


  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-body text-paper">
          Carregando nossa história ❤️
        </p>
      </main>
    );
  }


  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-body text-paper">
          História não encontrada ❤️
        </p>
      </main>
    );
  }


  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-16">

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--rose) 0%, transparent 70%)",
        }}
      />


      {!isStoryOpen ? (

        <Statistics
          result={story.result}
          photos={story.photos.map((photo) => ({
            ...photo,
            date: new Date(photo.date),
          }))}
          story={story}
          onReset={() => {}}
          showShare={false}
          onOpenStory={() =>
            setIsStoryOpen(true)
          }
        />

      ) : (

        <Story
          result={story.result}
          photos={story.photos.map((photo) => ({
            ...photo,
            date: new Date(photo.date),
          }))}

          relationshipStart={
            story.relationship?.startDate
              ? new Date(
                  story.relationship.startDate
                )
              : null
          }

          onExit={() =>
            setIsStoryOpen(false)
          }

          onReset={() => {}}
        />

      )}

    </main>
  );
}