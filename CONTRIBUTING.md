# Contributing to the Mochi website

Thanks for helping! Please read the [Code of Conduct](https://github.com/T1nkiePlayz/Mochi/blob/main/CODE_OF_CONDUCT.md) first. This repository is the public site and
signed-in account portal for the [Mochi launcher](https://github.com/T1nkiePlayz/Mochi). Small, focused changes
are easier to review than large ones.

## Ways to help

- Report broken pages, layout problems on specific devices or browsers, and accessibility issues.
- Fix or improve the documentation and FAQ so they match what the launcher actually does.
- Improve the dashboard (account, security, cloud, admin) and its error messages.
- Review database migrations and security-sensitive changes.

Do **not** use issues for piracy help, and never post secrets, tokens or personal data. Report vulnerabilities
privately by email (see below), not in a public issue.

## Setup

Requirements: Node 20+ and npm.

```bash
git clone https://github.com/T1nkiePlayz/Mochi-Website.git
cd Mochi-Website
npm ci
cp .env.example .env.local   # add your own Supabase project URL and publishable key
npm run dev
```

Only the **publishable** (anon) key belongs in `.env.local`. Never put a `service_role` or secret key in this
repository or in any `VITE_*` variable, because those are sent to every visitor's browser. Without the variables
the site still builds and runs; account features are simply unavailable.

## Before you open a pull request

```bash
npm run lint
npm run build      # type-checks and bundles
```

CI runs the same checks on every pull request. Open the built site (`npm run preview`) and check the pages you changed
at phone width as well as desktop.

## Guidelines

1. Understand the existing implementation before changing it; keep changes focused.
2. Use the words in [`CONTEXT.md`](CONTEXT.md) in the UI and docs (Piko, Tofu, Account, Cloud access, Service key...).
3. The site is hosted under a sub-path on GitHub Pages: link with `import.meta.env.BASE_URL`, never a leading `/`.
4. The browser is not a security boundary. Role, ownership, assurance (AAL2) and confirmation checks belong in
   database functions or Row Level Security; UI checks are only a convenience.
5. Database changes are **new, idempotent files** in `supabase/migrations/`. Never edit a migration that has already
   been applied. Read [`supabase/README.md`](supabase/README.md) first: these migrations extend the launcher's schema.
6. Keep pages accessible: labelled controls, keyboard operation, visible focus, and respect `prefers-reduced-motion`.
7. Keep the bundle lean. Pages and heavy features are lazy-loaded; do not add a dependency for something small.
8. Update the documentation pages and README when behaviour changes, and keep the documentation anchors valid
   (`node scripts/check-doc-anchors.mjs`).
9. Use conventional commit messages (`feat:`, `fix:`, `docs:`, `chore:`).

## Licence

The website source is MIT licensed (see [LICENSE](LICENSE)). By contributing you agree that your contribution is
released under the same licence. The Mochi name, logo and artwork are not covered by it.

## Security

Report vulnerabilities privately to support@ashtontink.com with steps to reproduce. Please do not open a public
issue, and do not test against other people's accounts or data.

## Pull requests

Fill in the template, link the issue, include screenshots for UI changes (desktop and phone width) and list how you
tested. Draft PRs are welcome for early feedback.
