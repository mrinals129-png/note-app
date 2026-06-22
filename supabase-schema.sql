create table if not exists public.daybook_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daybook_documents_user_id_key unique (user_id)
);

alter table public.daybook_documents enable row level security;

grant select, insert, update, delete on public.daybook_documents to authenticated;

create or replace function public.set_daybook_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_daybook_documents_updated_at on public.daybook_documents;

create trigger set_daybook_documents_updated_at
before update on public.daybook_documents
for each row
execute function public.set_daybook_updated_at();

drop policy if exists "Users can read their own daybook." on public.daybook_documents;
drop policy if exists "Users can create their own daybook." on public.daybook_documents;
drop policy if exists "Users can update their own daybook." on public.daybook_documents;
drop policy if exists "Users can delete their own daybook." on public.daybook_documents;

create policy "Users can read their own daybook."
on public.daybook_documents for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own daybook."
on public.daybook_documents for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own daybook."
on public.daybook_documents for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daybook."
on public.daybook_documents for delete
to authenticated
using ((select auth.uid()) = user_id);
