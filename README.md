<p align="center">
  <img src="./public/mochi.png" alt="Mochi Logo" width="300">
</p>

<h1 align="center">Mochi Website</h1>

<p align="center">
  <strong>The home of Mochi.</strong><br>
  Project information, documentation, account access, and the public web portal for Mochi Launcher.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-active%20development-orange?style=flat-square" alt="Active development">
  <img src="https://img.shields.io/badge/hosting-GitHub%20Pages-informational?style=flat-square" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-blue?style=flat-square" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/router-hash%20routing-purple?style=flat-square" alt="Hash routing">
</p>

## Overview

**Mochi Website** is the public website and authenticated companion portal for [Mochi Launcher](https://github.com/T1nkiePlayz/Mochi). It explains the project, documents current launcher behaviour, provides account access, and exposes account-scoped cloud controls.

The desktop launcher is maintained separately. This repository documents the launcher without duplicating its native implementation.

## Current Mochi launcher

The website documentation is kept aligned with the current launcher implementation. Mochi is currently a **Linux-first Tauri desktop game launcher**, with a macOS native layer under development.

The current launcher includes:

- Local-first Piko game library and Tofu environments
- Native game launching
- Linux Flatpak discovery and launching
- Steam game and Steam non-Steam shortcut importing
- Heroic Games Launcher importing
- Lutris importing
- Bottles importing
- itch.io importing
- Manual source/library scanning
- Optional IGDB game identification and metadata
- User confirmation of IGDB matches before metadata is applied
- Account sign-in and account switching, with up to five saved accounts
- Email/password, email sign-in codes, Google, and GitHub authentication
- TOTP authenticator-app MFA and passkeys
- Optional cloud metadata synchronisation
- Local themes and user-imported themes
- Configurable Mochi data location
- In-app notifications and Linux desktop notifications
- Playtime tracking and a system tray menu showing most-played games
- Modrinth discovery for mods, modpacks, resource packs, and shaders
- Modrinth version/loader filtering
- Installation of Modrinth content into Tofu folders
- Installed Modrinth content management, including enable/disable and deletion
- Background Modrinth downloads with progress and recent completion/failure state

Mochi does **not** upload complete game installations as part of normal cloud synchronisation.

## Website responsibilities

The website has four main jobs:

1. **Explain Mochi** — product pages, features, architecture, and project direction.
2. **Document Mochi** — detailed user and developer documentation based on the launcher source.
3. **Provide account access** — sign-in, account settings, security controls, and cloud metadata administration.
4. **Provide project information** — roadmap, changelog, privacy policy, terms, and support information.

## Documentation

The documentation hub covers:

### Getting Started
Installation concepts, first launch, source importing, adding games, IGDB identification, Pikos, Tofus, and launching.

### Library Management
The Piko/Tofu model, categories, source metadata, local storage, machine-specific launch paths, and library organisation.

### Launching Games
Executables, .desktop entries, Flatpak application IDs, shell/Python/JavaScript scripts, source-launcher handoff URIs, platform adapters, and launch errors.

### Integrations & Metadata
IGDB matching, metadata confirmation, artwork, local/provider credentials, Modrinth discovery and downloads, and integration boundaries.

### Account & Security
Email/password, email sign-in codes, Google/GitHub OAuth, TOTP MFA, passkeys, account switching, connected identities, sessions, avatars, and security principles.

### Mochi Cloud
Cloud eligibility, Piko/Tofu records, synchronisation boundaries, ownership, row-level security, pull/push behaviour, and machine-specific data.

### Development
React/TypeScript frontend, Tauri/Rust native layer, platform/source adapters, build commands, themes, data boundaries, and contribution guidance.

### Reference
Terminology, feature-state meanings, important paths, support information, and product principles.

## Authentication and cloud

The website and launcher can use the same Mochi account.

Supported authentication includes:

- Email and password
- Email sign-in codes
- Google
- GitHub
- TOTP authenticator-app MFA
- Passkeys

Mochi Cloud is intentionally metadata-focused. It can synchronise supported Piko and Tofu information, but local installations, arbitrary files, and machine-specific resources remain local.

Provider credentials such as IGDB and Nexus Mods credentials are handled separately from ordinary library metadata. Sensitive provider secrets are stored through the backend credential system rather than committed to the repository.

## Roadmap and changelog

The website includes:

- **Roadmap** — the current direction of Mochi. It is directional and may change.
- **Changelog** — reads published releases directly from the Mochi GitHub repository. When there are no published releases, the page reports that instead of inventing release notes.

The launcher repository is the source of truth for shipped implementation details.

## Legal and privacy pages

Standalone Privacy Policy and Terms of Use pages are stored under:

    public/
    ├── policy/
    │   └── index.html
    └── terms/
        └── index.html

## Design and routing

The website uses the Mochi visual language: dark surfaces, glass-style navigation, purple/cyan accents, rounded cards, responsive layouts, Lucide icons, and reduced-motion support.

The application uses client-side routing with a hash-compatible deployment model for GitHub Pages. Documentation navigation uses explicit scrolling so Back to top and section links do not corrupt the current route.

## Technology stack

| Technology | Purpose |
| --- | --- |
| React | Website UI |
| TypeScript | Type-safe application code |
| Vite | Development and production builds |
| React Router | Client-side navigation |
| Tailwind CSS | Styling |
| Lucide React | Interface icons |
| Supabase client | Authentication and cloud metadata |

## Repository structure

    Mochi-Website/
    ├── public/              # Branding and standalone legal pages
    ├── src/                 # React application
    │   ├── App.tsx
    │   ├── Documentation.tsx
    │   ├── Roadmap.tsx
    │   ├── Changelog.tsx
    │   └── lib/             # Auth, cloud and provider helpers
    ├── supabase/             # Database migrations and edge functions
    ├── .github/workflows/    # GitHub Pages deployment
    ├── package.json
    └── README.md

## Development

    git clone https://github.com/T1nkiePlayz/Mochi-Website.git
    cd Mochi-Website
    npm install
    npm run dev

For a production build:

    npm run build

For static analysis:

    npm run lint

Copy `.env.example` to `.env` and fill in the required build variables:

    VITE_SUPABASE_URL=...
    VITE_SUPABASE_PUBLISHABLE_KEY=...

Never commit real secrets, service-role credentials, provider secrets, or local environment files.

## Hosting and base path

The build uses a relative Vite `base` (`./`) and `import.meta.env.BASE_URL` for in-app links, so the same output works on a GitHub Pages project site (`/Mochi-Website/`) or a custom domain. Authentication redirects are built from `siteUrl()` (origin plus path), and that URL must be in the Supabase redirect allow-list. The standalone `policy/`, `terms/`, and `auth/verify/` pages use relative links for the same reason. React and Supabase are emitted as separate vendor chunks, and the documentation, roadmap, and changelog are lazy-loaded.

## Keeping documentation accurate

When Mochi Launcher changes, update this repository's documentation alongside the launcher.

In particular, check:

- New or removed launch targets
- New game-source integrations
- Piko/Tofu model changes
- Authentication and MFA changes
- Cloud data and permissions
- Provider integrations
- Modrinth functionality
- Theme system changes
- Playtime/download/tray behaviour
- Platform support
- Configuration and storage locations

The website should describe what the launcher **actually does**, not what is merely planned.

## Related project

- Mochi Launcher: https://github.com/T1nkiePlayz/Mochi

## License

The website source is released under the [MIT License](LICENSE).

The Mochi name, logo and artwork (including `public/mochi.png` and the social preview card) are not covered by that license and may not be used to imply an official Mochi site. The Terms of Service and Privacy Policy text are specific to the Mochi service and are not licensed for reuse. The launcher itself is licensed separately under GPL-3.0-or-later.
