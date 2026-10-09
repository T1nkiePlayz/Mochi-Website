# Supabase database setup

The website migrations extend the shared Mochi database; they are **not a standalone schema bootstrap**. Apply the launcher repository's prerequisite migrations first, in timestamp order:

1. `T1nkiePlayz/Mochi/supabase/migrations/20261006035100_create_mochi_metadata_schema.sql` — creates `profiles`, `pikos`, `tofus` and their ownership RLS policies.
2. `T1nkiePlayz/Mochi/supabase/migrations/20261008130000_harden_and_reconcile.sql` — reconciles cloud policies and creates the private provider-credential storage objects, including `mochi_private.user_credentials`; it requires Supabase Vault to be available.
3. Apply this repository's migrations in timestamp order, including `20261006120500_website_profile_controls.sql` and `20261008140000_admin_tools_and_account_deletion.sql`.

The launcher repository also owns the `store-provider-credentials` Edge Function. Its implementation and deployed environment must be reviewed alongside these SQL migrations when changing service-key handling. Do not assume that a successful website build proves the database migrations or Edge Function are deployable.

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
