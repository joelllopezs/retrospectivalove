import { NextRequest, NextResponse } from "next/server";
import type { NarrativePayload } from "@/types/narrative";

const ANTHROPIC_MODEL = "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 20_000;

function buildPrompt(data: NarrativePayload): string {
  const lines: string[] = [
    `Participantes: ${data.participants.join(" e ") || "não identificado"}`,
    `Total de mensagens trocadas: ${data.totalMessages}`,
    `Dias de conversa, do início ao fim: ${data.totalDays}`,
    `Média de mensagens por dia: ${data.averagePerDay}`,
  ];

  if (data.mostActiveMonthLabel) lines.push(`Mês mais movimentado: ${data.mostActiveMonthLabel}`);
  if (data.favoriteEmoji) lines.push(`Emoji favorito: ${data.favoriteEmoji}`);
  lines.push(`Corações enviados: ${data.heartsTotal}`);
  lines.push(`Declarações de amor ("eu te amo"/"te amo"/variações): ${data.declarationsTotal}`);
  if (data.longestStreakDays && data.longestStreakDays > 1) {
    lines.push(`Maior sequência de dias seguidos conversando: ${data.longestStreakDays}`);
  }
  if (data.peakHourPeriod) lines.push(`Período do dia em que mais conversam: ${data.peakHourPeriod}`);
  if (data.firstDeclaration) {
    lines.push(`Primeira declaração de amor: ${data.firstDeclaration.author}, em ${data.firstDeclaration.dateLabel}`);
  }

  return [
    'Você está escrevendo a carta final de uma retrospectiva romântica estilo "Wrapped" sobre a',
    'conversa de um casal no WhatsApp, chamada Love Wrapped.',
    "Use SOMENTE os dados abaixo — você não tem acesso às mensagens reais do casal, só a estes números resumidos:",
    "",
    lines.join("\n"),
    "",
    "Escreva um único parágrafo em português do Brasil, tom caloroso e íntimo, como uma carta de amor curta.",
    "Sem clichês genéricos de IA, sem markdown, sem aspas envolvendo o texto todo, entre 60 e 100 palavras.",
    "Não invente fatos que não estejam na lista acima.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor. Veja o .env.local.example." },
      { status: 500 }
    );
  }

  let body: NarrativePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: buildPrompt(body) }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json({ error: "Não foi possível gerar a carta agora." }, { status: 502 });
    }

    const data = await response.json();
    const textBlock = (data.content as Array<{ type: string; text?: string }> | undefined)?.find(
      (block) => block.type === "text"
    );
    const narrative = textBlock?.text?.trim();

    if (!narrative) {
      return NextResponse.json({ error: "A IA não retornou nenhum texto." }, { status: 502 });
    }

    return NextResponse.json({ narrative });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.error("Erro ao chamar a API da Anthropic:", err);
    return NextResponse.json(
      { error: isAbort ? "A IA demorou demais pra responder." : "Não foi possível gerar a carta agora." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
