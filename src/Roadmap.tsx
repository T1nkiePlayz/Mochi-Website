import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Cloud,
  Code2,
  Gamepad2,
  Globe2,
  Lock,
  Rocket,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const phases = [
  {
    title: 'Built so far',
    status: 'In early development',
    tone: 'emerald',
    description: 'Mochi is at version 0.1.0 and has no stable release yet. These parts exist in the project today, but storage formats and the interface may still change.',
    items: [
      ['Library and launching', 'Pikos and their Tofus, imports from Steam, Heroic, itch.io, Flatpak, Lutris, Bottles, Legendary/Rare and Nile (Linux) and more, launch handoff, process tracking, a keyboard-first library grid, and find missing covers.'],
      ['Big Picture and Steam Deck', 'Controller-first fullscreen mode with display options, power actions and interface sounds, 11 built-in themes, interface sound packs, bundled fonts, and accessibility options.'],
      ['Metadata, playtime and achievements', 'IGDB, SteamGridDB and Steam Store metadata, playtime and stats, 77 Mochi achievements, and Steam achievements.'],
      ['Discover and mods', 'Modrinth, CurseForge and Nexus Mods discovery with per-Tofu mod management, required-dependency prompts, an offline conflict check, pre-update snapshots with one-click restore, an Update all review, and .mochipack modpack export and import.'],
      ['Minecraft instances', 'One Minecraft Piko with each launcher instance as a Tofu, optional copy on import, and modpack matching against Modrinth and CurseForge.'],
      ['Launch options and shortcuts', 'Per-game environment, arguments and Proton/Wine, GameMode, MangoHud and gamescope with a live command preview and switchable launch profiles; a Linux Wine/Proton prefix manager; copy debug info, quick-exit launch hints and crash suspect mods; desktop shortcuts and Add to Steam; mochi launch/open/list commands and links.'],
      ['Library tools', 'Backlog statuses, a wishlist, Next up and a What should I play? picker that uses IGDB time-to-beat, saved filters, duplicate merging, a Ctrl/Cmd+K command palette with actions, per-game notes and links in a redesigned Edit game window, ProtonDB badges on Linux, game themes, a year-in-review summary, and a collapsed section for Steam soundtracks and extras.'],
      ['Saves, storage and backups', 'Zip backups of game saves with restore and automatic backup on exit, a Storage disk usage manager with a Clear all unused data action, a settings export/import zip, a .mochibackup library backup with optional automatic copies, and download pause, speed limit and allowed hours.'],
      ['News, deals and sharing', 'Opt-in game news and an optional Deals tab (both off by default), a stats share card, and game search from the command palette. Plugins are the only feature still under Settings > Experimental, off by default.'],
      ['Security and updates', 'Verified downloads (checksums, GPG, build attestation), updates verified before the installed copy is replaced, and transactional, hardened archive extraction, and symlink-safe export temp files.'],
      ['Accounts and optional cloud sync', 'Sign-in with email, Google or GitHub, passkeys, authenticator-app MFA, optional metadata-only sync, and optional cloud saving of Mochi achievements with a clear button, plus fixes for setup credentials, game logs and artwork visibility.'],
      ['Linux and macOS builds', 'AppImage, deb, rpm and an Arch PKGBUILD on Linux; a universal DMG on macOS. Linux is the primary, best-tested platform.'],
    ],
  },
  {
    title: 'Recent and upcoming',
    status: 'In progress',
    tone: 'violet',
    description: 'Work that is under way and not yet part of a release.',
    items: [
      ['Newest merged work', 'Recently merged features may not be in a packaged download yet; Mochi is still at version 0.1.0.'],
      ['Ongoing polish', 'Continued work on layout, theming, Big Picture options, and everyday library usability.'],
    ],
  },
  {
    title: 'Planned',
    status: 'Planned',
    tone: 'cyan',
    description: 'Items the project lists as not done yet. No dates are promised.',
    items: [
      ['Signed and notarized macOS builds', 'macOS builds are currently only ad-hoc signed, so Gatekeeper blocks the first launch. Notarization needs an Apple Developer account.'],
      ['Theme gallery and creator', 'An in-app gallery for community themes and a live theme creator are listed in the project README as not done yet.'],
      ['Stable release', 'A first stable release, once the early-development caveats are behind us.'],
    ],
  },
]

const toneClasses: Record<string, string> = {
  emerald: 'border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-300',
  violet: 'border-violet-400/20 bg-violet-500/[0.06] text-violet-300',
  cyan: 'border-cyan-400/20 bg-cyan-500/[0.06] text-cyan-300',
  slate: 'border-white/10 bg-white/[0.03] text-slate-300',
}

export function RoadmapPage() {
  return (
    <div className="space-y-12 pb-10">
      <header className="max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
          <Rocket className="h-3.5 w-3.5" /> Project roadmap
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Where Mochi is going.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Mochi is in early development (version 0.1.0, no stable release yet). This page separates what already exists from what is still planned. It is directional rather than a promise of exact release dates.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5"><Gamepad2 className="h-5 w-5 text-violet-300" /><p className="mt-4 text-sm font-semibold text-white">Now</p><p className="mt-1 text-sm leading-6 text-slate-400">Linux and macOS builds are available while Mochi is still in early development.</p></div>
        <div className="glass-card p-5"><Cloud className="h-5 w-5 text-cyan-300" /><p className="mt-4 text-sm font-semibold text-white">In progress</p><p className="mt-1 text-sm leading-6 text-slate-400">Newest merged work reaching packaged builds, plus ongoing polish.</p></div>
        <div className="glass-card p-5"><Code2 className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-sm font-semibold text-white">Planned</p><p className="mt-1 text-sm leading-6 text-slate-400">Notarized macOS builds and a stable release. Windows is not supported.</p></div>
      </section>

      <div className="relative space-y-5">
        <div className="absolute bottom-8 left-[19px] top-8 hidden w-px bg-gradient-to-b from-violet-400/40 via-cyan-400/20 to-transparent sm:block" />
        {phases.map((phase, index) => (
          <article key={phase.title} className="relative grid gap-5 sm:grid-cols-[40px_1fr]">
            <div className="relative z-10 mt-6 hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950 sm:flex">
              {index === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : index === 1 ? <CircleDot className="h-5 w-5 text-violet-300" /> : <Sparkles className="h-5 w-5 text-cyan-300" />}
            </div>
            <div className="glass-card overflow-hidden p-6 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phase {String(index + 1).padStart(2, '0')}</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{phase.title}</h2>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[phase.tone]}`}>{phase.status}</span>
              </div>
              <p className="mt-4 max-w-3xl leading-7 text-slate-400">{phase.description}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {phase.items.map(([title, description]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="flex items-start gap-3">
                      <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                      <div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{description}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-[2rem] border border-violet-400/15 bg-gradient-to-br from-violet-500/10 via-slate-900/60 to-cyan-500/10 p-7 sm:p-9">
        <div className="flex items-start gap-4">
          <Globe2 className="mt-1 h-6 w-6 shrink-0 text-violet-300" />
          <div>
            <h2 className="text-2xl font-bold text-white">A local-first roadmap</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              New online features should complement the desktop launcher, not make it dependent on a server. Game installations, launch targets, and immediate library access remain local responsibilities.
            </p>
            <Link to="/documentation" className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-violet-400/40 hover:bg-white/10">
              Read the architecture docs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <p>Roadmap items can move, change scope, or be removed as Mochi develops. The changelog is the source of truth for what has actually shipped.</p>
      </section>
    </div>
  )
}
