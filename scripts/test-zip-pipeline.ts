import { readFileSync } from "fs";
import { join } from "path";
import JSZip from "jszip";
import { extractChatBundle } from "../src/lib/utils/loadChatFile";
import { parseWhatsAppChat } from "../src/lib/parser/whatsapp";
import { analyzeConversation } from "../src/lib/analytics";

async function main() {
  const sampleText = readFileSync(
    join(__dirname, "../src/lib/parser/__fixtures__/sample-love.txt"),
    "utf-8"
  );

  // Simula um export de iOS: zip contendo "_chat.txt" + uma mídia qualquer junto.
  const zip = new JSZip();
  zip.file("_chat.txt", sampleText);
  zip.file("00000001-PHOTO.jpg", new Uint8Array([0xff, 0xd8, 0xff]));
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  const file = new File([new Uint8Array(zipBuffer)], "Conversa do WhatsApp com Maria.zip", {
    type: "application/zip",
  });

  console.log("=== Extraindo do .zip ===");
  const { text: extractedText } = await extractChatBundle(file);
  console.log(`Extraído com sucesso: ${extractedText.length} caracteres`);
  console.log("Bate com o original?", extractedText === sampleText);

  console.log("\n=== Pipeline completo a partir do .zip ===");
  const { conversation } = parseWhatsAppChat(extractedText);
  const result = analyzeConversation(conversation);
  console.log(`Participantes: ${result.participants.join(", ")}`);
  console.log(`Total de mensagens: ${result.overview.totalMessages}`);

  // Caso de erro: zip sem nenhum .txt dentro
  console.log("\n=== Zip sem .txt (deve dar erro tratado) ===");
  const emptyZip = new JSZip();
  emptyZip.file("foto.jpg", new Uint8Array([0xff, 0xd8, 0xff]));
  const emptyZipBuffer = await emptyZip.generateAsync({ type: "nodebuffer" });
  const badFile = new File([new Uint8Array(emptyZipBuffer)], "sem-conversa.zip", {
    type: "application/zip",
  });

  try {
    await extractChatBundle(badFile);
    console.log("ERRO: deveria ter lançado exceção");
  } catch (err) {
    console.log("Erro tratado corretamente:", (err as Error).message);
  }
}

main();
