import type { Conversation } from "./parser/types";

export interface PhotoMoment {
  /** Object URL do navegador (URL.createObjectURL) — só existe nessa sessão, nunca é enviado a lugar nenhum. */
  url: string;
  author: string;
  date: Date;
}

const MAX_MOMENTS = 12;

/**
 * Cruza as mensagens que referenciam um arquivo (attachedFileName) com as imagens
 * de fato extraídas do .zip. Se o upload foi só .txt (sem mídia), mediaFiles vem
 * vazio e isso simplesmente retorna uma lista vazia — sem quebrar nada.
 */
export function buildPhotoMoments(conversation: Conversation, mediaFiles: Map<string, Blob>): PhotoMoment[] {
  if (mediaFiles.size === 0) return [];

  const moments: PhotoMoment[] = [];

  for (const message of conversation.messages) {
    if (message.isSystemMessage || !message.attachedFileName) continue;

    const blob = mediaFiles.get(message.attachedFileName);
    if (!blob) continue;

    moments.push({ url: URL.createObjectURL(blob), author: message.author, date: message.date });
    if (moments.length >= MAX_MOMENTS) break;
  }

  return moments;
}

/** Libera a memória dos object URLs. Chamar sempre que trocar/limpar a conversa. */
export function revokePhotoMoments(moments: PhotoMoment[]): void {
  for (const moment of moments) {
    URL.revokeObjectURL(moment.url);
  }
}
