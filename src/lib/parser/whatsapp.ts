import { Conversation, ParseResult, ParseWarning, WhatsAppMessage } from "./types";

/**
 * O export do WhatsApp varia bastante dependendo do sistema operacional,
 * idioma do aparelho e versão do app. Por isso tentamos vários formatos
 * de "início de mensagem" em sequência, na ordem mais específica -> mais genérica.
 *
 * Formatos suportados:
 *  Android (dash):      31/08/2026 06:42 - João: Bom dia
 *  Android (com vírgula): 31/08/2026, 06:42 - João: Bom dia
 *  iOS (colchetes):      [31/08/2026, 06:42:03] João: Bom dia
 *  12h com AM/PM:        8/31/26, 6:42 AM - João: Bom dia
 */
const MESSAGE_PATTERNS: RegExp[] = [
  // iOS: [DD/MM/YYYY, HH:mm:ss] Autor: texto
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}(?::\d{2})?)(?:\s?([APap][Mm]))?\]\s(.*)$/,
  // Android: DD/MM/YYYY[,] HH:mm - Autor: texto
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s(\d{1,2}:\d{2}(?::\d{2})?)(?:\s?([APap][Mm]))?\s-\s(.*)$/,
];

interface MatchedHeader {
  dateStr: string;
  timeStr: string;
  meridiem: string | null;
  rest: string;
}

function matchMessageStart(line: string): MatchedHeader | null {
  for (const pattern of MESSAGE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const [, dateStr, timeStr, meridiem, rest] = match;
      return { dateStr, timeStr, meridiem: meridiem ?? null, rest };
    }
  }
  return null;
}

/**
 * Recebe "06:42" ou "6:42:03" + opcional AM/PM e devolve horas/minutos em 24h.
 */
function parseTime(timeStr: string, meridiem: string | null): { hours: number; minutes: number } {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10));
  let hours = parts[0];
  const minutes = parts[1] ?? 0;

  if (meridiem) {
    const isPM = meridiem.toLowerCase() === "pm";
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  }

  return { hours, minutes };
}

/**
 * Assume o padrão brasileiro DD/MM/YYYY (ou DD/MM/YY).
 * Se um dia dessas o app precisar suportar exports americanos (MM/DD/YYYY),
 * isso deve virar uma opção configurável em vez de heurística automática.
 */
function parseDate(dateStr: string, timeStr: string, meridiem: string | null): Date | null {
  const [dayStr, monthStr, yearStr] = dateStr.split("/");
  if (!dayStr || !monthStr || !yearStr) return null;

  let year = parseInt(yearStr, 10);
  if (yearStr.length === 2) year += 2000;

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;

  const { hours, minutes } = parseTime(timeStr, meridiem);

  const date = new Date(year, month, day, hours, minutes);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

/**
 * Tenta separar "Autor: texto" do restante da linha.
 * Mensagens de sistema (ex: "As mensagens agora são criptografadas",
 * "João adicionou Maria") não têm esse padrão e são marcadas como tal.
 */
function splitAuthorAndText(rest: string): { author: string | null; text: string } {
  // Autor não deve ter mais que ~50 caracteres nem conter quebras de linha.
  const authorMatch = rest.match(/^([^:\n]{1,50}?):\s([\s\S]*)$/);
  if (authorMatch) {
    return { author: authorMatch[1].trim(), text: authorMatch[2] };
  }
  return { author: null, text: rest };
}

/**
 * Quando a conversa é exportada "com mídia", o WhatsApp troca o arquivo por uma
 * referência de texto na mensagem. O formato muda por sistema/idioma:
 *  iOS:              <attached: 00000001-PHOTO-2026-06-15-08-00-00.jpg>
 *  Android (PT-BR):  IMG-20260615-WA0001.jpg (arquivo anexado)
 *  Android (EN):     IMG-20260615-WA0001.jpg (file attached)
 * Em alguns exports mais antigos a mensagem é só o nome do arquivo sozinho.
 */
const ATTACHMENT_PATTERNS: RegExp[] = [
  /<attached:\s*([^>]+)>/i,
  /([\w.\-]+\.\w+)\s*\((?:arquivo anexado|file attached)\)/i,
];

function extractAttachmentFilename(text: string): string | null {
  const trimmed = text.trim();

  for (const pattern of ATTACHMENT_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return match[1].trim();
  }

  if (/^[\w.\-]+\.(?:jpg|jpeg|png|webp|gif|heic)$/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function parseWhatsAppChat(rawText: string): ParseResult {
  // Remove caracteres invisíveis que o WhatsApp às vezes injeta (LRM/RLM)
  // e normaliza quebras de linha.
  const cleaned = rawText.replace(/[\u200e\u200f]/g, "").replace(/\r\n/g, "\n");
  const lines = cleaned.split("\n");

  const messages: WhatsAppMessage[] = [];
  const warnings: ParseWarning[] = [];
  const participantsSet = new Set<string>();

  let current: WhatsAppMessage | null = null;

  const pushCurrent = () => {
    if (current) {
      // Remove espaços em branco à direita acumulados por linhas vazias.
      current.text = current.text.trimEnd();
      current.attachedFileName = extractAttachmentFilename(current.text);
      messages.push(current);
    }
  };

  lines.forEach((line, index) => {
    const header = matchMessageStart(line);

    if (header) {
      const date = parseDate(header.dateStr, header.timeStr, header.meridiem);

      if (!date) {
        warnings.push({
          line,
          lineNumber: index + 1,
          reason: "Data inválida, linha tratada como continuação da mensagem anterior.",
        });
        if (current) current.text += "\n" + line;
        return;
      }

      pushCurrent();

      const { author, text } = splitAuthorAndText(header.rest);
      const isSystemMessage = author === null;

      if (author) participantsSet.add(author);

      current = {
        date,
        time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
        author: author ?? "Sistema",
        text,
        isSystemMessage,
      };
    } else {
      // Linha de continuação (mensagem multilinha) ou lixo antes da primeira mensagem.
      if (current) {
        current.text += "\n" + line;
      } else if (line.trim() !== "") {
        warnings.push({
          line,
          lineNumber: index + 1,
          reason: "Linha ignorada: não corresponde a nenhum formato conhecido e não há mensagem anterior.",
        });
      }
    }
  });

  pushCurrent();

  const conversation: Conversation = {
    participants: Array.from(participantsSet),
    messages,
  };

  return { conversation, warnings };
}
