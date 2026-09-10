import { periodFor, hourlyDistribution, HOUR_PERIODS } from "./timeOfDay";
import { formatMonthLabel } from "./utils/format";
import type { AnalysisResult } from "@/types/analysis";

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Gera N números plausíveis (mas errados) perto do valor correto, pra virarem alternativas de quiz. */
function numericDistractors(correct: number, count: number): number[] {
  const distractors = new Set<number>();
  let attempts = 0;

  while (distractors.size < count && attempts < 60) {
    attempts++;
    const factor = 0.35 + Math.random() * 1.7; // entre ~35% e ~200% do valor certo
    const candidate = Math.max(0, Math.round(correct * factor));
    if (candidate !== correct) distractors.add(candidate);
  }

  // Fallback determinístico (cobre o caso correct=0, onde o "factor" nunca varia o resultado).
  let fallback = correct + 1;
  while (distractors.size < count) {
    if (fallback !== correct) distractors.add(fallback);
    fallback++;
  }

  return Array.from(distractors).slice(0, count);
}

function buildOptions(correctLabel: string, distractorLabels: string[]): { options: QuizOption[]; correctOptionId: string } {
  const options: QuizOption[] = [{ id: "correct", label: correctLabel }];
  distractorLabels.forEach((label, i) => options.push({ id: `d${i}`, label }));
  return { options: shuffle(options), correctOptionId: "correct" };
}

const FALLBACK_EMOJIS = ["😂", "❤️", "😍", "🥺", "😅", "🔥", "😭", "👍", "🙌", "😘"];

export function buildQuizQuestions(result: AnalysisResult): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // 1. "Eu te amo"
  const euTeAmo = result.love.declarations["eu te amo"] ?? 0;
  if (euTeAmo > 0) {
    const distractors = numericDistractors(euTeAmo, 3).map(String);
    const { options, correctOptionId } = buildOptions(String(euTeAmo), distractors);
    questions.push({
      id: "eu-te-amo",
      prompt: 'Quantas vezes vocês disseram "eu te amo"?',
      options,
      correctOptionId,
      explanation: `Foram ${euTeAmo}x ao todo.`,
    });
  }

  // 2. Quem falou mais
  const participantEntries = Object.entries(result.messages.byParticipant);
  if (participantEntries.length >= 2) {
    const topName = [...participantEntries].sort(([, a], [, b]) => b - a)[0][0];
    const options = shuffle(participantEntries.map(([name], i) => ({ id: `p${i}`, label: name })));
    const correctOption = options.find((o) => o.label === topName)!;
    questions.push({
      id: "talker",
      prompt: "Quem mandou mais mensagens?",
      options,
      correctOptionId: correctOption.id,
      explanation: `${topName} falou mais.`,
    });
  }

  // 3. Emoji favorito
  const topEmoji = result.emojis.ranking[0];
  if (topEmoji) {
    const pool = FALLBACK_EMOJIS.filter((e) => e !== topEmoji.emoji);
    const distractorEmojis = shuffle(pool).slice(0, 3);
    const { options, correctOptionId } = buildOptions(topEmoji.emoji, distractorEmojis);
    questions.push({
      id: "emoji",
      prompt: "Qual foi o emoji mais usado por vocês?",
      options,
      correctOptionId,
      explanation: `${topEmoji.emoji} apareceu ${topEmoji.count}x.`,
    });
  }

  // 4. Mês mais ativo
  const mostActiveMonth = result.messages.mostActiveMonth;
  if (mostActiveMonth) {
    const otherMonths = Object.keys(result.timeline.byMonth).filter((m) => m !== mostActiveMonth.key);
    const distractorMonths = shuffle(otherMonths).slice(0, 3);
    if (distractorMonths.length >= 2) {
      const { options, correctOptionId } = buildOptions(
        formatMonthLabel(mostActiveMonth.key),
        distractorMonths.map(formatMonthLabel)
      );
      questions.push({
        id: "month",
        prompt: "Qual foi o mês em que vocês mais conversaram?",
        options,
        correctOptionId,
        explanation: `${formatMonthLabel(mostActiveMonth.key)}, com ${mostActiveMonth.count} mensagens.`,
      });
    }
  }

  // 5. Período do dia
  const hours = hourlyDistribution(result.messages.byHour);
  if (hours.some((count) => count > 0)) {
    const peakHour = hours.indexOf(Math.max(...hours));
    const correctPeriod = periodFor(peakHour);
    const distractorPeriods = HOUR_PERIODS.map((p) => p.label).filter((label) => label !== correctPeriod.label);
    const { options, correctOptionId } = buildOptions(correctPeriod.label, distractorPeriods);
    questions.push({
      id: "period",
      prompt: "Em que período do dia vocês mais trocam mensagem?",
      options,
      correctOptionId,
      explanation: `Pico às ${String(peakHour).padStart(2, "0")}h.`,
    });
  }

  return questions;
}
