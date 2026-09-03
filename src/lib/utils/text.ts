/**
 * Normaliza texto para comparação/matching de frases, sem se importar com
 * a formatação original da mensagem. Trata:
 *  - maiúsculas/minúsculas: "EU TE AMO" -> "eu te amo"
 *  - acentos: "você" -> "voce" (facilita comparar com variações sem acento)
 *  - letras repetidas por ênfase: "amoooo" -> "amo" (3+ repetições viram 1)
 *  - espaços duplicados / quebras de linha extras -> espaço único
 *
 * Importante: só colapsamos repetições de 3+ caracteres iguais, para não
 * quebrar palavras com dígrafos legítimos em português (ex: "isso", "carro").
 */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove marcas de acento
    .replace(/([a-z])\1{2,}/g, "$1") // "amoooo" -> "amo"
    .replace(/\s+/g, " ")
    .trim();
}
