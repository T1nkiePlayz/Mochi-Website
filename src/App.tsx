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
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { DocumentationPage, DocumentationArticlePage } from './Documentation'
import { HashRouter, NavLink, Route, Routes, Link } from 'react-router-dom'
import {
  AuthProvider,
  resetPassword,
  sendMagicLink,
  signInWithPassword,
  signInWithProvider,
  signOutCurrentUser,
  listMfaFactors,
  enrollTotp,
  verifyTotpEnrollment,
  signUpWithPassword,
  setUserMetadataAccess,
  updateMyProfile,
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

const featureCards = [
  {
    title: 'Local-first launcher',
    description: 'Games stay on your device. Mochi keeps the experience fast and familiar while preserving choice.',
    icon: Rocket,
  },
  {
    title: 'Unified account',
    description: 'Create an account on the website and sign into the launcher with the same Mochi account.',
    icon: Users,
  },
  {
    title: 'Secure cloud sync',
    description: 'Protect account details, launcher settings, and Piko metadata with Mochi’s secure account system.',
    icon: ShieldCheck,
  },
]

const providerOptions = [
  'Email / password',
  'Magic link',
  'GitHub',
  'Google',
]

const dashboardCards = [
  { label: 'Library', value: '18 games' },
  { label: 'Pikos', value: '12 active' },
  { label: 'Tofus', value: '27 environments' },
  { label: 'Devices', value: '3 synced' },
]

const activityFeed = [
  'Minecraft: Performance Tofu updated',
  'Steam library imported from your main machine',
  'Cloud tags synced across devices',
  'New launcher settings pushed successfully',
]

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
              <Link
                to="/signin"
                className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110"
              >
                Sign in
              </Link>
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
            </div>
          </div>
        </footer>
      </div>
      </HashRouter>
    </AuthProvider>
  )
}

function HomePage() {
  return (
    <div className="space-y-20 pb-10">
      <section className="grid items-center gap-8 pt-8 lg:grid-cols-[1.2fr_0.8fr] lg:pt-12">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-200">
            <Sparkles className="h-3.5 w-3.5" />
            Mochi launcher
          </div>

          <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Mochi — Your games, your way.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-slate-300">
            An adaptable game launcher built for flexibility, local control, and a cloud layer available only to selected users, keeping supported metadata in sync without forcing all game data online.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/download"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110"
            >
              Get the launcher
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
            >
              Learn how it works
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-300">
            <div>
              <p className="text-2xl font-bold text-white">Local-first</p>
              <p>Games stay on your machine</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Metadata sync</p>
              <p>Cloud keeps accounts organized</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Flexible</p>
              <p>Each game gets its own setup</p>
            </div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden p-6">
          <div className="absolute -right-16 top-10 h-32 w-32 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-cyan-500/25 blur-3xl" />

          <div className="relative space-y-4">
            <div className="rounded-2xl border border-violet-400/30 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Piko</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Minecraft</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2">
                  <span>Vanilla</span>
                  <span className="text-emerald-300">Ready</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2">
                  <span>Fabric</span>
                  <span className="text-violet-200">Synced</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2">
                  <span>Performance</span>
                  <span className="text-cyan-200">Boosted</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Tofu</p>
              <p className="mt-3 text-base text-slate-200">
                Every environment is a Tofu: a distinct configuration, profile, or version you can swap between any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200">Core concepts</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Built for how games are actually played</h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article key={title} className="glass-card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-100">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="glass-card p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-200">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-slate-300">{description}</p>
          </article>
        ))}
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

function DashboardPage() {
  const { user, profile } = useAuth()
  if (!user) return <PageShell><SectionHeading eyebrow="User portal" title="Sign in to access your Mochi dashboard." /><Link to="/signin" className="inline-flex rounded-full bg-violet-500 px-5 py-3 font-semibold">Sign in</Link></PageShell>
  return (
    <PageShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-violet-200">User portal</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Welcome back, {profile?.display_name || user?.email || 'player'}</h2>
        </div>
        <button onClick={() => void signOutCurrentUser()} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-violet-400/50 hover:bg-violet-500/10">
          Sign out
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/settings" className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200">Account settings</Link>
        {profile?.is_admin && <Link to="/admin" className="rounded-full border border-violet-400/40 px-4 py-2 text-sm text-violet-200">Admin panel</Link>}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <article key={card.label} className="glass-card p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Recent activity</p>
          <ul className="mt-4 space-y-4">
            {activityFeed.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-200">Cloud status</p>
          <div className="mt-5 space-y-4 text-slate-200">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <span>Devices synced</span>
              <span className="font-semibold text-white">3/3</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <span>Metadata updates</span>
              <span className={`font-semibold ${profile?.metadata_sync_allowed ? 'text-emerald-300' : 'text-amber-300'}`}>{profile?.metadata_sync_allowed ? 'Allowed' : 'Disabled by admin'}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <span>Storage mode</span>
              <span className="font-semibold text-white">Local-first</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [sync, setSync] = useState(profile?.cloud_sync_enabled ?? false)
  const [metadata, setMetadata] = useState(profile?.metadata_sync_allowed ?? false)
  const [message, setMessage] = useState('')
  const [mfaFactors, setMfaFactors] = useState<Array<{ id: string; friendly_name?: string | null; status: string }>>([])
  const [mfaQr, setMfaQr] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  if (!user) return <PageShell><SectionHeading eyebrow="Settings" title="Sign in to manage your account." /><Link to="/signin" className="inline-flex rounded-full bg-violet-500 px-5 py-3 font-semibold">Sign in</Link></PageShell>

  const save = async () => {
    const { error } = await updateMyProfile({ display_name: name, avatar_url: profile?.avatar_url ?? null, cloud_sync_enabled: sync, metadata_sync_allowed: metadata })
    setMessage(error ? error.message : 'Settings saved.')
    if (!error) await refreshProfile()
  }

  const loadSecurity = async () => {
    const [mfaResult] = await Promise.all([listMfaFactors()])
    if (!mfaResult.error) setMfaFactors((mfaResult.data?.totp ?? []) as Array<{ id: string; friendly_name?: string | null; status: string }>)
  }

  const startMfa = async () => {
    const { data, error } = await enrollTotp()
    if (error) {
      setMessage(error.message)
      return
    }
    setMfaFactorId(data.id)
    setMfaQr(data.totp.qr_code)
    setMfaSecret(data.totp.secret)
    setMessage('Scan the QR code with your authenticator app, then enter the 6-digit code.')
  }

  const finishMfa = async () => {
    const { error } = await verifyTotpEnrollment(mfaFactorId, mfaCode)
    setMessage(error ? error.message : 'Two-factor authentication is enabled.')
    if (!error) {
      setMfaQr('')
      setMfaSecret('')
      setMfaFactorId('')
      setMfaCode('')
      await loadSecurity()
    }
  }

  return <PageShell className="max-w-3xl">
    <SectionHeading eyebrow="Account settings" title="Control your Mochi cloud experience." />
    <div className="glass-card space-y-6 p-6">
      <label className="block text-sm text-slate-300">Display name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" /></label>
      <label className="flex items-center justify-between gap-4 text-slate-200"><span><strong className="block text-white">Cloud sync</strong><small className="text-slate-400">Available only to selected users. Sync account settings across devices.</small></span><input type="checkbox" checked={sync} onChange={(event) => setSync(event.target.checked)} /></label>
      <label className="flex items-center justify-between gap-4 text-slate-200"><span><strong className="block text-white">Save metadata</strong><small className="text-slate-400">Admin permission: {metadata ? 'enabled' : 'disabled'}.</small></span><input type="checkbox" checked={metadata} onChange={(event) => setMetadata(event.target.checked)} disabled={!metadata && profile?.metadata_sync_allowed === false} /></label>
      <button onClick={() => void save()} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 font-semibold text-white">Save settings</button>
      {message && <p className="text-sm text-cyan-200">{message}</p>}
    </div>

    <div className="glass-card space-y-5 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Account security</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Two-factor authentication</h3>
        <p className="mt-2 text-sm text-slate-400">Use an authenticator app to add another layer of protection to your Mochi account.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => void startMfa()} className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-100">Set up authenticator app</button>
        <button onClick={() => void loadSecurity()} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">Refresh</button>
      </div>

      {mfaFactors.filter((factor) => factor.status === 'verified').length > 0 && <p className="text-sm text-emerald-300">Authenticator-based two-factor authentication is enabled.</p>}

      {mfaQr && <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-sm text-slate-200">Scan this QR code with your authenticator app.</p>
        <img src={mfaQr} alt="Authenticator setup QR code" className="mt-4 h-48 w-48 rounded-xl bg-white p-2" />
        <p className="mt-3 break-all text-xs text-slate-400">Manual setup key: {mfaSecret}</p>
        <div className="mt-4 flex gap-2">
          <input value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} inputMode="numeric" maxLength={6} placeholder="123456" className="w-32 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white" />
          <button onClick={() => void finishMfa()} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white">Verify</button>
        </div>
      </div>}
    </div>
  </PageShell>
}

function AdminPage() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [message, setMessage] = useState('')
  if (!profile?.is_admin) return <PageShell><SectionHeading eyebrow="Admin" title="Admin access required." /></PageShell>
  const load = async () => {
    const { data, error } = await listProfiles()
    if (error) setMessage(error.message)
    else setProfiles((data ?? []) as Profile[])
  }
  return <PageShell>
    <SectionHeading eyebrow="Admin panel" title="Control metadata sync access." />
    <button onClick={() => void load()} className="rounded-full bg-violet-500 px-5 py-3 font-semibold">Load users</button>
    {message && <p className="text-sm text-rose-300">{message}</p>}
    <div className="space-y-3">{profiles.map((item) => <div key={item.id} className="glass-card flex flex-wrap items-center justify-between gap-4 p-4"><div><p className="font-semibold text-white">{item.display_name || item.id}</p><p className="text-sm text-slate-400">{item.id}</p></div><button onClick={() => void setUserMetadataAccess(item.id, !item.metadata_sync_allowed).then(({ error }) => { if (error) setMessage(error.message); else void load() })} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200">{item.metadata_sync_allowed ? 'Disable metadata' : 'Allow metadata'}</button></div>)}</div>
  </PageShell>
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
