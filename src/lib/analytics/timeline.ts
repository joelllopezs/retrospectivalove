import { Conversation, WhatsAppMessage } from "../parser/types";
import { monthKey } from "../utils/date";

export interface TimelineEntry {
  month: string; // "AAAA-MM"
  count: number;
}

export interface TimelineStats {
  /** Mesmo formato sugerido no roteiro: { "2025-01": 8210, ... }. */
  byMonth: Record<string, number>;
  /** Mesma coisa, mas em lista ordenada cronologicamente — mais fácil de plugar direto num gráfico. */
  series: TimelineEntry[];
}

function relevantMessages(conversation: Conversation): WhatsAppMessage[] {
  return conversation.messages.filter((m) => !m.isSystemMessage);
}

/** Gera a lista de chaves "AAAA-MM" entre duas datas, inclusive, mesmo sem mensagens nesses meses. */
function monthRange(start: Date, end: Date): string[] {
  const months: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

/**
 * Diferente do `byMonth` de messages.ts (que só tem os meses que de fato têm mensagem),
 * aqui preenchemos os meses "vazios" com 0. Isso importa pros gráficos: sem isso, um gap
 * de silêncio no meio da conversa vira uma linha reta enganosa entre dois pontos distantes
 * em vez de mostrar o vale.
 */
export function computeTimeline(conversation: Conversation): TimelineStats {
  const messages = relevantMessages(conversation);

  if (messages.length === 0) {
    return { byMonth: {}, series: [] };
  }

  const rawCounts: Record<string, number> = {};
  let earliest = messages[0].date;
  let latest = messages[0].date;

  for (const message of messages) {
    const key = monthKey(message.date);
    rawCounts[key] = (rawCounts[key] ?? 0) + 1;
    if (message.date < earliest) earliest = message.date;
    if (message.date > latest) latest = message.date;
  }

  const months = monthRange(earliest, latest);

  const byMonth: Record<string, number> = {};
  const series: TimelineEntry[] = [];

  for (const month of months) {
    const count = rawCounts[month] ?? 0;
    byMonth[month] = count;
    series.push({ month, count });
  }

  return { byMonth, series };
}
