import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { SaveRetrospectiveRequest } from "@/types/retrospective";

const ID_PATTERN = /^[a-zA-Z0-9_-]{6,32}$/;

export async function POST(request: NextRequest) {
  let body: SaveRetrospectiveRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { id, participants, analysis, relationshipStart, backgroundPhotoUrl, photos } = body ?? {};

  if (!id || !ID_PATTERN.test(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }
  if (!analysis || typeof analysis !== "object") {
    return NextResponse.json({ error: "Dados da retrospectiva ausentes." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("retrospectives").insert({
      id,
      participants: participants ?? [],
      analysis,
      relationship_start: relationshipStart ?? null,
      background_photo_url: backgroundPhotoUrl ?? null,
      photos: photos ?? [],
    });

    if (error) {
      console.error("Erro ao salvar retrospectiva no Supabase:", error);
      return NextResponse.json({ error: "Não foi possível salvar a retrospectiva." }, { status: 502 });
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Erro de configuração do Supabase:", err);
    return NextResponse.json(
      { error: "Supabase não configurado no servidor. Veja o .env.local.example." },
      { status: 500 }
    );
  }
}
