-- Admin tooling, audit log and self-service account deletion.
-- Sensitive admin RPCs require the trusted JWT role and verified AAL2 assurance.

create schema if not exists mochi_private;
revoke all on schema mochi_private from public, anon, authenticated;

-- Repair legacy inconsistent state before enforcing cloud eligibility.
update public.profiles set cloud_sync_enabled = false where not metadata_sync_allowed;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_cloud_sync_requires_access'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_cloud_sync_requires_access
      check (not cloud_sync_enabled or metadata_sync_allowed) not valid;
  end if;
end $$;
alter table public.profiles validate constraint profiles_cloud_sync_requires_access;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  actor_email text,
  action text not null,
  target_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from public, anon, authenticated;

create or replace function mochi_private.assert_admin()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if coalesce((select auth.jwt() ->> 'aal'), '') <> 'aal2' then
    raise exception 'Administrator actions require multi-factor authentication (AAL2)' using errcode = '42501';
  end if;
end $$;

create or replace function mochi_private.log_admin_action(p_action text, p_target uuid, p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admin_audit_log (actor_id, actor_email, action, target_id, target_email, details)
  values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    p_action,
    p_target,
    (select email from auth.users where id = p_target),
    coalesce(p_details, '{}'::jsonb)
  );
end $$;

create or replace function mochi_private.purge_user_secrets(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from vault.secrets
  where id in (select secret_id from mochi_private.user_credentials where user_id = p_user);
  delete from mochi_private.user_credentials where user_id = p_user;
end $$;

create or replace function public.admin_overview_stats()
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  return jsonb_build_object(
    'users', (select count(*) from auth.users),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active_7d', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'cloud_access', (select count(*) from public.profiles where metadata_sync_allowed),
    'cloud_sync', (select count(*) from public.profiles where cloud_sync_enabled),
    'admins', (select count(*) from auth.users where raw_app_meta_data ->> 'role' = 'admin'),
    'banned', (select count(*) from auth.users where banned_until is not null and banned_until > now()),
    'pikos', (select count(*) from public.pikos),
    'tofus', (select count(*) from public.tofus)
  );
end $$;

create or replace function public.admin_list_users(p_search text default '', p_limit int default 50, p_offset int default 0)
returns table (
  id uuid, email text, display_name text, avatar_url text,
  created_at timestamptz, last_sign_in_at timestamptz, email_confirmed boolean,
  providers text[], authenticator_count int, passkey_count int,
  metadata_sync_allowed boolean, cloud_sync_enabled boolean,
  is_admin boolean, banned boolean, piko_count bigint, tofu_count bigint, total_count bigint
) language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  return query
  with matched as (
    select u.id, u.email::text as email, u.created_at, u.last_sign_in_at, u.email_confirmed_at,
           u.raw_app_meta_data, u.banned_until, p.display_name, p.avatar_url,
           coalesce(p.metadata_sync_allowed, false) as access, coalesce(p.cloud_sync_enabled, false) as sync
    from auth.users u
    left join public.profiles p on p.id = u.id
    where coalesce(p_search, '') = ''
       or u.email ilike '%' || p_search || '%'
       or p.display_name ilike '%' || p_search || '%'
       or u.id::text = trim(p_search)
  )
  select m.id, m.email, m.display_name, m.avatar_url, m.created_at, m.last_sign_in_at,
         m.email_confirmed_at is not null,
         coalesce((select array_agg(distinct i.provider) from auth.identities i where i.user_id = m.id), '{}'::text[]),
         (select count(*)::int from auth.mfa_factors f where f.user_id = m.id and f.status = 'verified'),
         (select count(*)::int from auth.webauthn_credentials w where w.user_id = m.id),
         m.access, m.sync,
         coalesce(m.raw_app_meta_data ->> 'role', '') = 'admin',
         m.banned_until is not null and m.banned_until > now(),
         (select count(*) from public.pikos k where k.user_id = m.id),
         (select count(*) from public.tofus t join public.pikos k on k.id = t.piko_id where k.user_id = m.id),
         count(*) over ()
  from matched m
  order by m.created_at desc
  limit greatest(least(coalesce(p_limit, 50), 200), 1)
  offset greatest(coalesce(p_offset, 0), 0);
end $$;

create or replace function public.admin_clear_user_cloud(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  deleted_tofus bigint;
  deleted_pikos bigint;
begin
  perform mochi_private.assert_admin();
  delete from public.tofus where piko_id in (select id from public.pikos where user_id = target_user_id);
  get diagnostics deleted_tofus = row_count;
  delete from public.pikos where user_id = target_user_id;
  get diagnostics deleted_pikos = row_count;
  perform mochi_private.log_admin_action('clear_cloud_data', target_user_id, jsonb_build_object('pikos', deleted_pikos, 'tofus', deleted_tofus));
  return jsonb_build_object('deleted_pikos', deleted_pikos, 'deleted_tofus', deleted_tofus);
end $$;

create or replace function public.admin_revoke_sessions(target_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  delete from auth.sessions where user_id = target_user_id;
  perform mochi_private.log_admin_action('revoke_sessions', target_user_id);
end $$;

create or replace function public.admin_set_banned(target_user_id uuid, banned boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  if target_user_id = (select auth.uid()) then
    raise exception 'You cannot suspend your own account';
  end if;
  update auth.users set banned_until = case when banned then 'infinity'::timestamptz else null end where id = target_user_id;
  if banned then delete from auth.sessions where user_id = target_user_id; end if;
  perform mochi_private.log_admin_action(case when banned then 'suspend' else 'unsuspend' end, target_user_id);
end $$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  if target_user_id = (select auth.uid()) then
    raise exception 'Use "Delete my account" in your own settings to delete your account';
  end if;
  perform mochi_private.log_admin_action('delete_user', target_user_id);
  perform mochi_private.purge_user_secrets(target_user_id);
  delete from auth.users where id = target_user_id;
end $$;

create or replace function public.admin_audit_log_list(p_limit int default 50)
returns setof public.admin_audit_log
language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  return query select * from public.admin_audit_log order by id desc limit greatest(least(coalesce(p_limit, 50), 200), 1);
end $$;

-- Drop before recreating because PostgreSQL cannot replace a function's return type.
drop function if exists public.admin_set_metadata_access(uuid, boolean);
create function public.admin_set_metadata_access(target_user_id uuid, allowed boolean)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare result public.profiles;
begin
  perform mochi_private.assert_admin();
  update public.profiles
  set metadata_sync_allowed = allowed,
      cloud_sync_enabled = case when allowed then cloud_sync_enabled else false end,
      updated_at = now()
  where id = target_user_id
  returning * into result;
  if result.id is null then raise exception 'Profile not found'; end if;
  perform mochi_private.log_admin_action(case when allowed then 'grant_cloud_access' else 'revoke_cloud_access' end, target_user_id);
  return result;
end $$;

create or replace function public.admin_set_cloud_sync(target_user_id uuid, enabled boolean)
returns public.profiles language plpgsql security definer set search_path = '' as $$
declare result public.profiles;
begin
  perform mochi_private.assert_admin();
  if enabled and not exists (select 1 from public.profiles where id = target_user_id and metadata_sync_allowed) then
    raise exception 'Cloud access must be granted before cloud sync can be enabled' using errcode = '23514';
  end if;
  update public.profiles set cloud_sync_enabled = enabled, updated_at = now()
  where id = target_user_id returning * into result;
  if result.id is null then raise exception 'Profile not found'; end if;
  perform mochi_private.log_admin_action(case when enabled then 'enable_cloud_sync' else 'disable_cloud_sync' end, target_user_id);
  return result;
end $$;

create or replace function public.delete_my_account(confirmation_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  auth_time text := (select auth.jwt() ->> 'auth_time');
  actual_email text;
begin
  if me is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select lower(email) into actual_email from auth.users where id = me;
  if actual_email is null or lower(trim(coalesce(confirmation_email, ''))) <> actual_email then
    raise exception 'The confirmation email does not match this account' using errcode = '22023';
  end if;

  if coalesce(auth_time, '') = ''
     or auth_time ~ '[^0-9]'
     or auth_time::bigint < extract(epoch from now() - interval '10 minutes')::bigint then
    raise exception 'For your security, sign in again before deleting your account' using errcode = '42501';
  end if;

  if (
    exists (select 1 from auth.mfa_factors where user_id = me and status = 'verified')
    or exists (select 1 from auth.webauthn_credentials where user_id = me)
  ) and coalesce((select auth.jwt() ->> 'aal'), '') <> 'aal2' then
    raise exception 'Verify your security factor before deleting your account' using errcode = '42501';
  end if;

  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
     and (select count(*) from auth.users where raw_app_meta_data ->> 'role' = 'admin') <= 1 then
    raise exception 'You are the only administrator. Promote another administrator before deleting this account.';
  end if;

  perform mochi_private.purge_user_secrets(me);
  delete from auth.users where id = me;
end $$;

-- Lock down execution of public RPCs. The legacy profile list is hardened below.
do $$
declare fn text;
begin
  foreach fn in array array[
    'admin_overview_stats()', 'admin_list_users(text,int,int)', 'admin_clear_user_cloud(uuid)',
    'admin_revoke_sessions(uuid)', 'admin_set_banned(uuid,boolean)', 'admin_delete_user(uuid)',
    'admin_audit_log_list(int)', 'admin_set_metadata_access(uuid,boolean)', 'admin_set_cloud_sync(uuid,boolean)',
    'admin_list_profiles()', 'delete_my_account(text)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end $$;

create or replace function public.admin_list_profiles()
returns setof public.profiles language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  return query select p.* from public.profiles p;
end $$;

-- Private helpers are callable by the owning SECURITY DEFINER functions only.
revoke all on function mochi_private.assert_admin() from public, anon, authenticated;
revoke all on function mochi_private.log_admin_action(text, uuid, jsonb) from public, anon, authenticated;
revoke all on function mochi_private.purge_user_secrets(uuid) from public, anon, authenticated;

-- These optional legacy helpers are not defined in this repository. Revoke only if present.
do $$
begin
  if to_regprocedure('public.sync_profile_email()') is not null then
    execute 'revoke execute on function public.sync_profile_email() from public, anon, authenticated';
  end if;
  if to_regprocedure('public.touch_updated_at()') is not null then
    execute 'revoke execute on function public.touch_updated_at() from public, anon, authenticated';
  end if;
end $$;

revoke all on public.admin_audit_log from public, anon, authenticated;

-- Controlled manual cleanup; default retention is 365 days, bounded to 30-730 days.
create or replace function public.admin_purge_audit_log(p_retention_days integer default 365)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  removed bigint;
  retention_days integer := greatest(30, least(coalesce(p_retention_days, 365), 730));
begin
  perform mochi_private.assert_admin();
  delete from public.admin_audit_log where created_at < now() - make_interval(days => retention_days);
  get diagnostics removed = row_count;
  perform mochi_private.log_admin_action('purge_audit_log', null, jsonb_build_object('retention_days', retention_days, 'removed', removed));
  return removed;
end $$;
revoke all on function public.admin_purge_audit_log(integer) from public, anon;
grant execute on function public.admin_purge_audit_log(integer) to authenticated;
