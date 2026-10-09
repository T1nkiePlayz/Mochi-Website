import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Download,
  Gamepad2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Smartphone,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { avatarFor } from './lib/avatar'
import { HashRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import {
  supabase,
  siteUrl,
  resetPassword,
  sendSignInCode,
  verifySignInCode,
  getSignInFactors,
  signInWithPasskey,
  signInWithPassword,
  signInWithProvider,
  signOutCurrentUser,
  signUpWithPassword,
} from './lib/supabase'
import { AuthProvider } from './lib/auth'
import { useAuth } from './lib/useAuth'

const base = import.meta.env.BASE_URL
const logoSrc = `${base}mochi.png`

const DashboardPage = lazy(() => import('./dashboard'))
const DocumentationPage = lazy(() => import('./Documentation').then((module) => ({ default: module.DocumentationPage })))
const DocumentationArticlePage = lazy(() => import('./Documentation').then((module) => ({ default: module.DocumentationArticlePage })))
const RoadmapPage = lazy(() => import('./Roadmap').then((module) => ({ default: module.RoadmapPage })))
const ChangelogPage = lazy(() => import('./Changelog').then((module) => ({ default: module.ChangelogPage })))

const navItems = [
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Roadmap', to: '/roadmap' },
  { label: 'Changelog', to: '/changelog' },
  { label: 'Download', to: '/download' },
  { label: 'Docs', to: '/documentation' },
  { label: 'FAQ', to: '/faq' },
]

const pillars = [
  {
    icon: Gamepad2,
    title: 'Pikos',
    description:
      'Games managed by Mochi, each one with its own identity, metadata, and launch preferences.',
  },
  {
    icon: Layers3,
    title: 'Tofus',
    description:
      'Independent environments and configurations for each game, from performance builds to modded setups.',
  },
  {
    icon: Cloud,
    title: 'Mochi Cloud',
    description:
      'Sync the metadata that matters across devices for selected users without moving full game installs around the cloud.',
  },
]


function getInitials(value?: string | null) {
  return value
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'M'
}

function AuthHeader() {
  const { user, profile } = useAuth()
  if (!user) {
    return (
      <Link
        to="/signin"
        className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110"
      >
        Sign in
      </Link>
    )
  }
  const initials = getInitials(profile?.display_name || user.email)
  const avatar = avatarFor(user.email, profile?.avatar_url)
  return (
    <Link
      to="/dashboard"
      aria-label="Open your Mochi dashboard"
      title="Account dashboard"
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 transition hover:border-violet-400/60 hover:bg-violet-500/10"
    >
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <span className="text-xs font-bold text-slate-100">{initials}</span>}
    </Link>
  )
}

function DashboardAccessGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  useEffect(() => {
    let active = true
    const check = async () => {
      if (loading) return
      if (!user || !supabase) {
        if (active) {
          setAllowed(false)
          setChecking(false)
        }
        return
      }
      const [aal, factors] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        getSignInFactors(),
      ])
      if (!active) return
      if (aal.error || factors.error) setAllowed(false)
      else {
        const hasTotp = (factors.data?.totp ?? []).length > 0
        const hasPasskey = (factors.data?.passkeys ?? []).length > 0
        setAllowed((!hasTotp && !hasPasskey) || aal.data?.currentLevel === 'aal2')
      }
      setChecking(false)
    }
    void Promise.resolve().then(check)
    return () => { active = false }
  }, [user, loading])
  useEffect(() => { if (!checking && !allowed) window.location.hash = '#/signin' }, [checking, allowed])
  if (loading || checking) return <PageLoading />
  if (!allowed) return <AuthCard title="Additional verification required" subtitle="Finish verifying your account before opening the dashboard." />
  return <>{children}</>
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuButton = useRef<HTMLButtonElement>(null)
  return (
    <AuthProvider>
      <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),_transparent_22%)]" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
              <img src={logoSrc} alt="Mochi" width={36} height={36} className="h-9 w-9 rounded-xl object-contain" />
              Mochi
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `transition hover:text-white ${isActive ? 'text-white' : 'text-slate-300'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                ref={mobileMenuButton}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-100 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 md:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link
                to="/download"
                className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-violet-400/60 hover:bg-violet-500/10 sm:inline-flex"
              >
                Download
              </Link>
              <AuthHeader />
            </div>
          </div>
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setMobileMenuOpen(false)
                mobileMenuButton.current?.focus()
              }
            }}
            className={`md:hidden ${mobileMenuOpen ? 'block border-t border-white/10 px-4 pb-4 pt-2 sm:px-6' : 'hidden'}`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 ${isActive ? 'bg-violet-500/15 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route
              path="/documentation"
              element={
                <Suspense fallback={<PageLoading />}>
                  <DocumentationPage />
                </Suspense>
              }
            />
            <Route
              path="/documentation/:section"
              element={
                <Suspense fallback={<PageLoading />}>
                  <DocumentationArticlePage />
                </Suspense>
              }
            />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/verify" element={<EmailVerificationPage />} />
            <Route path="/dashboard" element={<DashboardAccessGate><DashboardPage /></DashboardAccessGate>} />
            <Route path="/settings" element={<DashboardAccessGate><DashboardPage /></DashboardAccessGate>} />
            <Route path="/admin" element={<DashboardAccessGate><DashboardPage /></DashboardAccessGate>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="relative border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <img src={logoSrc} alt="" width={28} height={28} loading="lazy" decoding="async" className="h-7 w-7 rounded-lg object-contain" />
                <p className="text-base font-semibold text-white">Mochi</p>
              </div>
              <p className="mt-1">Your games, your way.</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/how-it-works" className="transition hover:text-white">
                How it works
              </Link>
              <Link to="/download" className="transition hover:text-white">
                Download
              </Link>
              <Link to="/signin" className="transition hover:text-white">
                Sign in
              </Link>
              <a href={`${base}policy/`} className="transition hover:text-white">
                Privacy Policy
              </a>
              <a href={`${base}terms/`} className="transition hover:text-white">
                Terms of Use
              </a>
            </div>
          </div>
        </footer>
      </div>
      </HashRouter>
    </AuthProvider>
  )
}

const featureHighlights = [
  { icon: Rocket, title: 'Launch almost anything', text: 'Add executables, .desktop files, Flatpak IDs, scripts, and Windows programs through Wine or Proton on Linux, or CrossOver and Whisky on macOS. Import from Steam, Heroic, itch.io, Lutris, Bottles and more; imports never move or uninstall anything.' },
  { icon: Gamepad2, title: 'Organise games your way', text: 'Keep one Piko for a game and create multiple Tofus for different versions, modded setups, performance profiles, or testing environments.' },
  { icon: Cloud, title: 'Optional cloud sync', text: 'When enabled for your account, Mochi can synchronise library metadata (Pikos and Tofus) without uploading game files. Syncing achievements to Mochi Cloud is a recent addition still in early development.' },
  { icon: ShieldCheck, title: 'Account controls', text: 'Use Google, GitHub, an email sign-in code, or email and password, with authenticator-app two-factor authentication and passkeys available when configured.' },
]

const steps = [
  ['01', 'Add a game', 'Import from your existing launchers, or choose a launch target with Mochi’s native file picker or select an installed Flatpak.'],
  ['02', 'Identify it', 'Optionally use IGDB, SteamGridDB, or the Steam Store to find artwork and metadata. Custom artwork is never overwritten.'],
  ['03', 'Create Tofus', 'Keep separate environments for vanilla, mods, performance, testing, or whatever makes sense for that game.'],
  ['04', 'Play', 'Pick the Piko and Tofu you want and press Play. Mochi hands the launch target to its native desktop layer.'],
]

function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" aria-live="polite">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-400">Loading…</div>
    </div>
  )
}

function HomePage() {
  return (
    <div className="relative space-y-24 pb-12">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="mochi-orbit mochi-orbit-one" />
        <div className="mochi-orbit mochi-orbit-two" />
        <div className="mochi-grid" />
        <div className="absolute left-[8%] top-48 h-2 w-2 rounded-full bg-violet-300/70 blur-[1px]" />
        <div className="absolute right-[14%] top-[38rem] h-1.5 w-1.5 rounded-full bg-cyan-200/70" />
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/45 px-6 py-20 sm:px-10 lg:px-14">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl mochi-glow mochi-glow-one" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl mochi-glow mochi-glow-two" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            <Sparkles className="h-4 w-4" /> Linux-first game launcher · early development
          </div>
          <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Your games, <span className="gradient-text">your way.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            Mochi is a flexible desktop game launcher built around local control. Bring your games together, give every setup its own environment, and use optional online services when they actually help.
          </p>
          <div className="mt-9 flex justify-center gap-4 flex-wrap">
            <Link to="/download" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3.5 font-semibold text-white shadow-xl shadow-violet-500/25 transition hover:scale-[1.02] hover:brightness-110">Get Mochi <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/documentation" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-slate-100 transition hover:border-violet-400/40 hover:bg-white/10">Explore the docs</Link>
          </div>
          <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white">Local-first</p><p className="mt-1 text-sm text-slate-400">Games stay on your device.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white">Piko + Tofu</p><p className="mt-1 text-sm text-slate-400">Separate game identity from environment.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white">Linux and macOS</p><p className="mt-1 text-sm text-slate-400">Steam Deck and controller friendly.</p></div>
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Why Mochi</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">A launcher that stays out of the way.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-400">Mochi is designed to be the layer between you and the games already on your machine. It does not try to become a game store, replace publishers, or move your entire library into the cloud.</p>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {featureHighlights.map(({icon:Icon,title,text}) => <article key={title} className="glass-card p-6"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200"><Icon className="h-5 w-5"/></div><h3 className="mt-5 text-xl font-semibold text-white">{title}</h3><p className="mt-3 leading-7 text-slate-300">{text}</p></article>)}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-7 sm:p-10 lg:p-12">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">The Mochi model</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Simple concepts. Lots of room to grow.</h2>
            <p className="mt-4 leading-7 text-slate-400">The core model separates a game’s identity from the way you run it, so one game can have as many environments as you need.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pillars.map(({icon:Icon,title,description}) => <article key={title} className="glass-card p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200"><Icon className="h-6 w-6"/></div><h3 className="mt-5 text-xl font-semibold text-white">{title}</h3><p className="mt-3 leading-7 text-slate-300">{description}</p></article>)}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.07] p-5 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Piko</p><p className="mt-2 text-lg font-bold text-white">What you play</p><p className="mt-1 text-sm text-slate-400">The game’s identity and library record.</p></div>
            <div className="hidden text-2xl text-slate-500 md:block">→</div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-5 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Tofu</p><p className="mt-2 text-lg font-bold text-white">How you play it</p><p className="mt-1 text-sm text-slate-400">A specific environment, setup, or configuration.</p></div>
          </div>
        </div>
      </section>
      <section>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">From library to launch</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Four steps from setup to Play.</h2>
        </div>
        <div className="mt-9 grid gap-4 lg:grid-cols-4">
          {steps.map(([number,title,text]) => <article key={number} className="glass-card relative p-6"><p className="text-sm font-mono text-violet-300">{number}</p><h3 className="mt-5 text-xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{text}</p></article>)}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-900/60 to-cyan-500/10 p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Local-first</p><h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Your game files belong to you.</h2><p className="mt-4 leading-7 text-slate-300">Mochi stores the information it needs to manage your library locally. Optional cloud features are focused on supported metadata and account data. A network outage should not turn an already-installed local game into a cloud-dependent file.</p></div>
          <div className="grid gap-3">
            {['Game installations stay local','Launch targets stay tied to your machine','Cloud sync is optional and access-controlled','IGDB enrichment is optional','No complete game installations uploaded by Mochi'].map(x=><div key={x} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300"/>{x}</div>)}
          </div>
        </div>
      </section>

      <section className="grid items-center gap-10 lg:grid-cols-[1fr_.9fr]">
        <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Made for Linux first</p><h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Native where it matters.</h2><p className="mt-4 leading-7 text-slate-400">Mochi uses a web-based interface inside Tauri, while Rust handles desktop responsibilities such as process launching, native file selection, filesystem access, and installed Flatpak discovery. That lets the interface stay polished without giving up native integration.</p></div>
        <div className="glass-card p-6 font-mono text-sm">
          <div className="space-y-3 text-slate-300"><p><span className="text-violet-300">Mochi UI</span> → Tauri 2</p><p><span className="text-violet-300">Tauri</span> → Rust / OS</p><p><span className="text-violet-300">Rust</span> → executable / .desktop / Flatpak / script</p><p><span className="text-violet-300">Local data</span> → Pikos + Tofus + settings</p><p><span className="text-violet-300">Optional cloud</span> → supported metadata</p></div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Link to="/documentation" className="glass-card group p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><p className="text-sm text-violet-300">Documentation</p><h3 className="mt-2 text-xl font-semibold text-white">Understand the architecture</h3><p className="mt-3 text-sm leading-6 text-slate-400">Read about Pikos, Tofus, launching, authentication, storage, and cloud synchronisation.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Read docs <ArrowRight className="h-4 w-4"/></span></Link>
        <Link to="/faq" className="glass-card group p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><p className="text-sm text-cyan-300">FAQ</p><h3 className="mt-2 text-xl font-semibold text-white">Have questions?</h3><p className="mt-3 text-sm leading-6 text-slate-400">Find answers about accounts, cloud sync, platforms, offline use, and what Mochi does with your data.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Read FAQ <ArrowRight className="h-4 w-4"/></span></Link>
        <Link to="/download" className="glass-card group p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><p className="text-sm text-emerald-300">Download</p><h3 className="mt-2 text-xl font-semibold text-white">Ready to try it?</h3><p className="mt-3 text-sm leading-6 text-slate-400">Early-development builds for Linux and macOS, including Steam Deck and controller support.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Get Mochi <ArrowRight className="h-4 w-4"/></span></Link>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-violet-500/[0.06] p-10 text-center sm:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,255,.18),transparent_55%)]" />
        <div className="relative"><Sparkles className="mx-auto h-7 w-7 text-violet-300"/><h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Ready when you are.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">Bring your library together, keep your setups separate, and let Mochi handle the boring parts.</p><Link to="/download" className="mt-7 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25">Get Mochi</Link></div>
      </section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <PageShell>
      <SectionHeading eyebrow="404" title="That page doesn’t exist." />
      <Link to="/" className="inline-flex rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100">Back to home</Link>
    </PageShell>
  )
}

function FeaturePage() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Product features"
        title="Everything you need to manage your library without friction"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {[
          'Library management and game discovery',
          'Custom Tofu environments for profiles and versions',
          'Cross-device account sync and launcher settings for selected users',
          'Local game installs with cloud metadata support for selected users',
          'Secure account authentication and user accounts',
          'Responsive portal for end users and admins',
        ].map((item) => (
          <div key={item} className="glass-card flex items-start gap-3 p-5 text-slate-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </PageShell>
  )
}

function HowItWorksPage() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="How Mochi works"
        title="A launcher that keeps the important parts in sync while your games stay local"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StepCard step="01" title="Pikos" description="Pikos are the games managed by Mochi. They hold the identity and metadata of the libraries you care about." />
        <StepCard step="02" title="Tofus" description="Tofus are the individual environments or configurations for a game, such as a performance build, a modded profile, or a vanilla install." />
        <StepCard step="03" title="Mochi Cloud" description="Mochi Cloud is currently available only to selected users. For those users, it syncs accounts, metadata, configurations, and device state, while keeping large game files on the user’s device." />
      </div>

      <div className="glass-card mt-8 p-6 text-slate-200">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-200">Local-first by design</p>
        <p>
          Mochi does not need a traditional backend server to launch locally installed games. Instead, the app keeps gaming files on the user’s device while using cloud services for metadata, identities, and cross-device coordination.
        </p>
      </div>
    </PageShell>
  )
}

function DownloadPage() {
  return (
    <PageShell>
      <SectionHeading eyebrow="Download" title="Get Mochi (early development)" />

      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Latest release</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Linux and macOS</h3>
          </div>
          <a
            href="https://github.com/T1nkiePlayz/Mochi/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
          >
            <Download className="h-4 w-4" />
            Download latest release
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { name: 'Linux', status: 'Supported', note: 'AppImage, .deb, .rpm, Arch PKGBUILD. Best tested.', accent: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30' },
          { name: 'macOS', status: 'Supported', note: 'macOS 12+, universal DMG. Builds are not notarized, so Gatekeeper blocks the first launch (right-click Open).', accent: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30' },
          { name: 'Steam Deck', status: 'Supported', note: 'Controller-first Big Picture mode.', accent: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30' },
        ].map((platform) => (
          <article key={platform.name} className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{platform.note}</p>
            <div className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm ${platform.accent}`}>
              {platform.status}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}

/* Documentation pages are implemented in src/Documentation.tsx. */
function FaqPage() {
  return (
    <PageShell>
      <SectionHeading eyebrow="FAQ" title="Common questions" />

      <div className="space-y-5">
        <FaqItem question="What is Mochi?" answer="Mochi is a flexible, local-first game launcher designed to manage your games, installations, versions, profiles, and configurations from one place." />
        <FaqItem question="What is a Piko?" answer="A Piko is a game managed by Mochi. It represents the game and its associated metadata inside the launcher." />
        <FaqItem question="What is a Tofu?" answer="A Tofu is an individual game environment or configuration, such as vanilla, performance, Fabric, a modded setup, or another profile you create." />
        <FaqItem question="Does Mochi upload entire games to the cloud?" answer="No. Mochi is local-first. Game installations and large game files stay on your device. Cloud features are intended for supported account information, metadata, configurations, launcher settings, and device state." />
        <FaqItem question="Can I use the same account on the website and launcher?" answer="Yes. Your Mochi account can be used across the Mochi website and launcher." />
        <FaqItem question="What can I use to sign in?" answer="Mochi currently supports Google, GitHub, email sign-in codes, and email and password. Phone-number sign-in is not supported." />
        <FaqItem question="What is an email sign-in code?" answer="An email sign-in code lets you sign in without a password. Mochi emails a time-limited code that you enter on the sign-in screen." />
        <FaqItem question="Can I use a phone number instead of an email address?" answer="No. Mochi account sign-in uses an email address. Phone-number sign-in is not supported." />
        <FaqItem question="Can I use Google or GitHub without creating a separate Mochi password?" answer="Yes. If you choose Google or GitHub, you authenticate through that provider rather than entering a separate Mochi password on the sign-in form." />
        <FaqItem question="Does Mochi support two-factor authentication?" answer="Yes. Accounts can use an authenticator app for two-factor authentication when the feature is available to the account." />
        <FaqItem question="Does Mochi support passkeys?" answer="Passkeys are supported when one is registered on your account. If your account has a passkey or authenticator app configured, Mochi can ask for that additional verification after your primary sign-in." />
        <FaqItem question="Is Mochi local-first?" answer="Yes. Mochi is designed to keep your games and large game files on your own device while using online services only where account or supported cloud features require them." />
        <FaqItem question="What does Mochi Cloud sync?" answer="For users with cloud features enabled, Mochi can sync library metadata (Pikos and Tofus). Game files and local paths are never uploaded. Syncing achievements to Mochi Cloud is a recent addition still in early development." />
        <FaqItem question="Will my games work if I am offline?" answer="Yes. Your library, launching, playtime, stats, themes, settings and installed-mod management work offline. Metadata lookups, Discover, sign-in and downloads need a network connection." />
        <FaqItem question="Does Mochi replace the game stores or publishers?" answer="No. Mochi is a launcher and management layer. You remain responsible for owning or having permission to use the games, files, mods, and other content you add." />
        <FaqItem question="Can I create multiple Tofus for one game?" answer="Yes. Tofus are intended to let you keep separate environments and configurations for the same Piko, such as vanilla, modded, testing, or performance setups." />
        <FaqItem question="Is cloud sync available to everyone?" answer="Not currently. Cloud metadata features are available only to selected users, and access can be controlled from the Mochi account system." />
        <FaqItem question="Where can I download Mochi?" answer="The latest publicly available Mochi release can be found from the Download page and the project's release page." />
        <FaqItem question="What platforms does Mochi support?" answer="Mochi supports Linux (AppImage, .deb, .rpm and an Arch PKGBUILD) and macOS 12 or later (Apple silicon and Intel). Linux is the best tested. Windows is not supported. Steam Deck and controllers are supported, including a Big Picture mode. Mochi is in early development (0.1.0) and has no stable release yet." />
        <FaqItem question="How do I get help with my account?" answer="For account, privacy, or other support questions, contact support@ashtontink.com." />
        <FaqItem question="How is my personal information handled?" answer="Mochi's Privacy Policy explains what information may be collected, why it is used, how it may be disclosed, and how you can request access, correction, or deletion." />
      </div>
    </PageShell>
  )
}

function SignInPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [codeMode, setCodeMode] = useState(false)
  const [method, setMethod] = useState<'password' | 'code'>('password')
  const [code, setCode] = useState('')
  const [securityMode, setSecurityMode] = useState<'checking' | 'choose' | 'totp' | 'passkey' | 'complete'>('checking')
  const [hasTotp, setHasTotp] = useState(false)
  const [hasPasskey, setHasPasskey] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const appMode = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('app') === 'mochi'
  const mochiSignInUrl = `${siteUrl()}#/signin?app=mochi`
  const mochiVerifyUrl = 'mochi://auth/verify'

  const handoffToMochi = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) {
      setMessage(error?.message ?? 'Your Mochi session could not be prepared.')
      return
    }
    const params = new URLSearchParams({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
    window.location.href = `mochi://auth/callback?${params.toString()}`
  }, [])

  const finishLogin = useCallback(async () => {
    setSecurityMode('complete')
    if (appMode) await handoffToMochi()
    else window.location.hash = '#/dashboard'
  }, [appMode, handoffToMochi])

  const inspectSecurity = useCallback(async (accountUser = user) => {
    if (!supabase || !accountUser) return
    setBusy(true)
    setMessage('')
    const [aalResult, factorsResult] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      getSignInFactors(),
    ])
    if (aalResult.error) {
      setMessage(aalResult.error.message)
      setBusy(false)
      return
    }
    if (factorsResult.error) {
      setMessage(factorsResult.error.message)
      setBusy(false)
      return
    }

    const totp = (factorsResult.data?.totp ?? []).length > 0
    const passkey = (factorsResult.data?.passkeys ?? []).length > 0
    setHasTotp(totp)
    setHasPasskey(passkey)
    setPendingUserId(accountUser.id)

    // AAL2 means a real Supabase MFA factor has already been verified.
    if (aalResult.data?.currentLevel === 'aal2') {
      setBusy(false)
      await finishLogin()
      return
    }

    if (!totp && !passkey) {
      setBusy(false)
      await finishLogin()
      return
    }

    if (totp && passkey) setSecurityMode('choose')
    else if (totp) setSecurityMode('totp')
    else setSecurityMode('passkey')
    setBusy(false)
  }, [user, finishLogin])

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (user) return inspectSecurity(user)
      setSecurityMode('checking')
      setPendingUserId(null)
    })
  }, [user, inspectSecurity])

  const run = async (action: () => Promise<{ error: Error | null }>) => {
    setBusy(true)
    setMessage('')
    const { error } = await action()
    const text = error?.message ?? ''
    const safeMessage =
      text === 'missing email or phone' || text === 'One of email or phone must be set'
        ? 'Please enter your email address.'
        : text
    setMessage(error ? safeMessage : '')
    setBusy(false)
    return !error
  }

  const sendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setMessage('Please enter your email address.')
      return
    }
    const sent = await run(() => sendSignInCode(normalizedEmail))
    if (sent) {
      setEmail(normalizedEmail)
      setCode('')
      setCodeMode(true)
    }
  }

  const afterPrimaryAuth = async (expectedUserId?: string) => {
    if (!supabase) return
    const { data } = await supabase.auth.getUser()
    const currentUser = data.user
    if (!currentUser) {
      setMessage('Sign-in completed, but the Mochi session could not be loaded.')
      return
    }
    if (expectedUserId && currentUser.id !== expectedUserId) {
      await supabase.auth.signOut()
      setMessage('The selected passkey belongs to a different Mochi account. Please sign in again.')
      return
    }
    await inspectSecurity(currentUser)
  }

  const verifyCode = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedCode = code.replace(/\s/g, '')
    if (!normalizedEmail) {
      setMessage('Please enter your email address.')
      return
    }
    if (!/^\d{8}$/.test(normalizedCode)) {
      setMessage('Enter the 8-digit sign-in code from your email.')
      return
    }
    const verified = await run(() => verifySignInCode(normalizedEmail, normalizedCode))
    if (verified) await afterPrimaryAuth()
  }

  const verifyTotp = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setMessage('Enter the 6-digit code from your authenticator app.')
      return
    }
    setBusy(true)
    setMessage('')
    const factors = await supabase!.auth.mfa.listFactors()
    if (factors.error) {
      setMessage(factors.error.message)
      setBusy(false)
      return
    }
    const factor = factors.data.totp.find((item) => item.status === 'verified')
    if (!factor) {
      setMessage('No verified authenticator app is available for this account.')
      setBusy(false)
      return
    }
    const verified = await supabase!.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() })
    if (verified.error) {
      setMessage(verified.error.message)
      setBusy(false)
      return
    }
    setBusy(false)
    await finishLogin()
  }

  const verifyPasskey = async () => {
    if (!pendingUserId) {
      setMessage('Your sign-in session is missing. Please start again.')
      return
    }
    setBusy(true)
    setMessage('')
    const { data, error } = await signInWithPasskey()
    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }
    if (!data.user || data.user.id !== pendingUserId) {
      await supabase?.auth.signOut()
      setMessage('The selected passkey belongs to a different Mochi account. Please start sign-in again.')
      setBusy(false)
      return
    }
    setBusy(false)
    await finishLogin()
  }

  const switchFactor = (mode: 'passkey' | 'totp') => { setCode(''); setMessage(''); setSecurityMode(mode) }
  const inputClass = 'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/60'
  const primaryButton = 'w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none'
  const linkButton = 'text-slate-400 transition hover:text-white disabled:opacity-40'
  const codeInput = 'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 text-center font-mono text-2xl tracking-[0.4em] text-white outline-none placeholder:text-slate-600 focus:border-violet-400/60'

  if (user && securityMode === 'checking') {
    return <AuthCard title="Checking your account" subtitle="One moment while we check your account security…" />
  }

  if (user && securityMode !== 'complete') {
    return (
      <AuthCard
        eyebrow="Additional verification"
        title={securityMode === 'passkey' ? 'Use your passkey' : securityMode === 'totp' ? 'Enter your code' : 'Verify it’s you'}
        subtitle={securityMode === 'choose' ? 'Choose how you’d like to finish signing in.' : undefined}
      >
        {securityMode === 'choose' && (
          <div className="space-y-2">
            {[
              { mode: 'passkey' as const, icon: KeyRound, title: 'Passkey', text: 'Device, password manager, or security key' },
              { mode: 'totp' as const, icon: Smartphone, title: 'Authenticator app', text: '6-digit code from your app' },
            ].map(({ mode, icon: Icon, title, text }) => (
              <button key={mode} type="button" disabled={busy} onClick={() => switchFactor(mode)} className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/[0.07] disabled:opacity-40">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-200"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block font-semibold text-white">{title}</span><span className="block text-sm text-slate-400">{text}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-violet-300" />
              </button>
            ))}
          </div>
        )}

        {securityMode === 'passkey' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200"><KeyRound className="h-7 w-7" /></div>
            <p className="text-sm leading-6 text-slate-400">Use the passkey you registered for this Mochi account.</p>
            <button type="button" disabled={busy} onClick={() => void verifyPasskey()} className={primaryButton}>{busy ? 'Waiting for passkey…' : 'Continue with passkey'}</button>
            {hasTotp && <button type="button" disabled={busy} onClick={() => switchFactor('totp')} className={`${linkButton} text-sm`}>Use authenticator app instead</button>}
          </div>
        )}

        {securityMode === 'totp' && (
          <div className="space-y-4">
            <p className="text-center text-sm leading-6 text-slate-400">Open your authenticator app and enter the current 6-digit code.</p>
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus aria-label="Authenticator code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(event) => { if (event.key === 'Enter') void verifyTotp() }} placeholder="123456" className={codeInput} />
            <button type="button" disabled={busy || code.length !== 6} onClick={() => void verifyTotp()} className={primaryButton}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
            {hasPasskey && <div className="text-center"><button type="button" disabled={busy} onClick={() => switchFactor('passkey')} className={`${linkButton} text-sm`}>Use passkey instead</button></div>}
          </div>
        )}

        {message && <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-500/5 p-3 text-center text-sm text-rose-200">{message}</p>}
        <div className="mt-6 text-center"><button type="button" onClick={() => void signOutCurrentUser()} className={`${linkButton} text-xs`}>Cancel and sign out</button></div>
      </AuthCard>
    )
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (codeMode) {
    return (
      <AuthCard eyebrow="Check your email" title="Enter your sign-in code" subtitle={<>We sent an 8-digit code to <strong className="text-slate-200">{email}</strong>.</>}>
        <div className="space-y-4">
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={8} autoFocus aria-label="Sign-in code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={(event) => { if (event.key === 'Enter') void verifyCode() }} placeholder="12345678" className={codeInput} />
          <button type="button" disabled={busy || code.length !== 8} onClick={() => void verifyCode()} className={primaryButton}>{busy ? 'Verifying…' : 'Continue'}</button>
          <div className="flex justify-center gap-5 text-sm">
            <button type="button" disabled={busy} onClick={() => { setCodeMode(false); setCode(''); setMessage('') }} className={linkButton}>Use a different email</button>
            <button type="button" disabled={busy} onClick={() => void sendCode()} className={linkButton}>Resend code</button>
          </div>
          {message && <p className="text-center text-sm text-rose-200">{message}</p>}
        </div>
      </AuthCard>
    )
  }

  const socialButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <AuthCard eyebrow="Welcome" title="Sign in to Mochi" subtitle="One account for the Mochi website and launcher.">
      {appMode && <div className="mb-5 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] p-3 text-sm leading-6 text-cyan-100"><strong>Signing in for the Mochi app.</strong> You’ll be returned to Mochi automatically afterwards.</div>}

      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy} onClick={() => void run(() => signInWithProvider('github', appMode ? mochiSignInUrl : undefined))} className={socialButton}>
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .7C5.73.7.8 5.63.8 11.9c0 4.94 3.2 9.13 7.64 10.61.56.1.76-.24.76-.54v-2.1c-3.1.67-3.75-1.31-3.75-1.31-.51-1.3-1.24-1.65-1.24-1.65-1.01-.69.08-.67.08-.67 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.71-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.27-2.61 5.21-5.09 5.49.4.34.76 1.01.76 2.04v3.02c0 .3.2.65.77.54A11.2 11.2 0 0 0 23.2 11.9C23.2 5.63 18.27.7 12 .7Z"/></svg> GitHub
        </button>
        <button type="button" disabled={busy} onClick={() => void run(() => signInWithProvider('google', appMode ? mochiSignInUrl : undefined))} className={socialButton}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"/><path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z"/><path fill="#FBBC05" d="M6.54 13.69A5.84 5.84 0 0 1 6.23 12c0-.59.11-1.16.31-1.69V7.78H3.3A9.72 9.72 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.22l3.24-2.53Z"/><path fill="#EA4335" d="M12 6.28c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.3 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.38l3.24 2.53C7.31 8 9.46 6.28 12 6.28Z"/></svg> Google
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500"><span className="h-px flex-1 bg-white/10" />or with email<span className="h-px flex-1 bg-white/10" /></div>

      <div role="tablist" aria-label="Sign-in method" className="mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-slate-900/60 p-1 text-sm font-medium">
        {([['password', 'Password'], ['code', 'Email code']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={method === id} onClick={() => { setMethod(id); setMessage('') }} className={method === id ? 'rounded-lg bg-violet-500/20 py-2 text-white' : 'rounded-lg py-2 text-slate-400 hover:text-white'}>{label}</button>
        ))}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (method === 'code') void sendCode()
          else void run(async () => { const result = await signInWithPassword(email, password); if (!result.error) window.setTimeout(() => void afterPrimaryAuth(), 0); return result })
        }}
      >
        <input type="email" autoComplete="email" aria-label="Email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        {method === 'password' && <input type="password" autoComplete="current-password" aria-label="Password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} />}
        <button type="submit" disabled={busy || !normalizedEmail || (method === 'password' && !password)} className={primaryButton}>
          {method === 'code' ? (busy ? 'Sending…' : 'Email me a code') : busy ? 'Signing in…' : 'Sign in'}
        </button>
        {message && <p className="text-sm text-cyan-200" role="status">{message}</p>}
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm">
        {method === 'password' ? (
          <>
            <button type="button" disabled={busy || !normalizedEmail} onClick={() => void run(async () => { const result = await resetPassword(normalizedEmail); if (!result.error) setMessage('Check your email for a password reset link.'); return result })} className={linkButton} title={normalizedEmail ? undefined : 'Enter your email first'}>Forgot password?</button>
            <button type="button" disabled={busy || !normalizedEmail || !password} onClick={() => void run(async () => { const result = await signUpWithPassword(normalizedEmail, password, appMode ? mochiVerifyUrl : undefined); if (!result.error) setMessage('Check your email to confirm your new account.'); return result })} className={linkButton} title="Enter an email and password first">Create account</button>
          </>
        ) : (
          <p className="w-full text-center text-slate-500">New here? We’ll create your account when you verify the code.</p>
        )}
      </div>
    </AuthCard>
  )
}

function AuthCard({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-stretch pb-10 pt-2 sm:pt-6">
      <div className="glass-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <img src={logoSrc} alt="" width={48} height={48} className="mx-auto h-12 w-12 rounded-2xl object-contain" />
          {eyebrow && <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{eyebrow}</p>}
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

function EmailVerificationPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Confirming your email address…')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    const verify = async () => {
      if (!supabase) {
        if (active) {
          setStatus('error')
          setMessage('Mochi authentication is not configured on this site.')
        }
        return
      }
      if (!tokenHash || type !== 'email') {
        if (active) {
          setStatus('error')
          setMessage('This verification link is missing the information needed to confirm your email.')
        }
        return
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      })

      if (!active) return
      if (error) {
        setStatus('error')
        setMessage(error.message)
        return
      }

      window.history.replaceState({}, document.title, window.location.pathname)
      setStatus('success')
      setMessage('Your email has been verified. Your Mochi account is ready.')
    }

    void verify()
    return () => {
      active = false
    }
  }, [])

  return (
    <PageShell className="max-w-2xl">
      <div className="glass-card p-8 text-center sm:p-10">
        <img src={logoSrc} alt="Mochi" width={64} height={64} className="mx-auto h-16 w-16 rounded-2xl object-contain" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Email verification</p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          {status === 'verifying' ? 'Confirming your email…' : status === 'success' ? 'Email verified!' : 'Verification failed'}
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-300">{message}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {status === 'success' ? (
            <Link to="/signin" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white">
              Sign in to Mochi
            </Link>
          ) : status === 'error' ? (
            <Link to="/signin" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100">
              Return to sign in
            </Link>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}

function PageShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-8 pb-10 ${className}`}>{children}</div>
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="glass-card p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-violet-200">{step}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-slate-300">{description}</p>
    </div>
  )
}


function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="glass-card p-5">
      <p className="font-semibold text-white">{question}</p>
      <p className="mt-2 text-slate-300">{answer}</p>
    </div>
  )
}

export default App