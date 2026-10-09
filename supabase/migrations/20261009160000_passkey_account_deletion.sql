-- Passkey-only accounts could never delete themselves: a passkey sign-in is its own session and Supabase never raises it
-- to AAL2, yet delete_my_account demanded AAL2 whenever a passkey existed. Require AAL2 only when an authenticator app
-- (a verified MFA factor) exists. The retyped email and the "signed in within 10 minutes" check still apply to everyone.
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

  if exists (select 1 from auth.mfa_factors where user_id = me and status = 'verified')
     and coalesce((select auth.jwt() ->> 'aal'), '') <> 'aal2' then
    raise exception 'Verify your authenticator code before deleting your account' using errcode = '42501';
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
