import { Conversation, WhatsAppMessage } from "../parser/types";
import { dayKey, monthKey, weekdayName, daySpan } from "../utils/date";

export interface RankedEntry {
  key: string;
  count: number;
}

export interface StreakInfo {
  /** Quantidade de dias consecutivos com pelo menos 1 mensagem. */
  length: number;
  startDate: string;
  endDate: string;
}

export interface MessageStats {
  totalMessages: number;
  byParticipant: Record<string, number>;

  /** Dias corridos entre a primeira e a última mensagem (inclusive). */
  totalDays: number;
  averagePerDay: number;

  mostActiveDay: RankedEntry | null;
  mostActiveMonth: RankedEntry | null;

  byMonth: Record<string, number>;
  byWeekday: Record<string, number>;
  byHour: Record<number, number>;

  /** Maior sequência de dias seguidos conversando (a "maior conversa" ao longo do tempo). */
  longestStreak: StreakInfo | null;

  firstMessage: WhatsAppMessage | null;
  lastMessage: WhatsAppMessage | null;
}

/**
 * Por padrão, mensagens de sistema (avisos de criptografia, "fulano entrou no grupo" etc.)
 * são excluídas das estatísticas — elas não representam conversa real entre os participantes.
 */
function relevantMessages(conversation: Conversation): WhatsAppMessage[] {
  return conversation.messages.filter((m) => !m.isSystemMessage);
}

function findMax(counts: Record<string, number>): RankedEntry | null {
  let best: RankedEntry | null = null;
  for (const [key, count] of Object.entries(counts)) {
    if (!best || count > best.count) best = { key, count };
  }
  return best;
}

function computeLongestStreak(sortedDayKeys: string[]): StreakInfo | null {
  if (sortedDayKeys.length === 0) return null;

  const uniqueDays = Array.from(new Set(sortedDayKeys)).sort();

  let bestStart = uniqueDays[0];
  let bestLength = 1;

  let currentStart = uniqueDays[0];
  let currentLength = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentLength += 1;
    } else {
      currentStart = uniqueDays[i];
      currentLength = 1;
    }

    if (currentLength > bestLength) {
      bestLength = currentLength;
      bestStart = currentStart;
    }
  }

  const bestEndIndex = uniqueDays.indexOf(bestStart) + bestLength - 1;

  return {
    length: bestLength,
    startDate: bestStart,
    endDate: uniqueDays[bestEndIndex],
  };
}

export function computeMessageStats(conversation: Conversation): MessageStats {
  const messages = relevantMessages(conversation);

  if (messages.length === 0) {
    return {
      totalMessages: 0,
      byParticipant: {},
      totalDays: 0,
      averagePerDay: 0,
      mostActiveDay: null,
      mostActiveMonth: null,
      byMonth: {},
      byWeekday: {},
      byHour: {},
      longestStreak: null,
      firstMessage: null,
      lastMessage: null,
    };
  }

  const byParticipant: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byWeekday: Record<string, number> = {};
  const byHour: Record<number, number> = {};

  let firstMessage = messages[0];
  let lastMessage = messages[0];

  for (const message of messages) {
    byParticipant[message.author] = (byParticipant[message.author] ?? 0) + 1;

    const dKey = dayKey(message.date);
    byDay[dKey] = (byDay[dKey] ?? 0) + 1;

    const mKey = monthKey(message.date);
    byMonth[mKey] = (byMonth[mKey] ?? 0) + 1;

    const wKey = weekdayName(message.date);
    byWeekday[wKey] = (byWeekday[wKey] ?? 0) + 1;

    const hour = message.date.getHours();
    byHour[hour] = (byHour[hour] ?? 0) + 1;

    if (message.date < firstMessage.date) firstMessage = message;
    if (message.date > lastMessage.date) lastMessage = message;
  }

  const totalDays = daySpan(firstMessage.date, lastMessage.date);
  const averagePerDay = totalDays > 0 ? Math.round(messages.length / totalDays) : messages.length;

  const mostActiveDayRaw = findMax(byDay);
  const mostActiveMonthRaw = findMax(byMonth);

  return {
    totalMessages: messages.length,
    byParticipant,
    totalDays,
    averagePerDay,
    mostActiveDay: mostActiveDayRaw ? { key: mostActiveDayRaw.key, count: mostActiveDayRaw.count } : null,
    mostActiveMonth: mostActiveMonthRaw ? { key: mostActiveMonthRaw.key, count: mostActiveMonthRaw.count } : null,
    byMonth,
    byWeekday,
    byHour,
    longestStreak: computeLongestStreak(Object.keys(byDay)),
    firstMessage,
    lastMessage,
  };
}
