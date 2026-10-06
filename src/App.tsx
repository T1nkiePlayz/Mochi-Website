import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Download,
  Gamepad2,
  Layers3,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Shield,
  UserRound,
  KeyRound,
  Mail,
  Link2,
  CloudCog,
  Check,
  AlertTriangle,
  RefreshCw,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import md5 from 'blueimp-md5'
import { DocumentationPage, DocumentationArticlePage } from './Documentation'
import { HashRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import {
  AuthProvider,
  supabase,
  resetPassword,
  sendMagicLink,
  updateEmail,
  updatePassword,
  linkAuthIdentity,
  signInWithPassword,
  signInWithProvider,
  signOutCurrentUser,
  listMfaFactors,
  enrollTotp,
  verifyTotpEnrollment,
  unenrollTotp,
  listPasskeys,
  registerPasskey,
  deletePasskey,
  signUpWithPassword,
  setUserMetadataAccess,
  updateMyProfile,
  manageApiCredential,
  useAuth,
  listProfiles,
  type Profile,
} from './lib/supabase'

const navItems = [
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
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


const providerOptions = [
  'Email / password',
  'Magic link',
  'GitHub',
  'Google',
]

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
  const email = user.email?.trim().toLowerCase() ?? ''
  const avatar = profile?.avatar_url || (email ? `https://www.gravatar.com/avatar/${md5(email)}?d=identicon&s=96` : '')
  return (
    <Link
      to="/dashboard"
      aria-label="Open your Mochi dashboard"
      title="Account dashboard"
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 transition hover:border-violet-400/60 hover:bg-violet-500/10"
    >
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5 text-slate-100" />}
    </Link>
  )
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),_transparent_22%)]" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
              <img src="/mochi.png" alt="Mochi" className="h-9 w-9 rounded-xl object-contain" />
              Mochi
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
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
              <Link
                to="/download"
                className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-violet-400/60 hover:bg-violet-500/10 sm:inline-flex"
              >
                Download
              </Link>
              <AuthHeader />
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/documentation/:section" element={<DocumentationArticlePage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/verify" element={<EmailVerificationPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        <footer className="relative border-t border-white/10 bg-slate-950/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="flex items-center gap-2">
                <img src="/mochi.png" alt="" className="h-7 w-7 rounded-lg object-contain" />
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
              <a href="/policy/" className="transition hover:text-white">
                Privacy Policy
              </a>
              <a href="/terms/" className="transition hover:text-white">
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

function HomePage() {
  const featureHighlights = [
    { icon: Rocket, title: 'Launch almost anything', text: 'Executables, .desktop files, Flatpaks, shell scripts, Python, and JavaScript targets are routed through the native launcher.' },
    { icon: Gamepad2, title: 'Organise games your way', text: 'Keep one Piko for a game and create multiple Tofus for different versions, modded setups, performance profiles, or testing environments.' },
    { icon: Cloud, title: 'Optional cloud sync', text: 'When enabled for your account, Mochi can synchronise supported metadata and settings without uploading complete game installations.' },
    { icon: ShieldCheck, title: 'Account controls', text: 'Use Google, GitHub, magic links, or email and password, with authenticator-app two-factor authentication available in account settings.' },
  ]

  const steps = [
    ['01', 'Add a game', 'Choose a name and launch target with Mochi’s native file picker, or select an installed Flatpak.'],
    ['02', 'Identify it', 'Optionally use IGDB to find artwork, genres, release information, and other useful metadata. You stay in control of the match.'],
    ['03', 'Create Tofus', 'Keep separate environments for vanilla, mods, performance, testing, or whatever makes sense for that game.'],
    ['04', 'Play', 'Pick the Piko and Tofu you want and press Play. Mochi hands the launch target to its native desktop layer.'],
  ]

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
            <Sparkles className="h-4 w-4" /> Linux-first game launcher
          </div>
          <h1 className="mt-7 text-5xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Your games, <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">your way.</span>
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="font-semibold text-white">Linux today</p><p className="mt-1 text-sm text-slate-400">Windows and macOS are planned.</p></div>
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
        <Link to="/download" className="glass-card group p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><p className="text-sm text-emerald-300">Download</p><h3 className="mt-2 text-xl font-semibold text-white">Ready to try it?</h3><p className="mt-3 text-sm leading-6 text-slate-400">Linux is available now, with Windows and macOS planned.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Get Mochi <ArrowRight className="h-4 w-4"/></span></Link>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-violet-500/[0.06] p-10 text-center sm:p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,255,.18),transparent_55%)]" />
        <div className="relative"><Sparkles className="mx-auto h-7 w-7 text-violet-300"/><h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Ready when you are.</h2><p className="mx-auto mt-4 max-w-2xl text-slate-300">Bring your library together, keep your setups separate, and let Mochi handle the boring parts.</p><Link to="/download" className="mt-7 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25">Get Mochi</Link></div>
      </section>
    </div>
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
      <SectionHeading eyebrow="Download" title="Get the latest Mochi build" />

      <div className="glass-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Latest release</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Linux</h3>
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
          { name: 'Linux', status: 'Available now', accent: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30' },
          { name: 'Windows', status: 'Coming soon', accent: 'bg-slate-700/40 text-slate-200 border-white/10' },
          { name: 'macOS', status: 'Coming soon', accent: 'bg-slate-700/40 text-slate-200 border-white/10' },
        ].map((platform) => (
          <article key={platform.name} className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">{platform.name}</h3>
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
        <FaqItem question="What can I use to sign in?" answer="Mochi currently supports Google, GitHub, magic links, and email and password. Phone-number sign-in is not supported." />
        <FaqItem question="What is a magic link?" answer="A magic link lets you sign in through a secure link sent to your email address instead of entering a password." />
        <FaqItem question="Can I use a phone number instead of an email address?" answer="No. Mochi account sign-in uses an email address. Phone-number sign-in is not supported." />
        <FaqItem question="Can I use Google or GitHub without creating a separate Mochi password?" answer="Yes. If you choose Google or GitHub, you authenticate through that provider rather than entering a separate Mochi password on the sign-in form." />
        <FaqItem question="Does Mochi support two-factor authentication?" answer="Yes. Accounts can use an authenticator app for two-factor authentication when the feature is available to the account." />
        <FaqItem question="Does Mochi support passkeys?" answer="Mochi's current website sign-in options do not include passkey sign-in. The supported sign-in methods are Google, GitHub, magic link, and email and password." />
        <FaqItem question="Is Mochi local-first?" answer="Yes. Mochi is designed to keep your games and large game files on your own device while using online services only where account or supported cloud features require them." />
        <FaqItem question="What does Mochi Cloud sync?" answer="For users with cloud features enabled, Mochi can sync supported metadata, configurations, launcher settings, account information, and device state. It is not intended to upload complete game installations." />
        <FaqItem question="Will my games work if I am offline?" answer="Mochi is designed around local game management, so locally installed games do not need to be uploaded to the cloud. Features that depend on an online account or cloud service may require an internet connection." />
        <FaqItem question="Does Mochi replace the game stores or publishers?" answer="No. Mochi is a launcher and management layer. You remain responsible for owning or having permission to use the games, files, mods, and other content you add." />
        <FaqItem question="Can I create multiple Tofus for one game?" answer="Yes. Tofus are intended to let you keep separate environments and configurations for the same Piko, such as vanilla, modded, testing, or performance setups." />
        <FaqItem question="Is cloud sync available to everyone?" answer="Not currently. Cloud metadata features are available only to selected users, and access can be controlled from the Mochi account system." />
        <FaqItem question="Where can I download Mochi?" answer="The latest publicly available Mochi release can be found from the Download page and the project's release page." />
        <FaqItem question="What platforms does Mochi support?" answer="Linux is currently available. Windows and macOS support are planned as future releases." />
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

  const run = async (action: () => Promise<{ error: Error | null }>) => {
    setBusy(true)
    setMessage('')
    const { error } = await action()
    const message = error?.message ?? ''
    const safeMessage =
      message === 'missing email or phone' || message === 'One of email or phone must be set'
        ? 'Please enter your email address.'
        : message
    setMessage(error ? safeMessage : 'Check your inbox or continue to the dashboard.')
    setBusy(false)
  }

  return (
    <PageShell className="max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Welcome back</p>
          <h2 className="mt-3 text-3xl font-bold text-white">Create or access your account</h2>
          <p className="mt-3 text-slate-300">
            Sign in with your Mochi account. You can use Google, GitHub, a magic link, or email and password.
          </p>

          <div className="mt-6 space-y-3">
            {providerOptions.map((provider) => (
              <div key={provider} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-200">
                <Lock className="h-4 w-4 text-violet-300" />
                <span>{provider}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          {user ? (
            <div className="space-y-4">
              <p className="text-slate-300">You are signed in as <strong className="text-white">{user.email}</strong>.</p>
              <Link to="/dashboard" className="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white">Open dashboard</Link>
            </div>
          ) : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void run(() => signInWithPassword(email, password)) }}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-violet-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/60"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={busy} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 disabled:opacity-50">
                {busy ? 'Working…' : 'Sign in'}
              </button>
              <button type="button" onClick={() => void run(() => resetPassword(email))} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100">
                Reset password
              </button>
              <button type="button" onClick={() => void run(() => sendMagicLink(email))} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100">
                Send magic link
              </button>
              <button type="button" onClick={() => void run(() => signUpWithPassword(email, password))} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100">
                Create account
              </button>
            </div>
            {message && <p className="text-sm text-cyan-200">{message}</p>}
            <div className="flex flex-wrap gap-2 pt-2">
              {(['github', 'google'] as const).map((provider) => (
                <button key={provider} type="button" onClick={() => void run(() => signInWithProvider(provider))} className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200">
                  Continue with {provider === 'github' ? 'GitHub' : 'Google'}
                </button>
              ))}
            </div>
          </form>}
        </div>
      </div>
    </PageShell>
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
        <img src="/mochi.png" alt="Mochi" className="mx-auto h-16 w-16 rounded-2xl object-contain" />
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

function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [tab, setTab] = useState<'overview' | 'account' | 'security' | 'api' | 'cloud' | 'admin'>('overview')
  if (!user) return <PageShell><SectionHeading eyebrow="User portal" title="Sign in to access your Mochi dashboard." /><Link to="/signin" className="inline-flex rounded-full bg-violet-500 px-5 py-3 font-semibold">Sign in</Link></PageShell>
  const isAdmin = user.app_metadata?.role === 'admin' || profile?.is_admin === true
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: UserRound },
    { id: 'account' as const, label: 'Account', icon: UserRound },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'api' as const, label: 'API', icon: KeyRound },
    { id: 'cloud' as const, label: 'Cloud', icon: Cloud },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: Users }] : []),
  ]
  return <PageShell className="max-w-6xl">
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/[0.12] via-slate-950/70 to-cyan-500/[0.08] p-6 sm:p-8">
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4"><img src={profile?.avatar_url || `https://www.gravatar.com/avatar/${md5((user.email || '').trim().toLowerCase())}?d=identicon&s=128`} alt="" className="h-16 w-16 shrink-0 rounded-full border border-white/15 bg-slate-900 object-cover" /><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Mochi account</p>{isAdmin && <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/30 bg-violet-500/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-200"><Shield className="h-3 w-3" /> Admin</span>}</div><h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome back, {profile?.display_name || 'player'}</h2></div></div>
        <button onClick={() => void signOutCurrentUser()} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-violet-400/50 hover:bg-violet-500/10">Sign out</button>
      </div>
    </div>
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.025] p-2 lg:sticky lg:top-24"><nav className="grid gap-1">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={tab === id ? 'flex items-center gap-3 rounded-2xl bg-violet-500/15 px-4 py-3 text-left text-sm font-medium text-white ring-1 ring-violet-400/20' : 'flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}><Icon className="h-4 w-4" />{label}</button>)}</nav><div className="mt-3 border-t border-white/10 px-4 py-4"><p className="text-xs uppercase tracking-wider text-slate-500">Account ID</p><p className="mt-2 break-all font-mono text-[11px] text-slate-400">{user.id}</p></div></aside>
      <div className="min-w-0">{tab === 'overview' && <OverviewTab user={user} profile={profile} isAdmin={isAdmin} onSecurity={() => setTab('security')} onAccount={() => setTab('account')} onCloud={() => setTab('cloud')} />}{tab === 'account' && <AccountTab user={user} profile={profile} refreshProfile={refreshProfile} />}{tab === 'security' && <SecurityTab user={user} />}{tab === 'api' && <ApiTab />}{tab === 'cloud' && <CloudTab profile={profile} />}{tab === 'admin' && isAdmin && <AdminTab />}</div>
    </div>
  </PageShell>
}

function OverviewTab({ user, profile, isAdmin, onSecurity, onAccount, onCloud }: { user: any; profile: Profile | null; isAdmin: boolean; onSecurity: () => void; onAccount: () => void; onCloud: () => void }) {
  const verified = Boolean(user.email_confirmed_at)
  const mfaReady = Boolean(user.factors?.some((factor: any) => factor.factor_type === 'totp' && factor.status === 'verified'))
  const socialConnected = (user.identities ?? []).some((identity: any) => identity.provider === 'google' || identity.provider === 'github')
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><InfoCard icon={Mail} label="Email" value={user.email || 'No email'} /><InfoCard icon={KeyRound} label="User ID" value={user.id} mono /></div>
    <section className="glass-card p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-violet-300">Security health</p><h3 className="mt-2 text-xl font-semibold text-white">Keep your account protected</h3></div><ShieldCheck className="h-7 w-7 text-violet-300" /></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><StatusRow label="Email verification" ok={verified} detail={verified ? 'Verified' : 'Verification required'} /><StatusRow label="Authenticator app" ok={mfaReady} detail={mfaReady ? 'Enabled' : 'Not configured'} /><StatusRow label="Google / GitHub" ok={socialConnected} detail={socialConnected ? 'Connected' : 'Not connected'} /><StatusRow label="Admin access" ok={isAdmin} detail={isAdmin ? 'Administrator' : 'Standard account'} /></div>{(!mfaReady || !socialConnected) && <button onClick={onSecurity} className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200">Improve security <Shield className="h-4 w-4" /></button>}</section>
    <div className="grid gap-4 md:grid-cols-2"><button onClick={onAccount} className="glass-card group p-6 text-left transition hover:-translate-y-0.5 hover:border-violet-400/30"><UserRound className="h-6 w-6 text-violet-300" /><h3 className="mt-4 text-lg font-semibold text-white">Account details</h3><p className="mt-2 text-sm leading-6 text-slate-400">Change your display name, email address, or password.</p><span className="mt-4 inline-flex text-sm font-semibold text-violet-200">Manage account →</span></button><button onClick={onCloud} className="glass-card group p-6 text-left transition hover:-translate-y-0.5 hover:border-cyan-400/30"><Cloud className="h-6 w-6 text-cyan-300" /><h3 className="mt-4 text-lg font-semibold text-white">Cloud experience</h3><p className="mt-2 text-sm leading-6 text-slate-400">{profile?.metadata_sync_allowed ? (profile.cloud_sync_enabled ? 'Cloud sync is enabled for this account.' : 'Cloud sync is available but currently turned off.') : 'Cloud features are not enabled for this account.'}</p><span className="mt-4 inline-flex text-sm font-semibold text-cyan-200">View cloud settings →</span></button></div>
  </div>
}

function AccountTab({ user, profile, refreshProfile }: { user: any; profile: Profile | null; refreshProfile: () => Promise<void> }) {
  const [name, setName] = useState(profile?.display_name ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const saveProfile = async () => { setBusy(true); setMessage(''); const { data, error } = await updateMyProfile({ display_name: name, avatar_url: profile?.avatar_url ?? null, cloud_sync_enabled: profile?.cloud_sync_enabled ?? false, metadata_sync_allowed: profile?.metadata_sync_allowed ?? false }); setMessage(error ? error.message : 'Username updated successfully.'); if (!error) await refreshProfile(); setBusy(false) }
  const changeEmail = async () => { setBusy(true); setMessage(''); const { error } = await updateEmail(email); setMessage(error ? error.message : 'Check your inbox to confirm the email change.'); setBusy(false) }
  const changePassword = async () => { if (newPassword.length < 8) { setMessage('Choose a password with at least 8 characters.'); return } setBusy(true); setMessage(''); const { error } = await updatePassword(newPassword, currentPassword || undefined); setMessage(error ? error.message : 'Password updated successfully.'); if (!error) { setNewPassword(''); setCurrentPassword('') } setBusy(false) }
  return <div className="space-y-6"><SectionHeading eyebrow="Account" title="Your identity and account credentials." /><section className="glass-card space-y-5 p-6"><label className="block text-sm text-slate-300">Username<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" /></label><div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4"><div><p className="font-semibold text-white">User ID</p><p className="mt-1 break-all font-mono text-xs text-slate-500">{user.id}</p></div><CopyButton value={user.id} /></div><button disabled={busy} onClick={() => void saveProfile()} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save profile'}</button></section>
    <section className="glass-card space-y-5 p-6"><div><p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Email address</p><h3 className="mt-2 text-xl font-semibold text-white">Change your email</h3><p className="mt-2 text-sm text-slate-400">A confirmation flow protects email changes.</p></div><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" /><button disabled={busy || email === user.email} onClick={() => void changeEmail()} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white disabled:opacity-40">Send email change confirmation</button></section>
    <section className="glass-card space-y-5 p-6"><div><p className="text-sm uppercase tracking-[0.2em] text-violet-200">Password</p><h3 className="mt-2 text-xl font-semibold text-white">Change your password</h3><p className="mt-2 text-sm text-slate-400">Change it while signed in. Your project may require recent authentication or your current password.</p></div><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password (if required)" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" /><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" /><button disabled={busy || !newPassword} onClick={() => void changePassword()} className="rounded-full bg-violet-500 px-5 py-3 font-semibold text-white disabled:opacity-40">Change password</button></section>{message && <p className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">{message}</p>}</div>
}

function SecurityTab({ user }: { user: any }) {
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [mfaQr, setMfaQr] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [passkeys, setPasskeys] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const loadMfa = async () => {
    const { data, error } = await listMfaFactors()
    if (error) setMessage(error.message)
    else setMfaFactors([...(data?.totp ?? [])])
  }
  const loadPasskeys = async () => {
    const { data, error } = await listPasskeys()
    if (error) setMessage(error.message)
    else setPasskeys(data ?? [])
  }
  useEffect(() => { void loadMfa(); void loadPasskeys() }, [])

  const verifiedFactors = mfaFactors.filter((factor) => factor.status === 'verified')
  const pendingFactors = mfaFactors.filter((factor) => factor.status !== 'verified')

  const start = async () => {
    if (pendingFactors.length > 0) {
      // A pending factor can survive a refresh without its original secret.
      // Do not try to reuse that secret: create a fresh uniquely named
      // enrollment so setup always produces a new QR code.
      const freshName = `Mochi authenticator ${Date.now().toString().slice(-6)}`
      const { data: freshData, error: enrollError } = await enrollTotp(freshName)
      if (enrollError) {
        setMessage(enrollError.message)
        return
      }
      setMfaFactorId(freshData.id)
      setMfaQr(freshData.totp.qr_code)
      setMfaSecret(freshData.totp.secret)
      setMessage('A fresh authenticator setup is ready. Scan the new QR code and enter the six-digit code.')
      await loadMfa()
      return
    }

    const { data, error } = await enrollTotp()
    if (error) { setMessage(error.message); return }
    setMfaFactorId(data.id)
    setMfaQr(data.totp.qr_code)
    setMfaSecret(data.totp.secret)
    setMessage('Scan the QR code, then enter the six-digit code from your authenticator app.')
  }

  const finish = async () => {
    if (!mfaFactorId || !mfaCode) return
    const { error } = await verifyTotpEnrollment(mfaFactorId, mfaCode)
    if (error) { setMessage(error.message); return }
    setMfaQr(''); setMfaSecret(''); setMfaFactorId(''); setMfaCode('')
    setMessage('Two-factor authentication is enabled. Other sessions may need to sign in again.')
    await loadMfa()
  }

  const cancelPending = async () => {
    if (!mfaFactorId) return
    const { error } = await unenrollTotp(mfaFactorId)
    if (error) setMessage(error.message)
    else {
      setMfaQr(''); setMfaSecret(''); setMfaFactorId(''); setMfaCode('')
      setMessage('Pending authenticator setup cancelled.')
      await loadMfa()
    }
  }

  const removeVerified = async (factorId: string) => {
    const { error } = await unenrollTotp(factorId)
    setMessage(error ? error.message : 'Authenticator removed.')
    if (!error) await loadMfa()
  }

  const providers = new Set((user.identities ?? []).map((identity: any) => identity.provider))
  const connect = async (provider: 'google' | 'github') => {
    setMessage('')
    const { error } = await linkAuthIdentity(provider)
    if (error) setMessage(error.message)
  }

  const addPasskey = async () => {
    setBusy(true); setMessage('')
    const { error } = await registerPasskey()
    if (error) setMessage(error.message)
    else { setMessage('Passkey registered successfully.'); await loadPasskeys() }
    setBusy(false)
  }
  const removePasskey = async (id: string) => {
    setBusy(true); setMessage('')
    const { error } = await deletePasskey(id)
    if (error) setMessage(error.message)
    else { setMessage('Passkey removed.'); await loadPasskeys() }
    setBusy(false)
  }

  return <div className="space-y-6">
    <SectionHeading eyebrow="Security" title="Protect your Mochi account." />
    <section className="glass-card p-6">
      <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-white">Authenticator app</h3><p className="mt-2 text-sm leading-6 text-slate-400">Use TOTP two-factor authentication for an extra layer of protection.</p></div><Shield className="h-6 w-6 text-violet-300" /></div>
      <div className="mt-5 flex flex-wrap gap-3">
        <span className={verifiedFactors.length ? 'inline-flex items-center justify-center rounded-full bg-emerald-500/10 px-3 py-1.5 text-center text-xs font-semibold text-emerald-300' : 'inline-flex items-center justify-center rounded-full bg-amber-500/10 px-3 py-1.5 text-center text-xs font-semibold text-amber-300'}>{verifiedFactors.length ? 'Enabled' : pendingFactors.length ? 'Setup started' : 'Not configured'}</span>
        {!mfaFactorId && <button onClick={() => void start()} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">{verifiedFactors.length ? 'Add another authenticator' : pendingFactors.length ? 'Continue setup' : 'Set up authenticator app'}</button>}
        <button onClick={() => void loadMfa()} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"><RefreshCw className="mr-2 inline h-4 w-4" />Refresh</button>
        {verifiedFactors.map((factor) => <button key={factor.id} onClick={() => void removeVerified(factor.id)} className="rounded-full border border-rose-400/20 bg-rose-500/5 px-4 py-2 text-sm font-semibold text-rose-200">Remove authenticator</button>)}
      </div>
      {mfaFactorId && <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        {mfaQr ? <img src={mfaQr} alt="Authenticator setup QR code" className="h-48 w-48 rounded-xl bg-white p-2" /> : <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">Your authenticator setup is waiting for verification.</div>}
        <p className="mt-3 break-all text-xs text-slate-400">Manual setup key: {mfaSecret || 'Use the authenticator entry you already created.'}</p>
        <div className="mt-4 flex flex-wrap gap-2"><input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" className="w-32 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white" /><button onClick={() => void finish()} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white">Verify</button><button onClick={() => void cancelPending()} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300">Cancel setup</button></div>
      </div>}
    </section>
    <section className="glass-card p-6"><div><h3 className="text-xl font-semibold text-white">Connected accounts</h3><p className="mt-2 text-sm leading-6 text-slate-400">Connect Google or GitHub to this Mochi account. You will be redirected to the provider and returned here.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{(['google', 'github'] as const).map((provider) => <div key={provider} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-4"><div className="flex items-center gap-3"><Link2 className="h-4 w-4 text-violet-300" /><span className="font-medium capitalize text-white">{provider}</span></div>{providers.has(provider) ? <span className="text-sm font-semibold text-emerald-300">Connected</span> : <button onClick={() => void connect(provider)} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-200">Connect</button>}</div>)}</div></section>
    <section className="glass-card p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-white">Passkeys</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Use your device, password manager, biometrics, or security key to sign in without typing a password. Passkeys require WebAuthn to be enabled for the Mochi domain in Supabase.</p></div><KeyRound className="h-6 w-6 text-cyan-300" /></div><div className="mt-5 space-y-3">{passkeys.length ? passkeys.map((passkey) => <div key={passkey.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/50 p-4"><div><p className="font-medium text-white">{passkey.friendly_name || 'Mochi passkey'}</p><p className="mt-1 text-xs text-slate-500">Added {passkey.created_at ? new Date(passkey.created_at).toLocaleDateString() : 'recently'}</p></div><button disabled={busy} onClick={() => void removePasskey(passkey.id)} className="rounded-full border border-rose-400/20 bg-rose-500/5 px-3 py-1.5 text-sm font-semibold text-rose-200">Remove</button></div>) : <p className="text-sm text-slate-400">No passkeys registered yet.</p>}<button disabled={busy} onClick={() => void addPasskey()} className="rounded-full bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-400/20">{busy ? 'Opening passkey setup…' : 'Set up a passkey'}</button></div></section>
    {message && <p className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">{message}</p>}
  </div>
}

function ApiTab() {
  const [nexusKey, setNexusKey] = useState('')
  const [igdbKey, setIgdbKey] = useState('')
  const [configured, setConfigured] = useState<{ nexus: boolean; igdb: boolean }>({ nexus: false, igdb: false })
  const [visible, setVisible] = useState<{ nexus: boolean; igdb: boolean }>({ nexus: false, igdb: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<'nexus' | 'igdb' | null>(null)
  const [message, setMessage] = useState('')

  const loadStatus = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await manageApiCredential('status')
    if (error) setMessage(error.message)
    else {
      const providers = (data?.providers ?? []) as string[]
      setConfigured({ nexus: providers.includes('nexus'), igdb: providers.includes('igdb') })
    }
    setLoading(false)
  }

  useEffect(() => { void loadStatus() }, [])

  const save = async (provider: 'nexus' | 'igdb') => {
    const value = provider === 'nexus' ? nexusKey.trim() : igdbKey.trim()
    if (!value) {
      setMessage(\`Enter your \${provider === 'nexus' ? 'Nexus Mods' : 'IGDB'} credential first.\`)
      return
    }
    setSaving(provider)
    setMessage('')
    const { error } = await manageApiCredential('set', provider, value)
    if (error) setMessage(error.message)
    else {
      if (provider === 'nexus') setNexusKey('')
      else setIgdbKey('')
      setConfigured((current) => ({ ...current, [provider]: true }))
      setVisible((current) => ({ ...current, [provider]: false }))
      setMessage(\`\${provider === 'nexus' ? 'Nexus Mods' : 'IGDB'} credential saved securely.\`)
    }
    setSaving(null)
  }

  const remove = async (provider: 'nexus' | 'igdb') => {
    setSaving(provider)
    setMessage('')
    const { error } = await manageApiCredential('delete', provider)
    if (error) setMessage(error.message)
    else {
      setConfigured((current) => ({ ...current, [provider]: false }))
      setMessage(\`\${provider === 'nexus' ? 'Nexus Mods' : 'IGDB'} credential removed.\`)
    }
    setSaving(null)
  }

  const card = (
    provider: 'nexus' | 'igdb',
    title: string,
    description: string,
    value: string,
    setValue: (value: string) => void,
  ) => {
    const isConfigured = configured[provider]
    const isVisible = visible[provider]
    const isSaving = saving === provider
    return (
      <section className="glass-card space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-200">External service</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <KeyRound className="h-6 w-6 shrink-0 text-violet-300" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Credential status</p>
              <p className="mt-1 text-xs text-slate-500">{isConfigured ? 'A credential is stored for your account.' : 'No credential is stored for your account.'}</p>
            </div>
            <span className={isConfigured ? 'inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300' : 'inline-flex items-center rounded-full bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-400'}>
              {isConfigured ? 'Configured' : 'Not configured'}
            </span>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">{isConfigured ? 'Replace credential' : 'API credential'}</label>
          <div className="flex gap-2">
            <input
              type={isVisible ? 'text' : 'password'}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={isConfigured ? 'Enter a new credential to replace it' : 'Paste your credential'}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/60"
            />
            <button type="button" onClick={() => setVisible((current) => ({ ...current, [provider]: !current[provider] }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200">
              {isVisible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button disabled={isSaving || !value.trim()} onClick={() => void save(provider)} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {isSaving ? 'Saving…' : isConfigured ? 'Replace credential' : 'Save credential'}
          </button>
          {isConfigured && <button disabled={isSaving} onClick={() => void remove(provider)} className="rounded-full border border-rose-400/20 bg-rose-500/5 px-5 py-2.5 text-sm font-semibold text-rose-200 disabled:opacity-40">Remove</button>}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="API" title="Connect your external game services." />
      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.05] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div>
            <p className="font-semibold text-white">Private to your Mochi account</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">Credentials are sent only to Mochi’s authenticated backend and stored separately for your user. The saved secret is never returned to this page; you only see whether each service is configured.</p>
          </div>
        </div>
      </section>
      {loading ? <div className="glass-card p-8 text-slate-400">Loading API configuration…</div> : <>
        {card('nexus', 'Nexus Mods', 'Store the Nexus Mods credential used by Mochi for Nexus Mods integration.', nexusKey, setNexusKey)}
        {card('igdb', 'IGDB', 'Store the IGDB credential used by Mochi for game metadata and artwork lookup.', igdbKey, setIgdbKey)}
      </>}
      {message && <p className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">{message}</p>}
    </div>
  )
}

function CloudTab({ profile }: { profile: Profile | null }) {
  const [sync, setSync] = useState(profile?.cloud_sync_enabled ?? false)
  const [pikoCount, setPikoCount] = useState(0)
  const [tofuCount, setTofuCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { setSync(profile?.cloud_sync_enabled ?? false) }, [profile?.cloud_sync_enabled])
  useEffect(() => {
    if (!profile?.cloud_sync_enabled || !supabase) { setLoading(false); return }
    let active = true
    Promise.all([
      supabase.from('pikos').select('id', { count: 'exact', head: true }),
      supabase.from('tofus').select('id', { count: 'exact', head: true }),
    ]).then(([pikos, tofus]) => {
      if (!active) return
      setPikoCount(pikos.count ?? 0)
      setTofuCount(tofus.count ?? 0)
      setLoading(false)
    })
    return () => { active = false }
  }, [profile?.cloud_sync_enabled])

  const saveSync = async (enabled: boolean) => {
    if (!profile?.metadata_sync_allowed) return
    setSaving(true); setMessage('')
    const { error } = await updateMyProfile({
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      cloud_sync_enabled: enabled,
      metadata_sync_allowed: profile.metadata_sync_allowed,
    })
    if (error) setMessage(error.message)
    else setSync(enabled)
    setSaving(false)
  }

  if (!profile?.metadata_sync_allowed) return <EmptyState icon={Cloud} title="Cloud features are unavailable" text="Cloud metadata access has not been enabled for this account." />

  return <div className="space-y-6">
    <SectionHeading eyebrow="Mochi Cloud" title="Your synced metadata." />
    <section className="glass-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="text-xl font-semibold text-white">Cloud sync</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Cloud access has been granted to this account. Turn synchronization on when you want Mochi to sync supported metadata and settings.</p></div>
        <CloudCog className="h-6 w-6 text-cyan-300" />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button disabled={saving} onClick={() => void saveSync(!sync)} className={sync ? 'rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20' : 'rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200'}>
          {saving ? 'Saving…' : sync ? 'Cloud sync enabled' : 'Enable cloud sync'}
        </button>
        {sync && <span className="text-xs text-slate-500">Admin eligibility: enabled</span>}
      </div>
      {message && <p className="mt-4 text-sm text-rose-300">{message}</p>}
    </section>
    {!sync ? <EmptyState icon={Cloud} title="Cloud sync is turned off" text="Your Mochi data remains local-first until you enable cloud sync." /> :
      loading ? <div className="glass-card p-8 text-slate-400">Loading cloud data…</div> :
      pikoCount > 0 || tofuCount > 0 ? <div className="grid gap-4 sm:grid-cols-2"><InfoCard icon={Gamepad2} label="Synced Pikos" value={String(pikoCount)} /><InfoCard icon={Layers3} label="Synced Tofus" value={String(tofuCount)} /></div> :
      <EmptyState icon={Cloud} title="No cloud data yet" text="Cloud sync is enabled, but there is nothing to show yet. Your local-first library remains on your device until supported metadata is synced." />
    }
    <div className="glass-card p-6"><p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Local-first</p><p className="mt-3 leading-7 text-slate-300">Mochi does not upload complete game installations. Cloud features are limited to supported account settings and metadata.</p></div>
  </div>
}

function AdminTab() {
  const [profiles, setProfiles] = useState<Profile[]>([]); const [message, setMessage] = useState(''); const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); const { data, error } = await listProfiles(); if (error) setMessage(error.message); else setProfiles((data ?? []) as Profile[]); setLoading(false) }
  useEffect(() => { void load() }, [])
  const toggle = async (item: Profile) => { const { error } = await setUserMetadataAccess(item.id, !item.metadata_sync_allowed); if (error) setMessage(error.message); else await load() }
  return <div className="space-y-6"><SectionHeading eyebrow="Administrator" title="Manage cloud eligibility." /><div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] p-4 text-sm text-violet-100"><Shield className="mr-2 inline h-4 w-4" />Admin status is controlled by Supabase app metadata. These controls are protected server-side.</div>{loading ? <div className="glass-card p-6 text-slate-400">Loading users…</div> : <div className="space-y-3">{profiles.map((item) => <div key={item.id} className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-white">{item.display_name || item.email || item.id}</p><p className="mt-1 text-sm text-slate-400">{item.email || 'No email available'}</p><p className="mt-1 break-all font-mono text-[11px] text-slate-500">{item.id}</p></div><button onClick={() => void toggle(item)} className={item.metadata_sync_allowed ? 'rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300' : 'rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200'}>{item.metadata_sync_allowed ? 'Cloud access enabled' : 'Enable cloud access'}</button></div>)}</div>}{message && <p className="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4 text-sm text-rose-200">{message}</p>}</div>
}

function InfoCard({ icon: Icon, label, value, mono = false }: { icon: any; label: string; value: string; mono?: boolean }) {
  return <article className="glass-card p-5"><div className="flex items-center gap-3 text-slate-400"><Icon className="h-4 w-4 text-violet-300" /><span className="text-sm">{label}</span></div><p className={mono ? 'mt-3 break-all font-mono text-sm font-bold text-white' : 'mt-3 break-all text-lg font-bold text-white'}>{value}</p></article>
}
function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4"><div><p className="font-medium text-white">{label}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>{ok ? <Check className="h-5 w-5 text-emerald-300" /> : <AlertTriangle className="h-5 w-5 text-amber-300" />}</div>
}
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return <button onClick={() => { void navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }} className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200">{copied ? 'Copied' : 'Copy'}</button>
}
function EmptyState({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return <div className="glass-card p-8 text-center"><Icon className="mx-auto h-9 w-9 text-violet-300" /><h3 className="mt-4 text-xl font-semibold text-white">{title}</h3><p className="mx-auto mt-2 max-w-xl leading-7 text-slate-400">{text}</p></div>
}
function SettingsPage() { return <DashboardPage /> }
function AdminPage() { return <DashboardPage /> }
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
