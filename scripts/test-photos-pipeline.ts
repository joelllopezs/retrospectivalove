import JSZip from "jszip";
import { extractChatBundle } from "../src/lib/utils/loadChatFile";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { buildPhotoMoments, revokePhotoMoments } from "../src/lib/photos";

// Bytes mínimos de um JPEG válido (1x1 pixel), só pra existir como blob de verdade.
const MINIMAL_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "base64"
);

async function main() {
  const chatText = [
    "31/08/2026 06:42 - João: Bom dia amor",
    "31/08/2026 06:43 - Maria: IMG-20260831-WA0001.jpg (arquivo anexado)",
    "31/08/2026 06:44 - João: que foto linda",
  ].join("\n");

  const zip = new JSZip();
  zip.file("_chat.txt", chatText);
  zip.file("IMG-20260831-WA0001.jpg", MINIMAL_JPEG);
  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  const file = new File([new Uint8Array(buffer)], "Conversa do WhatsApp com Maria.zip", {
    type: "application/zip",
  });

  const bundle = await extractChatBundle(file);
  console.log("mediaFiles encontrados:", Array.from(bundle.mediaFiles.keys()));

  const { conversation } = parseWhatsAppChat(bundle.text);
  const moments = buildPhotoMoments(conversation, bundle.mediaFiles);

  console.log("momentos encontrados:", moments.length);
  for (const m of moments) {
    console.log(`- ${m.author} em ${m.date.toISOString()}: ${m.url.slice(0, 30)}...`);
  }

  revokePhotoMoments(moments);
  console.log("revoke ok, sem erro");
}

main();
