/**
 * O que mandamos pra IA gerar a carta final — só números resumidos, nunca as
 * mensagens reais do casal. Isso é proposital (ver item 20 do roteiro): a IA
 * não precisa (e não deve) ver o conteúdo da conversa pra escrever a carta.
 */
export interface NarrativePayload {
  participants: string[];
  totalMessages: number;
  totalDays: number;
  averagePerDay: number;
  mostActiveMonthLabel: string | null;
  favoriteEmoji: string | null;
  heartsTotal: number;
  declarationsTotal: number;
  longestStreakDays: number | null;
  peakHourPeriod: string | null;
  firstDeclaration: { author: string; dateLabel: string } | null;
}
