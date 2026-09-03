import type { AnalysisResult } from "./analysis";

export interface StoredPhoto {
  url: string;
  author: string;
  date: string; // ISO
}

/** Payload que o cliente manda pra API depois de subir a mídia no Storage. */
export interface SaveRetrospectiveRequest {
  id: string;
  participants: string[];
  analysis: AnalysisResult;
  relationshipStart: string | null; // "YYYY-MM-DD"
  backgroundPhotoUrl: string | null;
  photos: StoredPhoto[];
}

/** Uma linha da tabela `retrospectives`, como volta do Supabase. */
export interface RetrospectiveRow {
  id: string;
  created_at: string;
  title: string | null;
  participants: string[];
  analysis: AnalysisResult;
  relationship_start: string | null;
  background_photo_url: string | null;
  custom_track_url: string | null;
  photos: StoredPhoto[];
  is_public: boolean;
}
