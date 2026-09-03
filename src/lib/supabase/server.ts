import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key (secreta, ignora RLS). O import "server-only"
 * no topo faz o build falhar se algum componente de cliente tentar importar
 * esse arquivo por engano — é a nossa rede de segurança contra vazar a chave.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase (service role) não configurado no servidor. Preencha SUPABASE_SERVICE_ROLE_KEY no .env.local — veja .env.local.example."
    );
  }

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
