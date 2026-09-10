import type { AnalysisResult } from "@/types/analysis";
import type { StoryData, StoryPhoto } from "@/types/story";
import type { PhotoMoment } from "@/lib/photos";

interface RelationshipData {
  type: "dating" | "marriage";
  date: Date;
}

function createSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomId(): string {
  return Math.random()
    .toString(36)
    .substring(2, 10);
}

/**
 * Converte fotos temporárias da sessão
 * para o formato de história.
 *
 * Observação:
 * Por enquanto mantém o object URL.
 * Depois substituímos por upload/storage.
 */
function mapPhotos(
  photos: PhotoMoment[]
): StoryPhoto[] {
  return photos.map((photo, index) => ({
    id: `${index}-${photo.date.getTime()}`,
    url: photo.url,
    author: photo.author,
    date: photo.date.toISOString(),
  }));
}

export function createStory(
  result: AnalysisResult,
  photos: PhotoMoment[],
  relationship?: RelationshipData | null
): StoryData {
  const participants = result.participants;

  const coupleName =
    participants.length >= 2
      ? `${participants[0]} & ${participants[1]}`
      : participants.join(" & ") || "Nossa História";

  const slugBase = createSlug(coupleName);

  return {
    id: randomId(),

    slug: `${slugBase}-${randomId()}`,

    title: `A história de ${coupleName}`,

    createdAt: new Date().toISOString(),

    relationship: {
      type: relationship?.type ?? "dating",
      startDate:
        relationship?.date.toISOString() ?? null,
    },

    participants,

    result,

    photos: mapPhotos(photos),

    letter: undefined,
  };
}