import { readFileSync } from "fs";
import { join } from "path";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { computeTimeline } from "../src/lib/analytics/timeline";

const filePath = join(__dirname, "../src/lib/parser/__fixtures__/sample-timeline-gap.txt");
const raw = readFileSync(filePath, "utf-8");

const { conversation } = parseWhatsAppChat(raw);
const timeline = computeTimeline(conversation);

console.log(JSON.stringify(timeline, null, 2));
