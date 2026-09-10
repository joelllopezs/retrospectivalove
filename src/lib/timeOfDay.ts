export interface HourPeriod {
  label: string;
  range: [number, number];
  phrase: string;
}

export const HOUR_PERIODS: HourPeriod[] = [
  { label: "madrugada", range: [0, 5], phrase: "Vocês são almas de madrugada 🌙" },
  { label: "manhã", range: [6, 11], phrase: "Vocês começam o dia conversando ☀️" },
  { label: "tarde", range: [12, 17], phrase: "As tardes de vocês são de papo 🌤️" },
  { label: "noite", range: [18, 23], phrase: "As noites de vocês são de conversa 🌆" },
];

export function periodFor(hour: number): HourPeriod {
  return HOUR_PERIODS.find(({ range: [start, end] }) => hour >= start && hour <= end) ?? HOUR_PERIODS[0];
}

/** Distribuição de mensagens por hora (0-23), preenchendo com 0 as horas sem mensagem. */
export function hourlyDistribution(byHour: Record<number, number>): number[] {
  return Array.from({ length: 24 }, (_, h) => byHour[h] ?? 0);
}
