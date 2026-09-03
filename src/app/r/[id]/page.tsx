import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { StoryViewer } from "@/components/StoryViewer";
import type { RetrospectiveRow } from "@/types/retrospective";

export default async function RetrospectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let record: RetrospectiveRow | null = null;
  let configError = false;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("retrospectives")
      .select("*")
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle();

    if (error) throw error;
    record = data as RetrospectiveRow | null;
  } catch (err) {
    console.error("Erro ao buscar retrospectiva:", err);
    configError = true;
  }

  if (configError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-2xl italic text-paper">Ainda não configurado</p>
        <p className="mt-3 max-w-sm font-body text-sm text-muted">
          O Supabase não está configurado nesse servidor. Preencha as variáveis no
          .env.local (veja .env.local.example) e reinicie o app.
        </p>
      </main>
    );
  }

  if (!record) {
    notFound();
  }

  return <StoryViewer record={record} />;
}
