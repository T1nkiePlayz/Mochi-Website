# Mochi Web

Mochi Web is the public-facing website and authenticated portal for Mochi, a flexible game launcher designed around local-first gaming and cloud metadata sync.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase

## Quick start

```bash
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 4173
```

Add your Supabase project settings to `.env` before enabling OAuth and account flows:

```dotenv
VITE_SUPABASE_URL=https://mwioatqxudhvzzkyomcs.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Only the publishable/anon key belongs in this file. Never put a `service_role` key in
the browser bundle. Apply
`supabase/migrations/20261006120500_website_profile_controls.sql` to project
`mwioatqxudhvzzkyomcs` using the Supabase CLI or dashboard SQL editor. The migration
adds restrictive profile controls and SECURITY DEFINER RPCs for user profile updates
and admin-only metadata access changes. Promote the first administrator by setting
`public.profiles.is_admin = true` in a trusted SQL session; do not expose that
operation through the client.

## Included pages

- Home
- Features
- How Mochi Works
- Download
- Documentation
- FAQ
- Status
- Sign In
- Dashboard
- Account settings
- Admin metadata-access panel

## Notes

The site is intentionally designed to be GitHub Pages friendly and uses a hash router for static hosting compatibility. Cloud sync messaging stays local-first and clarifies that large game files remain on the user’s device while metadata is synchronized.
