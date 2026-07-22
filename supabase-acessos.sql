-- ============================================================
-- II COPA BABA DOS COROAS — Contador de acessos por dia
-- Registra 1 acesso por aparelho por dia. O total (visitantes
-- únicos e aberturas) só é visível para o admin, via função.
-- Rode este arquivo UMA vez no SQL Editor do Supabase.
-- ============================================================

create table if not exists public.copa_acessos (
  id         bigint generated always as identity primary key,
  dia        date        not null default ((now() at time zone 'America/Maceio')::date),
  device_id  text,
  criado_em  timestamptz not null default now()
);

create index if not exists copa_acessos_dia_idx on public.copa_acessos (dia);

alter table public.copa_acessos enable row level security;

-- Qualquer visitante pode registrar o PRÓPRIO acesso (só inserir).
drop policy if exists copa_acessos_insert on public.copa_acessos;
create policy copa_acessos_insert on public.copa_acessos
  for insert to anon, authenticated
  with check (true);

-- Ninguém consegue LER a tabela direto pelo navegador (sem política de select).
-- O total sai por esta função, que só responde ao admin:
create or replace function public.copa_acessos_por_dia()
returns table (dia date, visitantes bigint, aberturas bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'nao autorizado';
  end if;
  return query
    select a.dia,
           count(distinct a.device_id)::bigint as visitantes,
           count(*)::bigint                    as aberturas
    from public.copa_acessos a
    group by a.dia
    order by a.dia desc;
end;
$$;

grant execute on function public.copa_acessos_por_dia() to authenticated;
