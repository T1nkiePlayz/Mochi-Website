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

## Table of contents

- [Overview](#overview)
- [Purpose](#purpose)
- [What the website does](#what-the-website-does)
- [Public pages](#public-pages)
- [Documentation](#documentation)
- [Authentication and accounts](#authentication-and-accounts)
- [Cloud metadata](#cloud-metadata)
- [Privacy and legal pages](#privacy-and-legal-pages)
- [Design system](#design-system)
- [Routing and GitHub Pages](#routing-and-github-pages)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Development setup](#development-setup)
- [Environment configuration](#environment-configuration)
- [Building and linting](#building-and-linting)
- [Deployment](#deployment)
- [Development principles](#development-principles)
- [Current limitations](#current-limitations)
- [Related project](#related-project)
- [Contributing](#contributing)
- [License](#license)

## Overview

**Mochi Website** is the public-facing website and authenticated web portal for [Mochi Launcher](https://github.com/T1nkiePlayz/Mochi).

It has two main roles:

1. **Public project website** — explains what Mochi is, how it works, and why it is designed the way it is.
2. **Authenticated portal** — provides account access and web-facing controls for Mochi's metadata and account system.

The desktop launcher and website are deliberately kept in separate repositories. Mochi remains the native desktop application, while this repository contains the web experience around it.

## Purpose

The website exists so that a person discovering Mochi can understand the project without first reading the source code.

It provides:

- A detailed project introduction
- Feature explanations
- Launcher concepts
- Getting-started information
- Technical documentation
- Frequently asked questions
- Account access
- Dashboard and account controls
- Project status information
- Privacy information
- Terms of Use

The site also acts as the documentation and information layer surrounding the launcher.

## What the website does

### Explains Mochi

The homepage introduces the launcher, its local-first philosophy, Piko/Tofu model, supported launch concepts, cloud boundaries, and overall architecture.

### Documents the project

The documentation pages provide more detailed explanations for users and developers who want to understand how Mochi behaves internally.

### Provides account access

Authenticated users can sign in to the web portal and access the parts of the account and metadata system exposed by the website.

### Communicates privacy and legal information

The website hosts standalone Privacy Policy and Terms of Use pages so those documents remain directly accessible outside the React application.

## Public pages

The current site includes:

- **Home** — the main introduction to Mochi.
- **Features** — feature-focused explanations.
- **How Mochi Works** — high-level launcher architecture and concepts.
- **Download** — download and release information.
- **Documentation** — detailed user and technical documentation.
- **FAQ** — common questions about Mochi, accounts, cloud sync, Pikos, Tofus, and platforms.
- **Status** — project/service status information.
- **Sign In** — account authentication.
- **Dashboard** — authenticated user portal.
- **Account settings** — account controls.
- **Admin metadata-access panel** — administrative metadata controls.
- **Privacy Policy** — public privacy information.
- **Terms of Use** — public usage and legal terms.

Some sections remain under active development and may change as the launcher develops.

## Documentation

Documentation is organised into four primary sections.

### Getting Started

Covers the path from first launch to adding and launching a game, including:

- Pikos
- Launch targets
- Native file selection
- Flatpak selection
- IGDB matching
- Default Tofus
- Local-first behavior
- Current limitations

### Account Management

Explains:

- Account structure
- Sign-in methods
- Sessions
- Profiles
- Security
- Cloud access
- Account data flow

### Pikos & Tofus

Defines the Mochi data model and explains how a Piko relates to one or more Tofus.

### Cloud Sync

Documents:

- Synchronization principles
- Cloud architecture
- Stored metadata
- Pull behavior
- Push behavior
- Database relationships
- Security boundaries
- Identifiers
- Failure handling
- Conflict considerations

The homepage answers **"What is Mochi?"** while the documentation is intended to answer **"How does Mochi work?"**

## Authentication and accounts

The website provides access to Mochi account functionality.

The current authentication experience includes the configured methods exposed by the application, such as:

- Email and password
- Email magic links
- Google
- GitHub
- Authenticator-app two-factor authentication where enabled
- Passkey authentication where enabled by the current application build

Authentication is intended to let the same Mochi account be used across the web portal and desktop launcher.

Signing in does not upload a user's installed games.

## Cloud metadata

The website participates in Mochi's optional metadata synchronization system.

The cloud model currently contains records for:

- Profiles
- Pikos
- Tofus
- Piko/Tofu relationships
- Other launcher metadata required by the account system

The cloud system is **not a general-purpose game file storage service**.

A Piko may contain a machine-specific launch path. That path can be useful on one computer but invalid on another, so account-owned metadata and local installation resources are intentionally treated as different things.

## Privacy and legal pages

Standalone legal documents live under public/:

    public/
    ├── policy/
    │   └── index.html
    └── terms/
        └── index.html

The Privacy Policy explains information collection, account information, cloud metadata, third-party services, storage, security, retention, access/correction, and related privacy topics.

The Terms of Use cover acceptable use, user responsibilities, third-party content, intellectual property, cloud features, service changes, disclaimers, and restrictions including misuse of the launcher for unlawful content.

These documents are intended to evolve with the project and should be reviewed as the service, business structure, and applicable obligations change.

## Design system

The website follows the Mochi visual identity rather than presenting itself as a generic software dashboard.

The current design direction includes:

- Dark high-contrast surfaces
- Soft glass-style navigation
- Mint/green Mochi accents
- Purple secondary accents
- Rounded cards
- Lucide icons
- Responsive layouts
- Subtle animated background elements
- Reduced-motion support
- Structured documentation navigation

The homepage is intentionally detailed so a first-time visitor can understand the project before moving into the deeper documentation.

## Routing and GitHub Pages

The application is designed for static hosting and uses hash-based client-side routing for compatibility with GitHub Pages.

This avoids depending on server-side route rewriting that static hosting does not provide in the same way as a traditional application server.

Standalone pages under public/policy/ and public/terms/ are served as normal static paths.

Documentation in-page navigation uses explicit scrolling behavior rather than relying on router-conflicting hash navigation. This prevents actions such as Back to top from accidentally changing the application route and rendering an empty page.

## Technology stack

| Technology | Purpose |
| --- | --- |
| React 19 | Website UI |
| TypeScript | Type-safe application code |
| Vite | Development server and production build |
| React Router | Client-side navigation |
| Tailwind CSS 4 | Utility styling and build integration |
| Lucide React | Interface icons |
| Supabase client | Account and cloud metadata integration |

## Repository structure

    Mochi-Website/
    ├── public/
    │   ├── mochi.png         # Branding asset
    │   ├── policy/           # Privacy Policy
    │   └── terms/            # Terms of Use
    │
    ├── src/
    │   ├── App.tsx           # Main application and routes
    │   ├── Documentation.tsx # Documentation pages
    │   ├── components/       # Reusable UI components
    │   └── lib/              # Authentication/cloud helpers
    │
    ├── supabase/             # Backend/database definitions
    ├── index.html             # Vite entry point
    ├── package.json           # Scripts and dependencies
    ├── vite.config.ts
    └── README.md

## Development setup

### Clone

    git clone https://github.com/T1nkiePlayz/Mochi-Website.git
    cd Mochi-Website

### Install dependencies

    npm install

### Configure environment

    cp .env.example .env

Fill in the development values required by the project. Never commit real secrets.

### Start development

    npm run dev

For network-accessible development, the project's current workflow can also use:

    npm run dev -- --host 0.0.0.0 --port 4173

## Environment configuration

The website uses build-time environment configuration for its backend integration.

Keep local configuration in .env and use .env.example as the public template.

The public site intentionally avoids exposing sensitive backend configuration. Authentication and cloud implementation details are kept in the application code and environment rather than embedded into public copy unnecessarily.

## Building and linting

### Production build

    npm run build

This runs TypeScript compilation and creates the Vite production output.

### Lint

    npm run lint

The project uses Oxlint for static code-quality checks.

### Preview

    npm run preview

Previewing the production build is useful for checking routes, assets, documentation navigation, and static pages before deployment.

## Deployment

The website is designed to remain GitHub Pages friendly.

Before deploying, verify:

1. The production build completes.
2. The homepage loads correctly.
3. Client-side navigation works.
4. Documentation cards open the correct sections.
5. Documentation in-page navigation scrolls correctly.
6. Back to top does not alter the route unexpectedly.
7. The Privacy Policy loads directly.
8. The Terms of Use loads directly.
9. Static images resolve from the deployed base path.
10. Authentication redirects return to the correct site location.

## Development principles

When changing the website:

- Keep the homepage understandable to someone who has never used Mochi.
- Keep detailed technical behavior in documentation.
- Preserve the local-first message.
- Never imply that complete game installations are stored in cloud metadata.
- Keep privacy and legal pages directly accessible.
- Preserve responsive layouts.
- Respect reduced-motion preferences.
- Test navigation after changing router or documentation code.
- Keep public copy consistent with actual launcher behavior.
- Avoid exposing unnecessary implementation details in user-facing copy.
- Update this README when major architecture or user-facing behavior changes.

## Current limitations

The website is evolving alongside Mochi Launcher.

Current limitations include:

- Some pages and features remain under development.
- The desktop launcher is not yet a stable release.
- Cloud metadata behavior may evolve as the data model matures.
- Documentation can temporarily lag behind implementation during rapid development.
- GitHub Pages imposes static-hosting constraints on routing.
- Account functionality depends on the configured backend environment.

## Related project

The desktop launcher is maintained separately:

- Mochi Launcher: https://github.com/T1nkiePlayz/Mochi

The two repositories share the Mochi concepts and account/cloud model but can be developed and deployed independently.

## Contributing

Mochi Website is under active development.

For changes:

1. Understand the existing component and route structure.
2. Keep changes focused.
3. Run the production build before committing.
4. Check both navigation and direct static paths.
5. Check responsive layouts when changing shared components.
6. Test documentation anchors and scrolling after documentation changes.
7. Keep public wording aligned with the actual launcher.
8. Never commit secrets or private environment files.

## License

No final open-source license is currently declared for the website repository. Until a license is explicitly added, the source should not be assumed to be freely reusable, redistributed, or relicensed.

License information will be added as the project approaches a first public release.
