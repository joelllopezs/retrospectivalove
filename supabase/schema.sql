-- Love Wrapped — schema da Fase 6 (salvar + compartilhar retrospectivas)
-- Rode isso inteiro no SQL Editor do seu projeto Supabase (supabase.com).

-- ── Tabela principal ─────────────────────────────────────────────────────
create table if not exists retrospectives (
  id text primary key,                          -- ID curto usado na URL: /r/{id}
  created_at timestamptz not null default now(),
  title text,
  participants jsonb not null default '[]'::jsonb,
  analysis jsonb not null,                      -- o AnalysisResult inteiro
  relationship_start date,                      -- opcional, "quando começou tudo"
  background_photo_url text,                    -- opcional, foto de fundo do Story
  custom_track_url text,                        -- reservado pra uso futuro
  photos jsonb not null default '[]'::jsonb,    -- [{ url, author, date }]
  is_public boolean not null default true,
  expires_at timestamptz,                       -- reservado pra uso futuro (expiração de link)
  user_id uuid references auth.users(id)        -- nulo por enquanto (sem login ainda)
);

alter table retrospectives enable row level security;

-- Qualquer pessoa pode LER uma retrospectiva pública pelo id — é assim que o link funciona.
drop policy if exists "Retrospectivas públicas são visíveis" on retrospectives;
create policy "Retrospectivas públicas são visíveis"
  on retrospectives for select
  using (is_public = true);

-- Ninguém escreve direto pelo navegador com a chave anônima — só o servidor da
-- nossa própria API (/api/retrospectives), usando a service role key, que
-- ignora RLS. Por isso não existe policy de INSERT/UPDATE/DELETE aqui.


-- ── Storage: bucket público pra fotos e foto de fundo ──────────────────────
insert into storage.buckets (id, name, public)
values ('retrospective-media', 'retrospective-media', true)
on conflict (id) do nothing;

drop policy if exists "Mídia de retrospectivas é pública pra leitura" on storage.objects;
create policy "Mídia de retrospectivas é pública pra leitura"
  on storage.objects for select
  using (bucket_id = 'retrospective-media');

-- IMPORTANTE: como ainda não tem login, o upload usa a chave anônima direto do
-- navegador — por isso essa policy libera INSERT pra qualquer um. Isso é uma
-- concessão aceitável pra essa fase (sem contas de usuário ainda), mas vale
-- revisitar quando "Login" entrar: dá pra restringir upload só pra usuários
-- autenticados trocando `true` por uma checagem de auth.uid().
drop policy if exists "Upload de mídia liberado" on storage.objects;
create policy "Upload de mídia liberado"
  on storage.objects for insert
  with check (bucket_id = 'retrospective-media');
