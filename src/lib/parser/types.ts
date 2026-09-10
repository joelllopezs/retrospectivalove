export interface WhatsAppMessage {
  date: Date;
  time: string;
  author: string;
  text: string;
  isSystemMessage?: boolean;
  /** Nome do arquivo de mídia anexado a essa mensagem (foto, vídeo, áudio), se houver. */
  attachedFileName?: string | null;
}

export interface Conversation {
  participants: string[];
  messages: WhatsAppMessage[];
}

/**
 * Erros que o parser pode reportar sem quebrar o processamento inteiro.
 * Guardamos a linha original para facilitar debug depois.
 */
export interface ParseWarning {
  line: string;
  lineNumber: number;
  reason: string;
}

export interface ParseResult {
  conversation: Conversation;
  warnings: ParseWarning[];
}
