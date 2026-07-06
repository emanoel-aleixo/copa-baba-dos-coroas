-- ============================================================
-- II COPA BABA DOS COROAS — tabelas no mesmo projeto Supabase
-- do Motion Lab (prefixo copa_ para não misturar).
-- COMO APLICAR: Supabase Dashboard → SQL Editor → colar → Run.
-- ============================================================

-- Resultados dos jogos (o admin preenche pelo painel)
create table if not exists public.copa_resultados (
  jogo_id int primary key,
  placar_casa int not null check (placar_casa between 0 and 99),
  placar_fora int not null check (placar_fora between 0 and 99),
  eventos jsonb not null default '{"gols":[],"amarelos":[],"vermelhos":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Palpites do bolão (somente INSERÇÃO — ninguém altera palpite alheio;
-- vale o último palpite de cada aparelho enviado ANTES da bola rolar)
create table if not exists public.copa_palpites (
  id bigint generated always as identity primary key,
  device_id text not null,
  nome text not null default 'Palpiteiro',
  jogo_id int not null,
  palpite_casa int not null check (palpite_casa between 0 and 30),
  palpite_fora int not null check (palpite_fora between 0 and 30),
  created_at timestamptz not null default now()
);
create index if not exists copa_palpites_jogo_idx on public.copa_palpites (jogo_id);

-- Fotos liberadas após a compra (o admin marca pelo painel)
create table if not exists public.copa_fotos_liberadas (
  foto_id text primary key,
  updated_at timestamptz not null default now()
);

-- ---------- Segurança (RLS) ----------
alter table public.copa_resultados enable row level security;
alter table public.copa_palpites enable row level security;
alter table public.copa_fotos_liberadas enable row level security;

-- Todo mundo pode LER (o app é público)
drop policy if exists copa_resultados_select on public.copa_resultados;
create policy copa_resultados_select on public.copa_resultados
  for select using (true);

drop policy if exists copa_palpites_select on public.copa_palpites;
create policy copa_palpites_select on public.copa_palpites
  for select using (true);

drop policy if exists copa_fotos_select on public.copa_fotos_liberadas;
create policy copa_fotos_select on public.copa_fotos_liberadas
  for select using (true);

-- Palpites: qualquer visitante pode ENVIAR (nunca editar/apagar)
drop policy if exists copa_palpites_insert on public.copa_palpites;
create policy copa_palpites_insert on public.copa_palpites
  for insert with check (true);

-- Resultados e fotos: só o ADMIN escreve (reusa o is_admin() do Motion Lab)
drop policy if exists copa_resultados_admin on public.copa_resultados;
create policy copa_resultados_admin on public.copa_resultados
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists copa_fotos_admin on public.copa_fotos_liberadas;
create policy copa_fotos_admin on public.copa_fotos_liberadas
  for all using (public.is_admin()) with check (public.is_admin());
