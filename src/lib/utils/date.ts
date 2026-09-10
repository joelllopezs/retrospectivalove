const WEEKDAYS_PT = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Chave estável por dia, ex: "2026-08-31". Usa componentes locais, não UTC. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Chave estável por mês, ex: "2026-08". */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function weekdayName(date: Date): string {
  return WEEKDAYS_PT[date.getDay()];
}

/** Número de dias corridos entre duas datas, incluindo o dia inicial. Ex: mesmo dia = 1. */
export function daySpan(start: Date, end: Date): number {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((endDay.getTime() - startDay.getTime()) / msPerDay) + 1;
}
