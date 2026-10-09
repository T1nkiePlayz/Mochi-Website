-- Forward-only security hardening. Earlier migrations stay untouched because they are already applied.
--
-- Not included on purpose: public.update_my_profile(jsonb). The live function (launcher migration
-- 20261008130000_harden_and_reconcile) returns public.profiles, runs as SECURITY INVOKER and is already
-- protected by the protect_profile_columns trigger, which stops non-admins from changing
-- metadata_sync_allowed and from enabling cloud sync without access. Re-creating it here as
-- `returns void` would fail (a function's return type cannot be changed) and would weaken it to SECURITY DEFINER.

-- 1. Cloud sync may only be on while cloud access is granted, enforced as a constraint as well as by the trigger.
update public.profiles set cloud_sync_enabled = false where cloud_sync_enabled and not metadata_sync_allowed;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_cloud_sync_requires_access' and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles add constraint profiles_cloud_sync_requires_access
      check (not cloud_sync_enabled or metadata_sync_allowed) not valid;
  end if;
end $$;
alter table public.profiles validate constraint profiles_cloud_sync_requires_access;

-- 2. Administrator actions need the admin role AND a multi-factor (AAL2) session.
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

create or replace function public.admin_list_profiles()
returns setof public.profiles language plpgsql security definer set search_path = '' as $$
begin
  perform mochi_private.assert_admin();
  return query select p.* from public.profiles p;
end $$;

-- Say why instead of silently ignoring the request (the protect_profile_columns trigger would otherwise just reset it).
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

-- 3. Account deletion: the caller must retype their email, have signed in recently, and (when a second factor
-- is set up) hold an AAL2 session. Supabase access tokens have no `auth_time` claim, so "recently" is read from
-- the newest entry of the `amr` claim, which records when each sign-in method was last used in this session.
drop function if exists public.delete_my_account();
create or replace function public.delete_my_account(confirmation_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  actual_email text;
  last_auth bigint;
begin
  if me is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select lower(email) into actual_email from auth.users where id = me;
  if actual_email is null or lower(trim(coalesce(confirmation_email, ''))) <> actual_email then
    raise exception 'The confirmation email does not match this account' using errcode = '22023';
  end if;

  select max((entry ->> 'timestamp')::bigint) into last_auth
  from jsonb_array_elements(coalesce((select auth.jwt() -> 'amr'), '[]'::jsonb)) as entry
  where (entry ->> 'timestamp') ~ '^[0-9]+$';
  if last_auth is null or last_auth < extract(epoch from now() - interval '10 minutes')::bigint then
    raise exception 'For your security, sign out and sign in again before deleting your account' using errcode = '42501';
  end if;

  if (
    exists (select 1 from auth.mfa_factors where user_id = me and status = 'verified')
    or exists (select 1 from auth.webauthn_credentials where user_id = me)
  ) and coalesce((select auth.jwt() ->> 'aal'), '') <> 'aal2' then
    raise exception 'Verify your second factor before deleting your account' using errcode = '42501';
  end if;

  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
     and (select count(*) from auth.users where raw_app_meta_data ->> 'role' = 'admin') <= 1 then
    raise exception 'You are the only administrator. Promote another administrator before deleting this account.';
  end if;

  perform mochi_private.purge_user_secrets(me);
  delete from auth.users where id = me;
end $$;
revoke execute on function public.delete_my_account(text) from public, anon;
grant execute on function public.delete_my_account(text) to authenticated;

-- 4. Retention for the admin audit log: a manual, admin-only cleanup (30 to 730 days, default 365).
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
revoke execute on function public.admin_purge_audit_log(integer) from public, anon;
grant execute on function public.admin_purge_audit_log(integer) to authenticated;
