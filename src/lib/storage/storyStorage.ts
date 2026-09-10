import type { StoryData } from "@/types/story";

/**
 * Salva uma história através da API do servidor.
 *
 * O token do Vercel Blob nunca vai para o navegador.
 */
export async function saveStory(
  story: StoryData
): Promise<void> {
  const response = await fetch("/api/story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(story),
  });

  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => null);

    throw new Error(
      data?.error ??
        "Não foi possível salvar a história."
    );
  }
}

/**
 * Busca uma história pelo slug.
 */
export async function getStory(
  slug: string
): Promise<StoryData | null> {
  try {
    const response = await fetch(
      `/api/story/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar a história."
      );
    }

    return (await response.json()) as StoryData;
  } catch (error) {
    console.error(
      "Erro ao carregar história:",
      error
    );

    return null;
  }
}

/**
 * Remove uma história.
 */
export async function deleteStory(
  slug: string
): Promise<void> {
  const response = await fetch(
    `/api/story/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível remover a história."
    );
  }
}

/**
 * Gera a URL pública da retrospectiva.
 */
export function getStoryUrl(
  story: StoryData
): string {
  if (typeof window === "undefined") {
    return `/love/${story.slug}`;
  }

  return `${window.location.origin}/love/${story.slug}`;
}