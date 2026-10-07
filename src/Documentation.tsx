import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Cloud, Code2, Gamepad2, KeyRound, Layers3, Rocket, Search, ShieldCheck, Terminal, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMemo, useState, type ReactNode } from 'react'

type SectionInfo = {
  slug: string
  title: string
  description: string
  icon: typeof BookOpen
  status: 'Current' | 'Reference' | 'Planned'
}

const sections: SectionInfo[] = [
  { slug: 'getting-started', title: 'Getting Started', description: 'Install Mochi, understand the interface, add your first game, and launch it.', icon: Rocket, status: 'Current' },
  { slug: 'library', title: 'Library Management', description: 'Understand Pikos, Tofus, categories, metadata, and how your local library is organised.', icon: Gamepad2, status: 'Current' },
  { slug: 'launching', title: 'Launching Games', description: 'Learn how Mochi handles executables, .desktop files, scripts, Flatpaks, and launch failures.', icon: Terminal, status: 'Current' },
  { slug: 'integrations', title: 'Integrations & Metadata', description: 'Configure IGDB and understand metadata lookup, confirmation, artwork, and external services.', icon: Layers3, status: 'Current' },
  { slug: 'account', title: 'Account & Security', description: 'Accounts, sign-in methods, sessions, profiles, authenticator 2FA, passkeys, and permissions.', icon: ShieldCheck, status: 'Current' },
  { slug: 'cloud-sync', title: 'Mochi Cloud', description: 'How optional cloud metadata access, synchronisation, ownership, and failure handling work.', icon: Cloud, status: 'Current' },
  { slug: 'development', title: 'Development', description: 'Project architecture, frontend/native boundaries, local development, and contribution guidance.', icon: Code2, status: 'Reference' },
  { slug: 'reference', title: 'Reference', description: 'A practical glossary and reference for Mochi terminology, data concepts, and support information.', icon: BookOpen, status: 'Reference' },
]

const headings: Record<string, Array<[string, string]>> = {
  'getting-started': [['overview','Overview'],['requirements','Requirements'],['install','Installation'],['first-launch','First launch'],['add-game','Add your first game'],['identify','Identify a game'],['tofu','Create a Tofu'],['play','Launch and play'],['troubleshooting','Troubleshooting']],
  library: [['model','The Piko + Tofu model'],['piko','Pikos'],['tofu','Tofus'],['categories','Categories'],['metadata','Game metadata'],['local-data','Local data'],['organisation','Organisation patterns'],['future','Future expansion']],
  launching: [['targets','Supported launch targets'],['executable','Executables'],['desktop','Desktop entries'],['scripts','Scripts'],['flatpak','Flatpak'],['flow','Launch flow'],['errors','Errors and recovery'],['platforms','Platform behaviour']],
  integrations: [['overview','Integration model'],['igdb','IGDB'],['matching','Game matching'],['credentials','Credential handling'],['artwork','Artwork and metadata'],['limits','Integration limits'],['future','Future integrations']],
  account: [['model','Account model'],['methods','Sign-in methods'],['code','Email sign-in code'],['sessions','Sessions'],['profile','Profile'],['totp','Authenticator-app 2FA'],['passkeys','Passkeys'],['permissions','Permissions & cloud access'],['privacy','Security principles']],
  'cloud-sync': [['principles','Design principles'],['access','Cloud access'],['architecture','Architecture'],['data','Synchronised data'],['pull','Pull behaviour'],['push','Push behaviour'],['ownership','Ownership & RLS'],['failure','Failure handling'],['conflicts','Conflict handling']],
  development: [['stack','Technology stack'],['architecture','Application architecture'],['frontend','Frontend'],['native','Native layer'],['data','Data boundaries'],['local-dev','Local development'],['build','Build & deployment'],['contributing','Contributing']],
  reference: [['glossary','Glossary'],['states','Feature states'],['paths','Important paths'],['support','Support'],['principles','Product principles']],
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} className="scroll-mt-28 border-b border-white/10 pb-9 pt-2">
    <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
    <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-300">{children}</div>
  </section>
}

function Callout({ icon: Icon = Wrench, title, children }: { icon?: typeof Wrench; title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.05] p-5"><div className="flex items-start gap-3"><Icon className="mt-1 h-5 w-5 shrink-0 text-violet-300" /><div><p className="font-semibold text-white">{title}</p><div className="mt-1 text-sm leading-6 text-slate-400">{children}</div></div></div></div>
}

function Diagram({ title, children }: { title: string; children: ReactNode }) {
  return <div className="my-7 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-5"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">{title}</p>{children}</div>
}

function Box({ title, children, muted = false }: { title: string; children?: ReactNode; muted?: boolean }) {
  return <div className={`min-w-[155px] rounded-xl border px-4 py-3 text-center ${muted ? 'border-white/10 bg-white/[0.03]' : 'border-violet-400/25 bg-violet-500/[0.07]'}`}><p className="text-sm font-semibold text-white">{title}</p>{children && <p className="mt-1 text-xs leading-5 text-slate-400">{children}</p>}</div>
}

export function DocumentationPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return sections
    return sections.filter(s => `${s.title} ${s.description}`.toLowerCase().includes(value))
  }, [query])

  return <div className="space-y-10 pb-10">
    <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-cyan-500/10 p-7 sm:p-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200"><BookOpen className="h-3.5 w-3.5" /> Mochi documentation</div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Everything behind the launcher.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">A practical guide to using Mochi and a formal reference for its architecture, game model, integrations, account system, and cloud behaviour.</p>
      </div>
    </header>

    <section className="grid gap-4 md:grid-cols-3">
      <div className="glass-card p-5"><Rocket className="h-5 w-5 text-violet-300" /><p className="mt-4 font-semibold text-white">New to Mochi?</p><p className="mt-1 text-sm leading-6 text-slate-400">Start with Getting Started, then learn how Pikos and Tofus fit together.</p></div>
      <div className="glass-card p-5"><ShieldCheck className="h-5 w-5 text-cyan-300" /><p className="mt-4 font-semibold text-white">Using an account?</p><p className="mt-1 text-sm leading-6 text-slate-400">Read Account & Security before configuring 2FA, passkeys, or cloud access.</p></div>
      <div className="glass-card p-5"><Code2 className="h-5 w-5 text-emerald-300" /><p className="mt-4 font-semibold text-white">Building Mochi?</p><p className="mt-1 text-sm leading-6 text-slate-400">Development documents the boundaries between the web UI, Tauri, Rust, and data.</p></div>
    </section>

    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documentation…" className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50" />
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      {filtered.map(({ slug, title, description, icon: Icon, status }) => <Link key={slug} to={`/documentation/${slug}`} className="glass-card group block p-6 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/[0.04]">
        <div className="flex items-start justify-between gap-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200"><Icon className="h-5 w-5" /></div><span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status === 'Current' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/[0.03] text-slate-400'}`}>{status}</span></div>
        <h2 className="mt-5 text-xl font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-violet-300">Read section <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
      </Link>)}
    </div>

    {filtered.length === 0 && <div className="glass-card p-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-500" /><p className="mt-4 font-semibold text-white">No documentation sections found.</p><p className="mt-1 text-sm text-slate-500">Try a different search term.</p></div>}

    <Callout icon={CheckCircle2} title="Documentation status">
      Mochi is actively developed. Pages distinguish current behaviour from reference material and future ideas. If a feature changes in the launcher, the implementation and release notes take precedence over older explanatory text.
    </Callout>
  </div>
}

export function DocumentationArticlePage() {
  const { section: slug } = useParams()
  const current = sections.find(s => s.slug === slug) ?? sections[0]
  const currentIndex = sections.findIndex(s => s.slug === current.slug)
  const previous = sections[currentIndex - 1]
  const next = sections[currentIndex + 1]
  const pageHeadings = headings[current.slug] ?? []

  return <div className="grid gap-8 pb-10 lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          {previous ? <Link to={`/documentation/${previous.slug}`} className="text-xs text-slate-400 hover:text-white">← Previous</Link> : <Link to="/documentation" className="text-xs text-slate-400 hover:text-white">← Docs</Link>}
          {next && <Link to={`/documentation/${next.slug}`} className="text-xs text-slate-400 hover:text-white">Next →</Link>}
        </div>
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sections</p>
        <nav className="space-y-1">{sections.map(s => <Link key={s.slug} to={`/documentation/${s.slug}`} className={`block rounded-lg px-3 py-2 text-sm ${s.slug === current.slug ? 'bg-violet-500/15 font-semibold text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{s.title}</Link>)}</nav>
        <div className="my-4 border-t border-white/10" />
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">On this page</p>
        <nav className="space-y-0.5">{pageHeadings.map(([id, label]) => <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-slate-500 hover:bg-white/5 hover:text-slate-200">{label}</button>)}</nav>
      </div>
    </aside>

    <article id="top" className="min-w-0 max-w-4xl">
      <header className="mb-10 border-b border-white/10 pb-8">
        <Link to="/documentation" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-white"><ArrowLeft className="h-4 w-4" /> All documentation</Link>
        <div className="mt-5 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-200"><current.icon className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Mochi documentation</p><h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">{current.title}</h1></div></div>
        <p className="mt-5 text-lg leading-8 text-slate-300">{current.description}</p>
      </header>

      {current.slug === 'getting-started' && <GettingStarted />}
      {current.slug === 'library' && <Library />}
      {current.slug === 'launching' && <Launching />}
      {current.slug === 'integrations' && <Integrations />}
      {current.slug === 'account' && <Account />}
      {current.slug === 'cloud-sync' && <CloudSync />}
      {current.slug === 'development' && <Development />}
      {current.slug === 'reference' && <Reference />}

      <div className="mt-14 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
        {previous ? <Link to={`/documentation/${previous.slug}`} className="rounded-2xl border border-white/10 p-4 hover:border-violet-400/30"><span className="text-xs text-slate-500">Previous</span><strong className="mt-1 block text-white">← {previous.title}</strong></Link> : <div />}
        {next ? <Link to={`/documentation/${next.slug}`} className="rounded-2xl border border-white/10 p-4 text-right hover:border-violet-400/30"><span className="text-xs text-slate-500">Next</span><strong className="mt-1 block text-white">{next.title} →</strong></Link> : <div />}
      </div>
      <div className="mt-4 text-center"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs text-slate-500 hover:text-white">Back to top ↑</button></div>
    </article>
  </div>
}

function GettingStarted() { return <div className="space-y-9">
  <Section id="overview" title="1. Overview"><p>Mochi is a Linux-first desktop game launcher built around a local-first library. It gives each game a stable library identity, lets that game have multiple environments, and provides native launch integration while keeping optional online services separate from the core local experience.</p><p>The project uses a web-based interface inside Tauri. The frontend handles presentation and application state; native responsibilities such as file selection, process launching, and Flatpak discovery belong to the desktop layer.</p><Callout title="The fastest way to understand Mochi">Think of a <strong>Piko</strong> as <em>what you play</em> and a <strong>Tofu</strong> as <em>how you play it</em>. One game can therefore have multiple independent setups.</Callout></Section>
  <Section id="requirements" title="2. Requirements"><p>The desktop project is developed with Node.js/npm, TypeScript, Vite, React, Tauri 2, Rust, and Cargo. Native dependencies vary by operating system.</p><p>Linux is the current primary target. Windows and macOS are longer-term platform targets and should not be assumed to have the same native launch integrations yet.</p></Section>
  <Section id="install" title="3. Installation"><p>For development, clone the repository and install frontend dependencies with <code>npm install</code>. Use <code>npm run dev</code> for the web interface or <code>npm run tauri dev</code> to exercise the desktop shell.</p><div className="rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-slate-300"><p>$ npm install</p><p>$ npm run tauri dev</p><p>$ npm run build</p></div><p>A frontend build validates the TypeScript/Vite side; a packaged Tauri build additionally depends on the native environment being correctly configured.</p></Section>
  <Section id="first-launch" title="4. First launch"><p>Mochi opens around a local library. The main library presents games as Pikos and their available Tofus. Account and cloud features are available separately when configured.</p><p>The local-first model means an installed game should not become unusable simply because a network service is unavailable.</p></Section>
  <Section id="add-game" title="5. Add your first game"><p>Use the add-game flow to create a Piko and its initial Tofu. Give the game a name, choose a supported launch target, and save it to the library.</p><Diagram title="Basic add flow"><div className="flex min-w-[780px] items-center justify-center gap-2 text-xs"><Box title="New Piko" /><span>→</span><Box title="Name + target" /><span>→</span><Box title="Optional metadata" muted /><span>→</span><Box title="Default Tofu" /><span>→</span><Box title="Library" /></div></Diagram></Section>
  <Section id="identify" title="6. Identify a game"><p>If IGDB is configured, Mochi can search for likely matches after a game is added. The user can approve the suggested match or select a different candidate. This confirmation step exists to avoid silently attaching the wrong artwork or metadata to a game with an ambiguous name.</p></Section>
  <Section id="tofu" title="7. Create a Tofu"><p>Create additional Tofus when one game needs different configurations: for example, vanilla, modded, performance, testing, or another runtime setup. Tofus share the Piko's game identity while holding their own environment information.</p></Section>
  <Section id="play" title="8. Launch and play"><p>Select the Piko and the Tofu you want, then press Play. Mochi passes the configured launch target to its native desktop layer. The browser UI does not need direct operating-system process access.</p></Section>
  <Section id="troubleshooting" title="9. Troubleshooting"><ul className="list-disc space-y-2 pl-6"><li>Check that the launch target still exists and is executable.</li><li>For Flatpaks, verify the application is installed and its ID is correct.</li><li>For scripts, confirm the expected interpreter is available on the system.</li><li>If metadata lookup fails, the game can still remain a local library entry.</li><li>If cloud operations fail, preserve the local library and retry after resolving authentication or network issues.</li></ul></Section>
</div> }

function Library() { return <div className="space-y-9">
  <Section id="model" title="1. The Piko + Tofu model"><p>Mochi deliberately separates game identity from game environment. A Piko is the top-level game record. A Tofu belongs to one Piko and represents a particular way of running it.</p><Diagram title="Hierarchy"><div className="flex min-w-[720px] flex-col items-center gap-3 text-xs"><Box title="Piko" >Game identity</Box><div className="text-slate-500">↓ one-to-many</div><div className="flex gap-3"><Box title="Tofu: Vanilla" muted /><Box title="Tofu: Mods" muted /><Box title="Tofu: Testing" muted /></div></div></Diagram></Section>
  <Section id="piko" title="2. Pikos"><p>A Piko currently represents the game name, descriptive metadata, artwork, accent, optional artwork URL, launch target, source classification, and its collection of Tofus.</p><p>The launch target is machine-specific. A Piko's descriptive identity can remain useful even when its executable path needs to be changed on another computer.</p></Section>
  <Section id="tofu" title="3. Tofus"><p>A Tofu currently contains its own identifier, name, version, runtime, installed-mod count, and status. The model is intentionally small enough to expand later with launch arguments, environment variables, mod-loader information, runtime paths, and compatibility settings.</p></Section>
  <Section id="categories" title="4. Categories"><p>Games can be grouped using categories. When accepted IGDB metadata contains genres, Mochi can derive categories from them; without useful external metadata, custom entries can fall back to <strong>Other</strong>.</p><p>Categories are organisational metadata, not a replacement for stable IDs.</p></Section>
  <Section id="metadata" title="5. Game metadata"><p>Metadata can include a description, artwork, genres/categories, release information, and other descriptive fields supplied by supported integrations. External metadata should be treated as enrichment rather than proof of what is installed locally.</p></Section>
  <Section id="local-data" title="6. Local data"><p>The frontend currently keeps the local library and launcher settings in browser-backed local state. This allows the core library to function without cloud access.</p><Callout icon={ShieldCheck} title="Keep local data independent">Cloud synchronisation is an optional representation of supported metadata. It is not the location of the user's complete game installations.</Callout></Section>
  <Section id="organisation" title="7. Useful organisation patterns"><ul className="list-disc space-y-2 pl-6"><li>Use one Piko per game rather than one Piko per modpack.</li><li>Use Tofus for materially different environments.</li><li>Use descriptive Tofu names such as Vanilla, Performance, Testing, or Modded.</li><li>Keep machine-specific launch paths associated with the environment that actually uses them.</li></ul></Section>
  <Section id="future" title="8. Future expansion"><p>The Piko/Tofu model leaves room for richer runtimes, mod loaders, installation detection, platform integrations, process state, and advanced launch configuration without changing the basic mental model.</p></Section>
</div> }

function Launching() { return <div className="space-y-9">
  <Section id="targets" title="1. Supported launch targets"><p>Mochi's native launch layer currently supports ordinary executables, Linux <code>.desktop</code> entries, supported scripts, and Flatpak application references. The exact behaviour is platform-specific.</p></Section>
  <Section id="executable" title="2. Executables"><p>Normal executable targets are handed to the native process launcher. The configured target must exist and be runnable by the operating system.</p></Section>
  <Section id="desktop" title="3. Desktop entries"><p>On Linux, <code>.desktop</code> files can be launched using <code>gio launch</code>, with an <code>xdg-open</code> fallback. This lets Mochi work with applications that already expose a desktop entry instead of requiring a direct binary path.</p></Section>
  <Section id="scripts" title="4. Scripts"><p>Current Linux handling recognises common script extensions. Shell scripts use <code>sh</code>, Python scripts use <code>python3</code>, and JavaScript files use <code>node</code>. This is intentionally a small supported set rather than an attempt to guess every possible scripting environment.</p></Section>
  <Section id="flatpak" title="5. Flatpak"><p>Mochi can discover installed Flatpak applications on Linux and present them in its native picker. Flatpak targets are launched through <code>flatpak run</code>.</p><p>The discovery flow can inspect application metadata and prioritise entries classified as games, making the picker more useful than a raw list of every installed Flatpak.</p></Section>
  <Section id="flow" title="6. Launch flow"><Diagram title="Native launch flow"><div className="flex min-w-[820px] items-center justify-center gap-2 text-xs"><Box title="Mochi UI" /><span>→</span><Box title="Launch target" /><span>→</span><Box title="Tauri command" /><span>→</span><Box title="Rust" muted /><span>→</span><Box title="OS / Flatpak" muted /></div></Diagram><p>The web interface requests the action; the native layer decides how to execute the target. This keeps operating-system access outside the browser sandbox.</p></Section>
  <Section id="errors" title="7. Errors and recovery"><p>A failed launch should be treated as a launch failure, not as a library deletion or metadata failure. Check the target path, permissions, interpreter, Flatpak installation, and platform support before recreating the Piko.</p></Section>
  <Section id="platforms" title="8. Platform behaviour"><p>Linux is the current reference platform for native launch behaviour. Windows and macOS require their own native integrations and should not be assumed to support every Linux-specific target type.</p></Section>
</div> }

function Integrations() { return <div className="space-y-9">
  <Section id="overview" title="1. Integration model"><p>External services are optional enrichment layers. Mochi should remain useful as a local launcher when an integration is unavailable, unconfigured, rate-limited, or offline.</p></Section>
  <Section id="igdb" title="2. IGDB"><p>IGDB can provide game names, summaries, artwork, genres, and release information. Mochi uses a Twitch developer application for the standard IGDB authentication flow.</p><p>In the launcher, the current IGDB settings expose a Client ID and bearer token workflow. The website dashboard also has a private credential surface for the provider credential supported by the current build. These are separate configuration surfaces.</p><Callout icon={KeyRound} title="Protect your Twitch credentials">Client secrets and bearer credentials should be treated like passwords. Do not commit them to a repository, paste them into public issues, or put them into frontend source code.</Callout></Section>
  <Section id="matching" title="3. Game matching"><p>When the add-game flow has IGDB configured, Mochi can request several likely candidates and present them for confirmation. The user can approve the proposed match or choose another candidate.</p><p>This is important because game names are not unique enough to be trusted as an identifier by themselves.</p></Section>
  <Section id="credentials" title="4. Credential handling"><p>The website's provider credential flow sends secrets to the authenticated backend and does not return saved secrets to the dashboard. The launcher also keeps its local integration configuration separate from ordinary cloud library metadata.</p></Section>
  <Section id="artwork" title="5. Artwork and metadata"><p>Accepted metadata can improve the visual library without changing the underlying launch target. If an integration is unavailable, a game remains a valid local Piko and can be edited manually.</p></Section>
  <Section id="limits" title="6. Integration limits"><p>Third-party services can change APIs, rate limits, authentication requirements, or terms. Mochi therefore treats integrations as replaceable services rather than making them fundamental to local launching.</p></Section>
  <Section id="future" title="7. Future integrations"><p>Additional metadata and community integrations can be added later. New integrations should preserve the same principles: explicit configuration, clear failure states, and no unnecessary dependency on an online service for local gameplay.</p></Section>
</div> }

function Account() { return <div className="space-y-9">
  <Section id="model" title="1. Account model"><p>A Mochi account provides website identity and access to account-scoped features. The profile record is separate from the authentication identity and contains user-facing profile information and cloud preferences.</p></Section>
  <Section id="methods" title="2. Sign-in methods"><p>The website currently supports email/password, email sign-in code, GitHub, and Google. Additional security can be configured after primary authentication.</p></Section>
  <Section id="code" title="3. Email sign-in code"><p>The email code flow sends a one-time numeric code to the address entered by the user. The current website expects an eight-digit code and verifies it through the authentication service.</p><p>A code is not a permanent password. It should be entered only on the Mochi sign-in flow and should not be shared.</p></Section>
  <Section id="sessions" title="4. Sessions"><p>Authenticated sessions are persisted by the website client and refreshed when necessary. Signing out clears the active authentication session.</p><p>Session persistence is separate from cloud synchronisation: staying signed in does not automatically mean cloud sync is enabled.</p></Section>
  <Section id="profile" title="5. Profile"><p>A profile can contain a display name and avatar URL alongside account and cloud settings. When no custom avatar is available, the website can fall back to an email-derived Gravatar identity or initials.</p></Section>
  <Section id="totp" title="6. Authenticator-app 2FA"><p>Mochi supports TOTP through an authenticator application. A verified TOTP factor can be challenged during sign-in, and the website uses the authentication provider's MFA challenge mechanism.</p><Callout icon={ShieldCheck} title="TOTP is the native MFA factor">Authenticator-app TOTP is the mechanism Mochi treats as its actual MFA factor. It is distinct from passkeys.</Callout></Section>
  <Section id="passkeys" title="7. Passkeys"><p>Registered passkeys can be used as an additional account security method during the website's sign-in flow. Passkeys are WebAuthn credentials and are separate from the account's TOTP factor.</p><p>The current product flow checks that the passkey-authenticated account matches the account that completed the primary sign-in. Passkeys should not be described as identical to a native TOTP AAL2 factor.</p></Section>
  <Section id="permissions" title="8. Permissions & cloud access"><p>Cloud eligibility and cloud synchronisation are separate settings. An administrator can grant an account permission to use cloud metadata, while the user can then enable or disable synchronisation for that account.</p><p>Administrative operations are protected by server-side authorisation rather than relying on a hidden frontend control.</p></Section>
  <Section id="privacy" title="9. Security principles"><ul className="list-disc space-y-2 pl-6"><li>Do not trust client-supplied ownership IDs.</li><li>Use server-side authorisation for administrative actions.</li><li>Keep provider secrets out of ordinary profile data.</li><li>Do not upload complete game installations as ordinary cloud metadata.</li><li>Keep local launcher functionality useful when network services fail.</li></ul></Section>
</div> }

function CloudSync() { return <div className="space-y-9">
  <Section id="principles" title="1. Design principles"><p>Mochi Cloud is an optional metadata service around a local-first launcher. Its purpose is to synchronise supported account, Piko, Tofu, and configuration metadata—not complete game installations.</p></Section>
  <Section id="access" title="2. Cloud access"><p>Cloud metadata access can be enabled for an account by an administrator. Cloud synchronisation itself is then a separate user-controlled setting.</p><Diagram title="Permission boundary"><div className="flex min-w-[760px] items-center justify-center gap-2 text-xs"><Box title="Account" /><span>→</span><Box title="Cloud eligible?" muted /><span>→</span><Box title="Sync enabled?" muted /><span>→</span><Box title="Synchronise metadata" /></div></Diagram></Section>
  <Section id="architecture" title="3. Architecture"><p>The cloud service sits beside local Mochi state. Local library usability does not conceptually depend on the cloud database being reachable.</p><Diagram title="Local-first architecture"><div className="flex min-w-[850px] items-center justify-center gap-3 text-xs"><Box title="Mochi device">local Pikos + Tofus</Box><span>↕</span><Box title="Cloud sync" muted>authenticated metadata operations</Box><span>↕</span><Box title="Cloud database" muted>account-owned records</Box></div></Diagram></Section>
  <Section id="data" title="4. Synchronised data"><p>The current cloud model centres on <code>profiles</code>, <code>pikos</code>, and <code>tofus</code>. Profiles hold account-level information and cloud preferences. Pikos hold game metadata. Tofus hold environment metadata.</p><p>Complete game binaries and installations remain outside this model.</p></Section>
  <Section id="pull" title="5. Pull behaviour"><p>An authenticated client can retrieve Pikos owned by the account and their related Tofus. The local state can then be updated from the cloud representation.</p><p>The current launcher implementation also uses an initial empty-cloud condition to initialise the cloud representation from local library data when sync is enabled.</p></Section>
  <Section id="push" title="6. Push behaviour"><p>Supported local records are written using stable identifiers and authenticated ownership. Pikos are handled before child Tofus so parent relationships can be established safely.</p><p>The current implementation is a straightforward replication model, not a complete multi-device conflict engine.</p></Section>
  <Section id="ownership" title="7. Ownership & RLS"><p>Database row-level security is used to constrain normal data access to the authenticated owner. Tofus inherit ownership through their parent Piko relationship.</p><p>This matters because changing a client-side UUID must never be enough to expose another account's records.</p></Section>
  <Section id="failure" title="8. Failure handling"><p>Network failure, expired authentication, disabled cloud eligibility, invalid data, or a server error should be represented as a synchronisation failure. Local state should remain available and should not be discarded simply because a push or pull failed.</p></Section>
  <Section id="conflicts" title="9. Conflict handling"><p>The current system should not be described as having advanced conflict resolution. A mature multi-device implementation will need explicit revision semantics, deletion rules, timestamps or versions, and a user-visible recovery path.</p></Section>
</div> }

function Development() { return <div className="space-y-9">
  <Section id="stack" title="1. Technology stack"><p>The website uses React, TypeScript, Vite, Tailwind CSS, and React Router. The desktop launcher uses Tauri 2 and Rust for native integration.</p><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">Frontend</p><p className="mt-1 text-sm text-slate-400">React + TypeScript + Vite + Tailwind</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">Desktop</p><p className="mt-1 text-sm text-slate-400">Tauri 2 + Rust</p></div></div></Section>
  <Section id="architecture" title="2. Application architecture"><p>The shared product experience is intentionally divided into a presentation layer and a native layer. The web UI can evolve quickly while the native side owns operating-system responsibilities.</p><Diagram title="Desktop boundary"><div className="flex min-w-[780px] flex-col items-center gap-3 text-xs"><Box title="React UI" /><span>↓ commands</span><Box title="Tauri 2" muted /><span>↓ native operations</span><div className="flex gap-3"><Box title="Rust" muted>processes · dialogs · Flatpak</Box><Box title="Local data" muted>library · settings</Box></div></div></Diagram></Section>
  <Section id="frontend" title="3. Frontend"><p>The interface owns routing, presentation, local UI state, authentication client state, and user interactions. Website documentation and account pages live in the same React application but are kept separate through routes and lazy-loaded documentation components.</p></Section>
  <Section id="native" title="4. Native layer"><p>Rust handles tasks that should not be performed directly by a browser context: process launching, native file selection, installed Flatpak discovery, and filesystem-sensitive operations.</p></Section>
  <Section id="data" title="5. Data boundaries"><p>Local launcher data, authentication state, provider credentials, and cloud metadata have different trust and lifecycle requirements. They should not be collapsed into one generic data store simply because they belong to the same product.</p></Section>
  <Section id="local-dev" title="6. Local development"><div className="rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-slate-300"><p># Website development</p><p>$ npm install</p><p>$ npm run dev</p><p></p><p># Production frontend check</p><p>$ npm run build</p><p></p><p># Desktop development</p><p>$ npm run tauri dev</p></div><p>Keep credentials out of source control and use the project's expected environment configuration when working on authenticated features.</p></Section>
  <Section id="build" title="7. Build & deployment"><p>The website is built as a static Vite application and deployed through GitHub Pages. Routing uses a hash-based strategy so direct navigation remains compatible with static hosting.</p><p>A successful frontend build should be verified after source changes. Native packaging is a separate validation step.</p></Section>
  <Section id="contributing" title="8. Contributing"><p>Keep changes focused, preserve local-first behaviour, and avoid documenting planned features as if they were shipped. When changing a user-facing flow, update the relevant documentation and release notes alongside the implementation.</p></Section>
</div> }

function Reference() { return <div className="space-y-9">
  <Section id="glossary" title="1. Glossary"><dl className="space-y-4"><div><dt className="font-semibold text-white">Piko</dt><dd className="text-slate-400">A top-level Mochi game record representing what the user plays.</dd></div><div><dt className="font-semibold text-white">Tofu</dt><dd className="text-slate-400">An environment or configuration belonging to a Piko and representing how the game is run.</dd></div><div><dt className="font-semibold text-white">Launch target</dt><dd className="text-slate-400">The executable, desktop entry, script, or Flatpak reference Mochi passes to the native launcher.</dd></div><div><dt className="font-semibold text-white">Mochi Cloud</dt><dd className="text-slate-400">Optional account-scoped synchronisation of supported metadata.</dd></div><div><dt className="font-semibold text-white">Cloud eligibility</dt><dd className="text-slate-400">The permission that allows an account to use cloud metadata functionality.</dd></div><div><dt className="font-semibold text-white">TOTP</dt><dd className="text-slate-400">Time-based one-time passwords from an authenticator application; Mochi's native MFA factor.</dd></div></dl></Section>
  <Section id="states" title="2. Feature states"><p><strong>Current</strong> means the feature is represented in the current product or website implementation. <strong>Reference</strong> identifies explanatory material that may describe architecture or developer behaviour rather than a user-facing feature. <strong>Planned</strong> means an idea or direction, not a promise of availability.</p></Section>
  <Section id="paths" title="3. Important paths"><ul className="list-disc space-y-2 pl-6"><li><code>/</code> — Mochi home page</li><li><code>/download</code> — downloads and release information</li><li><code>/roadmap</code> — project direction</li><li><code>/changelog</code> — published GitHub release history</li><li><code>/documentation</code> — documentation hub</li><li><code>/dashboard</code> — authenticated account dashboard</li></ul></Section>
  <Section id="support" title="4. Support"><p>For account, privacy, or other Mochi support questions, use the project's published support contact. For launcher bugs, include the operating system, Mochi version, launch target type, and a concise description of what happened.</p></Section>
  <Section id="principles" title="5. Product principles"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">Local-first</p><p className="mt-1 text-sm text-slate-400">The launcher should remain useful without requiring the cloud.</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">User-controlled</p><p className="mt-1 text-sm text-slate-400">External metadata and account capabilities should be explicit.</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">Native where needed</p><p className="mt-1 text-sm text-slate-400">Operating-system work belongs behind the native boundary.</p></div><div className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold text-white">Stable concepts</p><p className="mt-1 text-sm text-slate-400">Stable identities should survive renames and configuration changes.</p></div></div></Section>
</div> }
