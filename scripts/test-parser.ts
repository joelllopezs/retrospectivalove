import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";

const filePath = join(__dirname, "../src/lib/parser/__fixtures__/sample.txt");
const raw = readFileSync(filePath, "utf-8");

const { conversation, warnings } = parseWhatsAppChat(raw);

console.log("=== Participantes ===");
console.log(conversation.participants);

console.log("\n=== Mensagens ===");
conversation.messages.forEach((m, i) => {
  console.log(
    `[${i}] ${m.date.toISOString()} (${m.time}) ${m.author}${m.isSystemMessage ? " [sistema]" : ""}: ${JSON.stringify(
      m.text
    )}`
  );
});

console.log("\n=== Warnings ===");
console.log(warnings);

console.log(`\nTotal de mensagens: ${conversation.messages.length}`);
