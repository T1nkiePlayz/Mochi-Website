-- Harden profile updates at the database boundary. Keep the existing void signature so
-- this migration is safe to apply after the website profile-controls migration.
create or replace function public.update_my_profile(profile_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := (select auth.uid());
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- Cloud access is administrator-controlled. Ignore this field entirely when
  -- processing self-service profile updates; callers cannot grant themselves access.
  update public.profiles
  set display_name = case when profile_data ? 'display_name'
                          then nullif(trim(profile_data->>'display_name'), '')
                          else display_name end,
      avatar_url = case when profile_data ? 'avatar_url'
                        then nullif(trim(profile_data->>'avatar_url'), '')
                        else avatar_url end,
      cloud_sync_enabled = case when profile_data ? 'cloud_sync_enabled'
                                then coalesce((profile_data->>'cloud_sync_enabled')::boolean, cloud_sync_enabled)
                                else cloud_sync_enabled end
  where id = caller_id;
end;
$$;

revoke all on function public.update_my_profile(jsonb) from public;
grant execute on function public.update_my_profile(jsonb) to authenticated;
