import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { computeMessageStats } from "../src/lib/analytics/messages";

const filePath = join(__dirname, "../src/lib/parser/__fixtures__/sample-multi-day.txt");
const raw = readFileSync(filePath, "utf-8");

const { conversation } = parseWhatsAppChat(raw);
const stats = computeMessageStats(conversation);

console.log(JSON.stringify(stats, null, 2));
