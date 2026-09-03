const MONTH_ABBR_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_FULL_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function formatPercent(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "2026-08" -> "ago/26" */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  return `${MONTH_ABBR_PT[month - 1]}/${String(year).slice(2)}`;
}

/** ISO string -> "1 de agosto de 2026" */
export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} de ${MONTH_FULL_PT[date.getMonth()]} de ${date.getFullYear()}`;
}
