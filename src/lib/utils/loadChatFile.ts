import JSZip from "jszip";

const ACCEPTED_EXTENSIONS = [".txt", ".zip"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/** Limite de segurança: exports "com mídia" podem trazer centenas de arquivos.
 *  Não precisamos de todos — só o bastante pra montar alguns "momentos". */
const MAX_IMAGES = 60;

export function hasAcceptedExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function isImageFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export interface ChatBundle {
  text: string;
  /** Nome do arquivo (sem caminho) -> blob da imagem. Vazio quando o upload é só .txt. */
  mediaFiles: Map<string, Blob>;
}

/**
 * Lê o texto da conversa e, se for um .zip exportado "com mídia", também extrai
 * as fotos de dentro — tudo fica em memória no navegador, nada é enviado a servidor.
 *  - .txt: só o texto, sem mídia.
 *  - .zip: acha o .txt da conversa (nome varia por sistema/idioma) e separa as
 *    imagens pra montar a galeria de "momentos" depois.
 */
export async function extractChatBundle(file: File): Promise<ChatBundle> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".txt")) {
    return { text: await file.text(), mediaFiles: new Map() };
  }

  if (lower.endsWith(".zip")) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);

    const txtEntries = entries.filter((entry) => entry.name.toLowerCase().endsWith(".txt"));
    if (txtEntries.length === 0) {
      throw new Error("Não encontramos nenhuma conversa (.txt) dentro do arquivo .zip.");
    }
    const chatEntry = txtEntries.find((entry) => /chat|conversa/i.test(entry.name)) ?? txtEntries[0];
    const text = await chatEntry.async("string");

    const imageEntries = entries.filter((entry) => isImageFile(entry.name)).slice(0, MAX_IMAGES);
    const mediaFiles = new Map<string, Blob>();
    for (const entry of imageEntries) {
      const blob = await entry.async("blob");
      const basename = entry.name.split("/").pop() ?? entry.name;
      mediaFiles.set(basename, blob);
    }

    return { text, mediaFiles };
  }

  throw new Error("Formato de arquivo não suportado. Envie um .txt ou .zip.");
}
