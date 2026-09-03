import { Conversation } from "../parser/types";
import { AnalysisResult } from "../../types/analysis";
import { computeMessageStats } from "./messages";
import { computeEmojiStats } from "./emojis";
import { computeLoveStats } from "./love";
import { computeTimeline } from "./timeline";

export { computeMessageStats } from "./messages";
export { computeEmojiStats } from "./emojis";
export { computeLoveStats } from "./love";
export { computeTimeline } from "./timeline";

const NIGHT_HOURS = new Set([0, 1, 2, 3, 4, 5]);

/** Quem manda mais mensagens entre 00h e 05h. Empate é resolvido pela ordem de iteração (arbitrário). */
function findNightOwl(conversation: Conversation): string | null {
  const counts: Record<string, number> = {};

  for (const message of conversation.messages) {
    if (message.isSystemMessage) continue;
    if (!NIGHT_HOURS.has(message.date.getHours())) continue;
    counts[message.author] = (counts[message.author] ?? 0) + 1;
  }

  let best: { author: string; count: number } | null = null;
  for (const [author, count] of Object.entries(counts)) {
    if (!best || count > best.count) best = { author, count };
  }

  return best?.author ?? null;
}

/** Participante com a maior soma de todas as categorias do módulo romântico. */
function findMostRomantic(loveByParticipant: Record<string, Record<string, number>>): string | null {
  let best: { author: string; total: number } | null = null;

  for (const [author, categories] of Object.entries(loveByParticipant)) {
    const total = Object.values(categories).reduce((sum, n) => sum + n, 0);
    if (!best || total > best.total) best = { author, total };
  }

  return best?.author ?? null;
}

function findTopTalker(byParticipant: Record<string, number>): string | null {
  let best: { author: string; count: number } | null = null;
  for (const [author, count] of Object.entries(byParticipant)) {
    if (!best || count > best.count) best = { author, count };
  }
  return best?.author ?? null;
}

/**
 * Junta tudo que os módulos de analytics calculam separadamente num único
 * objeto — é esse objeto que o frontend (upload -> processamento -> dashboard)
 * vai consumir, sem precisar saber que existem 4 módulos por trás.
 */
export function analyzeConversation(conversation: Conversation): AnalysisResult {
  const messageStats = computeMessageStats(conversation);
  const emojiStats = computeEmojiStats(conversation);
  const loveStats = computeLoveStats(conversation);
  const timeline = computeTimeline(conversation);

  return {
    participants: conversation.participants,

    overview: {
      totalMessages: messageStats.totalMessages,
      totalDays: messageStats.totalDays,
      averagePerDay: messageStats.averagePerDay,
      firstMessageDate: messageStats.firstMessage?.date.toISOString() ?? null,
      lastMessageDate: messageStats.lastMessage?.date.toISOString() ?? null,
    },

    messages: {
      byParticipant: messageStats.byParticipant,
      byMonth: messageStats.byMonth,
      byHour: messageStats.byHour,
      byWeekday: messageStats.byWeekday,
      mostActiveDay: messageStats.mostActiveDay,
      mostActiveMonth: messageStats.mostActiveMonth,
      longestStreak: messageStats.longestStreak,
    },

    timeline: {
      byMonth: timeline.byMonth,
      series: timeline.series,
    },

    love: {
      declarations: loveStats.declarations,
      byParticipant: loveStats.byParticipant,
      firstDeclaration: loveStats.firstDeclaration,
    },

    emojis: {
      total: emojiStats.total,
      ranking: emojiStats.ranking,
      byParticipant: emojiStats.byParticipant,
    },

    awards: {
      talker: findTopTalker(messageStats.byParticipant),
      romantic: findMostRomantic(loveStats.byParticipant),
      nightOwl: findNightOwl(conversation),
    },
  };
}
