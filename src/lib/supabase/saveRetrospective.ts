import { customAlphabet } from "nanoid";
import { getSupabaseClient } from "./client";
import type { AnalysisResult } from "@/types/analysis";
import type { PhotoMoment } from "@/lib/photos";
import type { StoredPhoto } from "@/types/retrospective";

const BUCKET = "retrospective-media";
// Alfabeto sem caracteres ambíguos (0/O, 1/l/I), pra IDs que dá pra digitar/ler sem confusão.
const generateId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

async function uploadBlob(path: string, blob: Blob, contentType: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function objectUrlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível ler o arquivo local.");
  return response.blob();
}

export interface SaveRetrospectiveInput {
  result: AnalysisResult;
  photos: PhotoMoment[];
  relationshipStartDateValue: string; // "" ou "YYYY-MM-DD"
  backgroundPhotoUrl: string | null; // object URL local (blob:)
}

/**
 * Sobe fotos + foto de fundo pro Storage (usando a chave anônima, direto do
 * navegador) e depois manda o resto pra /api/retrospectives, que grava no
 * banco com a service role key. Retorna o ID curto usado na URL pública.
 */
export async function saveRetrospective(input: SaveRetrospectiveInput): Promise<string> {
  const id = generateId();

  const uploadedPhotos: StoredPhoto[] = [];
  for (let i = 0; i < input.photos.length; i++) {
    const photo = input.photos[i];
    const blob = await objectUrlToBlob(photo.url);
    const publicUrl = await uploadBlob(`${id}/photo-${i}.jpg`, blob, blob.type || "image/jpeg");
    uploadedPhotos.push({ url: publicUrl, author: photo.author, date: photo.date.toISOString() });
  }

  let backgroundPhotoUrl: string | null = null;
  if (input.backgroundPhotoUrl) {
    const blob = await objectUrlToBlob(input.backgroundPhotoUrl);
    backgroundPhotoUrl = await uploadBlob(`${id}/background.jpg`, blob, blob.type || "image/jpeg");
  }

  const response = await fetch("/api/retrospectives", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      participants: input.result.participants,
      analysis: input.result,
      relationshipStart: input.relationshipStartDateValue || null,
      backgroundPhotoUrl,
      photos: uploadedPhotos,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Não foi possível salvar a retrospectiva.");
  }

  return id;
}
