import { Conversation, WhatsAppMessage } from "../parser/types";
import { normalizeForMatching } from "../utils/text";

/**
 * Categorias baseadas na lista do roteiro (passo 9). "saudade"/"saudades" foram
 * unificadas numa só categoria por serem singular/plural da mesma coisa; o resto
 * ficou granular de propósito — juntar categorias parecidas é decisão de UI,
 * não do motor de análise. Isso é só CONTAGEM por categoria, sem pontuação ainda
 * (o Love Score fica pra depois, conforme combinado).
 */
interface LoveCategoryDef {
  /** Chave exibida nas estatísticas, ex: "eu te amo". */
  key: string;
  /** Nome do grupo nomeado no regex (precisa ser um identificador válido). */
  groupName: string;
  /** Fonte do regex, já em texto normalizado (sem acento). */
  pattern: string;
  /**
   * Categorias "núcleo" de declaração de amor (não apelidos genéricos como
   * "amor"/"vida" sozinhos) — usadas para achar a primeira declaração.
   */
  isCoreDeclaration: boolean;
}

const CATEGORY_DEFS: LoveCategoryDef[] = [
  { key: "eu te amo", groupName: "euTeAmo", pattern: "eu\\s+te\\s+amo", isCoreDeclaration: true },
  { key: "te amo", groupName: "teAmo", pattern: "te\\s+amo", isCoreDeclaration: true },
  { key: "amo você", groupName: "amoVoce", pattern: "amo\\s+voce", isCoreDeclaration: true },
  { key: "amo vc", groupName: "amoVc", pattern: "amo\\s+vc", isCoreDeclaration: true },
  { key: "saudade", groupName: "saudade", pattern: "saudades?", isCoreDeclaration: false },
  { key: "meu amor", groupName: "meuAmor", pattern: "meu\\s+amor", isCoreDeclaration: false },
  { key: "amor", groupName: "amor", pattern: "amor", isCoreDeclaration: false },
  { key: "vida", groupName: "vida", pattern: "vida", isCoreDeclaration: false },
  { key: "meu bem", groupName: "meuBem", pattern: "meu\\s+bem", isCoreDeclaration: false },
];

function buildCombinedRegex(): RegExp {
  const alternatives = CATEGORY_DEFS.map((def) => `(?<${def.groupName}>\\b${def.pattern}\\b)`).join("|");
  return new RegExp(alternatives, "g");
}

const GROUP_TO_DEF = new Map(CATEGORY_DEFS.map((def) => [def.groupName, def]));

export interface LoveDeclaration {
  author: string;
  date: string; // ISO
  text: string;
  category: string;
}

export interface LoveStats {
  /** Quantas vezes cada categoria apareceu no total. */
  declarations: Record<string, number>;
  /** Mesma coisa, quebrado por participante. */
  byParticipant: Record<string, Record<string, number>>;
  /**
   * Primeira mensagem em que alguém declarou amor de forma "central"
   * (eu te amo / te amo / amo você / amo vc) — não conta apelidos como
   * "amor"/"vida" sozinhos, que são carinhosos mas não uma declaração em si.
   */
  firstDeclaration: LoveDeclaration | null;
}

function relevantMessages(conversation: Conversation): WhatsAppMessage[] {
  return conversation.messages.filter((m) => !m.isSystemMessage);
}

export function computeLoveStats(conversation: Conversation): LoveStats {
  const declarations: Record<string, number> = {};
  const byParticipant: Record<string, Record<string, number>> = {};
  let firstDeclaration: LoveDeclaration | null = null;

  // Assume que as mensagens já vêm em ordem cronológica do parser.
  const messages = relevantMessages(conversation);

  for (const message of messages) {
    const normalized = normalizeForMatching(message.text);
    if (normalized === "") continue;

    const regex = buildCombinedRegex(); // regex com flag "g" é stateful, recriar por mensagem
    const matches = normalized.matchAll(regex);

    if (!byParticipant[message.author]) {
      byParticipant[message.author] = {};
    }

    for (const match of matches) {
      const groupName = Object.keys(match.groups ?? {}).find((name) => match.groups?.[name] !== undefined);
      if (!groupName) continue;

      const def = GROUP_TO_DEF.get(groupName);
      if (!def) continue;

      declarations[def.key] = (declarations[def.key] ?? 0) + 1;
      byParticipant[message.author][def.key] = (byParticipant[message.author][def.key] ?? 0) + 1;

      if (!firstDeclaration && def.isCoreDeclaration) {
        firstDeclaration = {
          author: message.author,
          date: message.date.toISOString(),
          text: message.text,
          category: def.key,
        };
      }
    }
  }

  return { declarations, byParticipant, firstDeclaration };
}
