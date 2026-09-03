import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { computeLoveStats } from "../src/lib/analytics/love";

const filePath = join(__dirname, "../src/lib/parser/__fixtures__/sample-love.txt");
const raw = readFileSync(filePath, "utf-8");

const { conversation } = parseWhatsAppChat(raw);
const stats = computeLoveStats(conversation);

console.log(JSON.stringify(stats, null, 2));
