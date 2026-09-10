import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";

const sample = `31/08/2026 06:42 - João: Bom dia amor ❤️
31/08/2026 06:43 - Maria: IMG-20260831-WA0001.jpg (arquivo anexado)
31/08/2026 06:44 - João: Olha que foto linda
[31/08/2026, 06:45:00] Maria: <attached: 00000002-PHOTO-2026-08-31-06-45-00.jpg>
31/08/2026 06:46 - João: PTT-20260831-WA0003.opus (arquivo anexado)
`;

const { conversation } = parseWhatsAppChat(sample);

for (const m of conversation.messages) {
  console.log(`${m.author}: attachedFileName=${JSON.stringify(m.attachedFileName)} text=${JSON.stringify(m.text)}`);
}
