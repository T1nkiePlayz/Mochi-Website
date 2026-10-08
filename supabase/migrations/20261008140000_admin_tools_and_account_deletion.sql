-- Admin tooling, audit log and self-service account deletion.
-- All functions are SECURITY DEFINER, pinned to an empty search_path, and only
-- executable by signed-in users; admin functions additionally verify the JWT role.

create schema if not exists mochi_private;

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
revoke all on public.admin_audit_log from anon, authenticated;

create or replace function mochi_private.assert_admin()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
end $$;

create or replace function mochi_private.log_admin_action(p_action text, p_target uuid, p_details jsonb default '{}')
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admin_audit_log (actor_id, actor_email, action, target_id, target_email, details)
  values (
    (select auth.uid()),
    (select auth.jwt() ->> 'email'),
    p_action,
    p_target,
    (select email from auth.users where id = p_target),
    p_details
  );
end $$;

create or replace function mochi_private.purge_user_secrets(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from vault.secrets
  where id in (select secret_id from mochi_private.user_credentials where user_id = p_user);
end $$;

-- Overview numbers for the admin dashboard.
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

-- Searchable user directory.
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
  limit greatest(least(p_limit, 200), 1) offset greatest(p_offset, 0);
end $$;

create or replace function public.admin_clear_user_cloud(target_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare t bigint; k bigint;
begin
  perform mochi_private.assert_admin();
  delete from public.tofus where piko_id in (select id from public.pikos where user_id = target_user_id);
  get diagnostics t = row_count;
  delete from public.pikos where user_id = target_user_id;
  get diagnostics k = row_count;
  perform mochi_private.log_admin_action('clear_cloud_data', target_user_id, jsonb_build_object('pikos', k, 'tofus', t));
  return jsonb_build_object('deleted_pikos', k, 'deleted_tofus', t);
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
  return query select * from public.admin_audit_log order by id desc limit greatest(least(p_limit, 200), 1);
end $$;

-- Existing admin switches, now with audit logging.
create or replace function public.admin_set_metadata_access(target_user_id uuid, allowed boolean)
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
  update public.profiles set cloud_sync_enabled = enabled, updated_at = now()
  where id = target_user_id returning * into result;
  if result.id is null then raise exception 'Profile not found'; end if;
  perform mochi_private.log_admin_action(case when enabled then 'enable_cloud_sync' else 'disable_cloud_sync' end, target_user_id);
  return result;
end $$;

-- Self-service account deletion. The website asks the user to retype their email first.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid());
begin
  if me is null then raise exception 'Authentication required'; end if;
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
     and (select count(*) from auth.users where raw_app_meta_data ->> 'role' = 'admin') <= 1 then
    raise exception 'You are the only administrator. Promote another administrator before deleting this account.';
  end if;
  perform mochi_private.purge_user_secrets(me);
  delete from auth.users where id = me;
end $$;

-- Lock down execution: signed-in users only.
do $$
declare fn text;
begin
  foreach fn in array array[
    'admin_overview_stats()', 'admin_list_users(text,int,int)', 'admin_clear_user_cloud(uuid)',
    'admin_revoke_sessions(uuid)', 'admin_set_banned(uuid,boolean)', 'admin_delete_user(uuid)',
    'admin_audit_log_list(int)', 'admin_set_metadata_access(uuid,boolean)', 'admin_set_cloud_sync(uuid,boolean)',
    'admin_list_profiles()', 'delete_my_account()'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end $$;
revoke execute on function public.sync_profile_email() from public, anon, authenticated;
