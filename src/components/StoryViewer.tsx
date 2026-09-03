"use client";

import { useRouter } from "next/navigation";
import { Story } from "@/components/Story";
import type { PhotoMoment } from "@/lib/photos";
import type { RetrospectiveRow } from "@/types/retrospective";

export function StoryViewer({ record }: { record: RetrospectiveRow }) {
  const router = useRouter();

  const photos: PhotoMoment[] = record.photos.map((photo) => ({
    url: photo.url,
    author: photo.author,
    date: new Date(photo.date),
  }));

  const relationshipStart = record.relationship_start
    ? new Date(`${record.relationship_start}T00:00:00`)
    : null;

  return (
    <Story
      result={record.analysis}
      photos={photos}
      relationshipStart={relationshipStart}
      backgroundPhotoUrl={record.background_photo_url}
      onExit={() => router.push("/")}
      onReset={() => router.push("/")}
    />
  );
}
