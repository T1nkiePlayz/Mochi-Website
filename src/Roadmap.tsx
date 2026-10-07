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
    title: 'Foundation',
    status: 'Available',
    tone: 'emerald',
    description: 'The core launcher experience and the foundations needed to build the rest of Mochi.',
    items: [
      ['Game library', 'Manage Pikos and their Tofus in a local-first library.'],
      ['Flexible launching', 'Launch executables, .desktop files, supported scripts, and installed Flatpaks.'],
      ['IGDB enrichment', 'Optionally identify games and confirm metadata before applying it.'],
      ['Account system', 'Use email, GitHub, Google, sign-in codes, authenticator-app 2FA, and passkeys where configured.'],
    ],
  },
  {
    title: 'Polish & reliability',
    status: 'In progress',
    tone: 'violet',
    description: 'Make everyday Mochi usage faster, clearer, and easier to recover from.',
    items: [
      ['Better game management', 'Richer game details, improved editing, categories, filtering, and library organisation.'],
      ['Launcher feedback', 'Clearer launch states, errors, and diagnostics when a target cannot be started.'],
      ['Metadata quality', 'More predictable artwork, metadata refresh, and manual correction workflows.'],
      ['Cross-platform groundwork', 'Continue separating platform-specific native behaviour from the shared interface.'],
    ],
  },
  {
    title: 'Mochi Cloud',
    status: 'Planned',
    tone: 'cyan',
    description: 'Turn the existing cloud foundation into a dependable companion to the local library.',
    items: [
      ['Library synchronisation', 'Synchronise supported Piko and Tofu metadata without uploading game installations.'],
      ['Sync history', 'Show when data was synchronised and whether an operation succeeded or failed.'],
      ['Conflict handling', 'Define predictable rules for changes made on multiple devices.'],
      ['Device awareness', 'Give users visibility into the devices using their Mochi account.'],
    ],
  },
  {
    title: 'Library expansion',
    status: 'Planned',
    tone: 'cyan',
    description: 'Give Mochi the tools needed to become a genuinely powerful game library.',
    items: [
      ['Game statistics', 'Recently played, play history, favourites, and useful library insights.'],
      ['Richer game pages', 'Artwork, metadata, launch environments, activity, and configuration in one place.'],
      ['Discovery integrations', 'Explore additional metadata and mod/community integrations without making Mochi a store.'],
      ['Installation awareness', 'Detect and understand installed games where the platform allows it.'],
    ],
  },
  {
    title: 'Developer ecosystem',
    status: 'Exploring',
    tone: 'slate',
    description: 'Open up Mochi for people who want to build tools and integrations around it.',
    items: [
      ['Public API', 'Provide a documented way for approved integrations to interact with Mochi data.'],
      ['Developer tooling', 'Diagnostics and utilities for testing launcher integrations.'],
      ['Integration framework', 'Make providers and game metadata sources easier to extend.'],
      ['Automation', 'Explore useful library and launcher actions for advanced users.'],
    ],
  },
  {
    title: 'Beyond the launcher',
    status: 'Future',
    tone: 'slate',
    description: 'Longer-term ideas that depend on the foundation above being mature.',
    items: [
      ['Windows support', 'Bring the shared Mochi experience to Windows with native launch integration.'],
      ['macOS support', 'Bring the shared Mochi experience to macOS with platform-appropriate integration.'],
      ['Advanced environments', 'Richer runtime, mod-loader, compatibility, and per-Tofu configuration.'],
      ['Community features', 'Only where they improve the launcher without compromising its local-first identity.'],
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
          Mochi is being built in layers: a dependable local launcher first, then richer library tools, cloud capabilities, and an ecosystem around them. The roadmap is directional rather than a promise of exact release dates.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5"><Gamepad2 className="h-5 w-5 text-violet-300" /><p className="mt-4 text-sm font-semibold text-white">Now</p><p className="mt-1 text-sm leading-6 text-slate-400">Polish the core launcher and make managing real libraries feel effortless.</p></div>
        <div className="glass-card p-5"><Cloud className="h-5 w-5 text-cyan-300" /><p className="mt-4 text-sm font-semibold text-white">Next</p><p className="mt-1 text-sm leading-6 text-slate-400">Turn the existing cloud foundation into transparent, reliable metadata synchronisation.</p></div>
        <div className="glass-card p-5"><Code2 className="h-5 w-5 text-emerald-300" /><p className="mt-4 text-sm font-semibold text-white">Later</p><p className="mt-1 text-sm leading-6 text-slate-400">Expand integrations, developer tooling, platforms, and advanced game environments.</p></div>
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
