import type { StoryData } from "@/types/story";

const STORAGE_KEY = "love-wrapped-stories";

/**
 * Recupera todas as histórias salvas no navegador.
 */
function getStories(): StoryData[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoryData[];
  } catch {
    return [];
  }
}

/**
 * Salva uma história.
 *
 * Por enquanto usa localStorage.
 * Depois podemos trocar internamente por Neon
 * sem alterar quem chama essa função.
 */
export function saveStory(
  story: StoryData
): void {
  if (typeof window === "undefined") {
    return;
  }

  const stories = getStories();

  const existingIndex = stories.findIndex(
    (item) => item.slug === story.slug
  );

  if (existingIndex >= 0) {
    stories[existingIndex] = story;
  } else {
    stories.push(story);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(stories)
  );
}

/**
 * Busca uma história pelo slug.
 *
 * Ex:
 * getStory("joao-ana-x82k")
 */
export function getStory(
  slug: string
): StoryData | null {
  const stories = getStories();

  return (
    stories.find(
      (story) => story.slug === slug
    ) ?? null
  );
}

/**
 * Remove uma história.
 */
export function deleteStory(
  slug: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  const stories = getStories();

  const filtered = stories.filter(
    (story) => story.slug !== slug
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(filtered)
  );
}

/**
 * Gera a URL pública da história.
 *
 * Futuramente será o link enviado
 * para a pessoa presenteada.
 */
export function getStoryUrl(
  story: StoryData
): string {
  if (typeof window === "undefined") {
    return `/love/${story.slug}`;
  }

  return `${window.location.origin}/love/${story.slug}`;
}