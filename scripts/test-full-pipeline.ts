import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { analyzeConversation } from "../src/lib/analytics";

const filePath = join(__dirname, "../src/lib/parser/__fixtures__/sample-multi-day.txt");
const raw = readFileSync(filePath, "utf-8");

const { conversation, warnings } = parseWhatsAppChat(raw);
const result = analyzeConversation(conversation);

console.log("=== Warnings do parser ===");
console.log(warnings);

console.log("\n=== AnalysisResult ===");
console.log(JSON.stringify(result, null, 2));
