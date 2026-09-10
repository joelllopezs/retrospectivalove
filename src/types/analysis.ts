import { EmojiRanking } from "../lib/analytics/emojis";
import { LoveDeclaration } from "../lib/analytics/love";
import { RankedEntry, StreakInfo } from "../lib/analytics/messages";
import { TimelineEntry } from "../lib/analytics/timeline";

export interface AnalysisResult {
  participants: string[];

  overview: {
    totalMessages: number;
    totalDays: number;
    averagePerDay: number;
    firstMessageDate: string | null; // ISO
    lastMessageDate: string | null; // ISO
  };

  messages: {
    byParticipant: Record<string, number>;
    byMonth: Record<string, number>;
    byHour: Record<number, number>;
    byWeekday: Record<string, number>;
    mostActiveDay: RankedEntry | null;
    mostActiveMonth: RankedEntry | null;
    longestStreak: StreakInfo | null;
  };

  timeline: {
    byMonth: Record<string, number>;
    series: TimelineEntry[];
  };

  love: {
    declarations: Record<string, number>;
    byParticipant: Record<string, Record<string, number>>;
    firstDeclaration: LoveDeclaration | null;
  };

  emojis: {
    total: number;
    ranking: EmojiRanking[];
    byParticipant: Record<string, EmojiRanking[]>;
  };

  awards: {
    /** Quem mandou mais mensagens no total. */
    talker: string | null;
    /** Quem mais usou as categorias do módulo romântico (soma de todas as declarações/apelidos). */
    romantic: string | null;
    /** Quem mais manda mensagem de madrugada (00h-05h). */
    nightOwl: string | null;
  };
}
