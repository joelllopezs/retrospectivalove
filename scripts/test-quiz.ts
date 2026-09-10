import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { analyzeConversation } from "../src/lib/analytics";
import { buildQuizQuestions } from "../src/lib/quiz";

const raw = readFileSync(join(__dirname, "../src/lib/parser/__fixtures__/sample-love.txt"), "utf-8");
const { conversation } = parseWhatsAppChat(raw);
const result = analyzeConversation(conversation);

const questions = buildQuizQuestions(result);

console.log(`Geradas ${questions.length} perguntas:\n`);
for (const q of questions) {
  console.log(`[${q.id}] ${q.prompt}`);
  for (const opt of q.options) {
    const mark = opt.id === q.correctOptionId ? "✔" : " ";
    console.log(`  ${mark} ${opt.label}`);
  }
  console.log(`  explicação: ${q.explanation}\n`);
}

// Checagem de sanidade: nenhuma pergunta pode ter opções duplicadas ou faltando a correta
for (const q of questions) {
  const labels = q.options.map((o) => o.label);
  const uniqueLabels = new Set(labels);
  if (uniqueLabels.size !== labels.length) {
    console.error(`ERRO: pergunta "${q.id}" tem opções duplicadas:`, labels);
  }
  if (!q.options.some((o) => o.id === q.correctOptionId)) {
    console.error(`ERRO: pergunta "${q.id}" não tem a opção correta entre as opções`);
  }
}
console.log("Checagem de sanidade concluída.");
