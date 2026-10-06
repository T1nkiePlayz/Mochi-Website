-- Website account controls. The default is restrictive for new accounts.
alter table public.profiles
  add column if not exists metadata_sync_allowed boolean not null default false,
  add column if not exists is_admin boolean not null default false;

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

revoke update on public.profiles from anon, authenticated;

create or replace function public.update_my_profile(profile_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set display_name = nullif(trim(profile_data->>'display_name'), ''),
      avatar_url = nullif(trim(profile_data->>'avatar_url'), ''),
      cloud_sync_enabled = coalesce((profile_data->>'cloud_sync_enabled')::boolean, cloud_sync_enabled),
      metadata_sync_allowed = coalesce((profile_data->>'metadata_sync_allowed')::boolean, metadata_sync_allowed)
  where id = (select auth.uid());
end;
$$;

revoke all on function public.update_my_profile(jsonb) from public;
grant execute on function public.update_my_profile(jsonb) to authenticated;

create or replace function public.admin_list_profiles()
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select p.* from public.profiles p
  where exists (select 1 from public.profiles me where me.id = (select auth.uid()) and me.is_admin);
$$;

revoke all on function public.admin_list_profiles() from public;
grant execute on function public.admin_list_profiles() to authenticated;

create or replace function public.admin_set_metadata_access(target_user_id uuid, allowed boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin) then
    raise exception 'admin access required' using errcode = '42501';
  end if;
  update public.profiles set metadata_sync_allowed = allowed where id = target_user_id;
end;
$$;

revoke all on function public.admin_set_metadata_access(uuid, boolean) from public;
grant execute on function public.admin_set_metadata_access(uuid, boolean) to authenticated;

create or replace function public.enforce_metadata_sync_allowed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is not null
     and not exists (
       select 1 from public.profiles
       where id = (select auth.uid()) and metadata_sync_allowed
     ) then
    raise exception 'metadata sync is disabled for this account' using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_metadata_sync_allowed() from public;
grant execute on function public.enforce_metadata_sync_allowed() to authenticated;

drop trigger if exists enforce_metadata_sync_on_pikos on public.pikos;
create trigger enforce_metadata_sync_on_pikos
  before insert or update or delete on public.pikos
  for each row execute function public.enforce_metadata_sync_allowed();

drop trigger if exists enforce_metadata_sync_on_tofus on public.tofus;
create trigger enforce_metadata_sync_on_tofus
  before insert or update or delete on public.tofus
  for each row execute function public.enforce_metadata_sync_allowed();
