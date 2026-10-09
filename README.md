# Mochi Website

The public site and signed-in account portal for the [Mochi launcher](https://github.com/T1nkiePlayz/Mochi). It explains Mochi, hosts the documentation, FAQ, roadmap and changelog, and lets an **Account** manage sign-in methods, **Cloud sync** and **Service keys**. The launcher supports Linux and macOS, not Windows. The launcher itself lives in its own repository.

Terminology (Piko, Tofu, Account, Cloud access, Service key, Administrator...) is defined in [`CONTEXT.md`](CONTEXT.md). Use those words in UI copy and docs.

## Stack

- React 19, TypeScript, React Router (`HashRouter`)
- Vite with Tailwind CSS 4, `lucide-react` icons
- Supabase (`@supabase/supabase-js`) for auth and data
- Lint with oxlint
- Hosted on GitHub Pages

## Setup

Requires Node 20+ and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The publishable (anon) key, safe for browsers |

Never put a `service_role` or other secret key in `.env.local` or any `VITE_*` variable; those ship to every visitor. Without the variables the site still builds, but account features are unavailable.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` then `vite build` into `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the built site |
| `npm test` | Doc anchor check, lint, then build (same checks as CI) |

## Routes

Routing is hash-based (`/#/...`). Defined in `src/App.tsx`:

- `/` home, `/features`, `/how-it-works`, `/download`, `/roadmap`, `/changelog`, `/faq`
- `/documentation` and `/documentation/:section`
- `/signin`, `/auth/verify` (email verification)
- `/dashboard`, `/settings`, `/admin`: all render the dashboard behind an access gate
- Anything else shows a not-found page

Static pages `public/policy/` and `public/terms/`, plus `public/auth/verify`, are served as-is.

## Dashboard

Code in `src/dashboard/`. Tabs:

- **Overview**: account summary.
- **Account**: profile and display details, account deletion.
- **Security**: **Sign-in methods**, **Linked accounts** (Google, GitHub), **Authenticator app**, **Passkeys**.
- **Cloud**: **Cloud sync** toggle (needs **Cloud access**) and **Service keys**.
- **Admin**: shown only to an **Administrator**; grants Cloud access and manages others' Cloud sync.

The browser is not an authorization boundary. Role, ownership, AAL2 and confirmation checks are enforced in database functions and RLS.

## Supabase

The website migrations extend the shared Mochi database and are not a standalone schema. Follow [`supabase/README.md`](supabase/README.md), which lists the launcher repository's prerequisite migrations that must be applied first. Then apply, in timestamp order:

1. `20261006120500_website_profile_controls.sql`
2. `20261008140000_admin_tools_and_account_deletion.sql`
3. `20261009150000_security_hardening.sql`

Migrations are forward-only: add new idempotent files, never edit applied ones.

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `main` (and manually): `npm ci`, lint, build, then publishes `dist/` to GitHub Pages. The Supabase URL and publishable key come from the repository secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. `.github/workflows/ci.yml` runs the anchor check, lint and build on pull requests and `main`.

- **Sub-path base**: `vite.config.ts` uses `base: './'`, so the same build works under a project sub-path (`/Mochi-Website/`) or a custom domain. Link with `import.meta.env.BASE_URL`, never a leading `/`.
- **Redirects**: auth redirects use the current origin plus pathname (`siteUrl()` in `src/lib/supabase.tsx`). Every deployed URL, including the custom domain `mochi.ashtontink.com` and the sub-path URL, must be in the Supabase Auth redirect allow-list, or sign-in and email links will fail.
- The custom domain itself is configured in GitHub Pages settings; no `CNAME` file is committed.

## Documentation maintenance

Headings in `src/Documentation.tsx` are listed in a registry that must match the article sections. Run `node scripts/check-doc-anchors.mjs` (also part of `npm test`) after editing docs. Keep docs in line with launcher behaviour.

## Contributing and licence

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines, the PR process and security reporting. The source is [MIT](LICENSE) licensed; the Mochi name, logo and artwork are not covered by it.
