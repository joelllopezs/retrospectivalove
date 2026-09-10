import type { AnalysisResult } from "./analysis";

export interface StoryPhoto {
  id?: string;

  /**
   * URL permanente da imagem.
   *
   * Atualmente pode ser um caminho local/futuro storage.
   * Não usar URL.createObjectURL aqui.
   */
  url: string;

  author: string;

  /**
   * Data em ISO para poder salvar/carregar.
   */
  date: string;
}

export interface RelationshipInfo {
  type: "dating" | "marriage";

  /**
   * Data em que começou o relacionamento.
   */
  startDate: string | null;
}

export interface StoryData {
  /**
   * ID da história.
   * Futuramente será o ID do banco.
   */
  id?: string;

  /**
   * Usado para criar o link público.
   *
   * Ex:
   * /love/joao-ana-abc123
   */
  slug: string;

  title: string;

  createdAt: string;

  relationship: RelationshipInfo;

  participants: string[];

  /**
   * Resultado completo da análise.
   */
  result: AnalysisResult;

  /**
   * Fotos persistidas da história.
   */
  photos: StoryPhoto[];

  /**
   * Carta final gerada.
   * Pode ser IA ou texto padrão.
   */
  letter?: string;
}