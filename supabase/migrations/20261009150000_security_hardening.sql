-- Forward-only hardening for the self-service profile RPC.
-- Keep previously applied migrations immutable; this migration fixes the live function definition.
create or replace function public.update_my_profile(profile_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  avatar_value text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if profile_data ? 'display_name'
     and length(trim(coalesce(profile_data->>'display_name', ''))) > 64 then
    raise exception 'Display name must be 64 characters or fewer' using errcode = '22023';
  end if;

  avatar_value := nullif(trim(profile_data->>'avatar_url'), '');
  if profile_data ? 'avatar_url' and avatar_value is not null and (
    left(lower(avatar_value), 8) <> 'https://'
    or avatar_value ~ '[[:space:]]'
    or substring(avatar_value from '^https://[^/?#]+') is null
  ) then
    raise exception 'Avatar URL must be a valid HTTPS URL' using errcode = '22023';
  end if;

  -- metadata_sync_allowed is administrator-controlled and is intentionally ignored
  -- even if a modified client includes it in the JSON payload.
  update public.profiles
  set display_name = case
        when profile_data ? 'display_name' then nullif(trim(profile_data->>'display_name'), '')
        else display_name
      end,
      avatar_url = case
        when profile_data ? 'avatar_url' then avatar_value
        else avatar_url
      end,
      cloud_sync_enabled = case
        when profile_data ? 'cloud_sync_enabled' then
          coalesce((profile_data->>'cloud_sync_enabled')::boolean, false) and metadata_sync_allowed
        else cloud_sync_enabled and metadata_sync_allowed
      end
  where id = (select auth.uid());
end;
$$;

revoke all on function public.update_my_profile(jsonb) from public, anon, authenticated;
grant execute on function public.update_my_profile(jsonb) to authenticated;
