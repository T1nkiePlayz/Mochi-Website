# Supabase database setup

The website migrations extend the shared Mochi database; they are **not a standalone schema bootstrap**. Apply the launcher repository's prerequisite migrations first, in timestamp order:

1. `T1nkiePlayz/Mochi/supabase/migrations/20261006035100_create_mochi_metadata_schema.sql` — creates `profiles`, `pikos`, `tofus` and their ownership RLS policies.
2. `T1nkiePlayz/Mochi/supabase/migrations/20261008130000_harden_and_reconcile.sql` — reconciles cloud policies and creates the private provider-credential storage objects, including `mochi_private.user_credentials`; it requires Supabase Vault to be available.
3. Apply this repository's migrations in timestamp order, including `20261006120500_website_profile_controls.sql`, `20261008140000_admin_tools_and_account_deletion.sql`, and `20261009150000_security_hardening.sql`.

The launcher repository also owns the `store-provider-credentials` Edge Function. Its implementation and deployed environment must be reviewed alongside these SQL migrations when changing service-key handling. Do not assume that a successful website build proves the database migrations or Edge Function are deployable.

## Notes on `20261009150000_security_hardening.sql`

- It is forward-only: migrations that were already applied (such as `20261008140000`) are never edited, because editing them changes nothing on a database that has run them.
- It does not redefine `update_my_profile(jsonb)`. The launcher migration `20261008130000_harden_and_reconcile.sql` owns that function (it returns `public.profiles`, runs as SECURITY INVOKER, and relies on the `protect_profile_columns` trigger so users cannot grant themselves cloud access). A `returns void` redefinition would fail because a function's return type cannot change.
- Administrator RPCs now require an AAL2 session, so an administrator must have an authenticator app or passkey set up.
- `delete_my_account(confirmation_email text)` replaces the no-argument version. It checks the retyped email, a sign-in within the last 10 minutes (read from the `amr` claim; Supabase access tokens have no `auth_time`), and AAL2 when a second factor exists.

## Deployment checks

- Apply the complete migration chain to a fresh local Supabase instance before deployment.
- Verify the effective grants on `mochi_private` and its helper functions in the target database.
- Test Piko and Tofu select/insert/update/delete as two ordinary accounts, including attempts to move a Tofu to another user's Piko.
- Test admin RPCs with a non-admin, an admin at AAL1, and an admin at AAL2.
- Test account deletion with a mismatched confirmation email, stale authentication, provider credentials, cloud records, and active sessions.
- Confirm Vault secrets and credential references are removed after credential deletion and account deletion.
- Configure Supabase Auth rate limits and CAPTCHA/bot protection for public signup, email-code, and password-reset flows.

## Security boundaries

The browser UI is not an authorization boundary. Role checks, AAL2 checks, ownership checks, confirmation checks, and destructive-action safeguards must be enforced by database functions or trusted server-side code. The website's cloud-access trigger supplements—but does not replace—the Piko/Tofu row-level security policies.
