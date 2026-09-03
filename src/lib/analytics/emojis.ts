import emojiRegexFactory from "emoji-regex";
import { Conversation, WhatsAppMessage } from "../parser/types";

export interface EmojiRanking {
  emoji: string;
  count: number;
}

export interface EmojiStats {
  total: number;
  ranking: EmojiRanking[];
  byParticipant: Record<string, EmojiRanking[]>;
}

function relevantMessages(conversation: Conversation): WhatsAppMessage[] {
  return conversation.messages.filter((m) => !m.isSystemMessage);
}

function rankFromCounts(counts: Record<string, number>): EmojiRanking[] {
  return Object.entries(counts)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count);
}

export function computeEmojiStats(conversation: Conversation): EmojiStats {
  const globalCounts: Record<string, number> = {};
  const participantCounts: Record<string, Record<string, number>> = {};

  for (const message of relevantMessages(conversation)) {
    // emoji-regex precisa de uma instância nova por iteração (o estado do regex é stateful).
    const regex = emojiRegexFactory();
    const matches = message.text.match(regex);
    if (!matches) continue;

    if (!participantCounts[message.author]) {
      participantCounts[message.author] = {};
    }

    for (const emoji of matches) {
      globalCounts[emoji] = (globalCounts[emoji] ?? 0) + 1;
      participantCounts[message.author][emoji] = (participantCounts[message.author][emoji] ?? 0) + 1;
    }
  }

  const total = Object.values(globalCounts).reduce((sum, count) => sum + count, 0);

  const byParticipant: Record<string, EmojiRanking[]> = {};
  for (const [author, counts] of Object.entries(participantCounts)) {
    byParticipant[author] = rankFromCounts(counts);
  }

  return {
    total,
    ranking: rankFromCounts(globalCounts),
    byParticipant,
  };
}
