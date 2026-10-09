import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Cloud, Code2, Gamepad2, KeyRound, Layers3, Rocket, Search, ShieldCheck, Terminal, Wrench } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMemo, useState, type ReactNode } from 'react'

type SectionInfo = {
  slug: string
  title: string
  description: string
  icon: typeof BookOpen
  status: 'Current' | 'Reference'
}

const sections: SectionInfo[] = [
  { slug: 'getting-started', title: 'Getting Started', description: 'First launch, importing existing libraries, adding games, identifying games, and launching them.', icon: Rocket, status: 'Current' },
  { slug: 'library', title: 'Library Management', description: 'Pikos, Tofus, sources, categories, metadata, local storage, and machine-specific paths.', icon: Gamepad2, status: 'Current' },
  { slug: 'launching', title: 'Launching Games', description: 'Native executables, desktop entries, Flatpaks, scripts, and source-launcher handoff.', icon: Terminal, status: 'Current' },
  { slug: 'integrations', title: 'Integrations & Metadata', description: 'IGDB identification, Modrinth discovery, provider credentials, downloads, and integration boundaries.', icon: Layers3, status: 'Current' },
  { slug: 'account', title: 'Account & Security', description: 'Authentication, account switching, TOTP MFA, passkeys, identities, sessions, and credentials.', icon: ShieldCheck, status: 'Current' },
  { slug: 'cloud-sync', title: 'Mochi Cloud', description: 'Optional metadata synchronisation, cloud permissions, ownership, and local-first boundaries.', icon: Cloud, status: 'Current' },
  { slug: 'development', title: 'Development', description: 'React, Tauri, Rust, platform/source adapters, themes, native commands, and development workflow.', icon: Code2, status: 'Reference' },
  { slug: 'reference', title: 'Reference', description: 'Glossary, platform matrix, launch target matrix, storage locations, and troubleshooting.', icon: BookOpen, status: 'Reference' },
]

const headings: Record<string, Array<[string, string]>> = {
  'getting-started': [['overview','Overview'],['first-launch','First launch'],['importing','Import existing games'],['add-game','Add a game'],['identify','IGDB identification'],['tofu','Tofu environments'],['play','Launch and play'],['troubleshooting','Troubleshooting']],
  library: [['model','Piko + Tofu'],['piko','Pikos'],['tofu','Tofus'],['sources','Game sources'],['categories','Categories'],['metadata','Metadata'],['local','Local storage'],['paths','Machine-specific paths']],
  launching: [['targets','Launch targets'],['executable','Executables'],['desktop','.desktop files'],['flatpak','Flatpak'],['scripts','Scripts'],['sources','Source handoff'],['tracked','Playtime tracking'],['platforms','Platform behaviour'],['errors','Errors']],
  integrations: [['overview','Integration model'],['igdb','IGDB'],['matching','Matching and confirmation'],['modrinth','Modrinth'],['downloads','Downloads'],['credentials','Provider credentials'],['nexus-api-key','Adding your Nexus Mods API key'],['limits','Integration boundaries']],
  account: [['methods','Authentication'],['switching','Account switching'],['sessions','Sessions'],['totp','TOTP MFA'],['passkeys','Passkeys'],['identities','Connected identities'],['profile','Profiles and avatars'],['credentials','Credential security']],
  'cloud-sync': [['principles','Principles'],['access','Cloud access'],['data','Synchronised data'],['pull','Pull behaviour'],['push','Push behaviour'],['ownership','Ownership and RLS'],['local','Local boundary'],['failure','Failure handling']],
  development: [['stack','Technology stack'],['architecture','Architecture'],['frontend','Frontend'],['native','Tauri/Rust'],['platforms','Platform adapters'],['sources','Source adapters'],['themes','Theme system'],['local','Local development'],['build','Builds']],
  reference: [['glossary','Glossary'],['platforms','Platform matrix'],['targets','Launch matrix'],['storage','Storage'],['states','Feature states'],['troubleshooting','Troubleshooting']],
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
    return value ? sections.filter(s => `${s.title} ${s.description}`.toLowerCase().includes(value)) : sections
  }, [query])

  return <div className="space-y-10 pb-10">
    <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-950/70 to-cyan-500/10 p-7 sm:p-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-200"><BookOpen className="h-3.5 w-3.5" /> Documentation</div>
        <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">How Mochi actually works.</h1>
        <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">This documentation follows the current Mochi Launcher implementation: a Linux-first Tauri desktop launcher with local game management, source importing, IGDB identification, Modrinth tooling, account security, and optional cloud metadata.</p>
        <div className="mt-7 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><Search className="h-5 w-5 text-slate-500" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search documentation sections..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></div>
      </div>
    </header>
    <div className="grid gap-4 md:grid-cols-2">
      {filtered.map(({ slug, title, description, icon: Icon, status }) => <Link key={slug} to={`/documentation/${slug}`} className="glass-card group p-6 transition hover:-translate-y-0.5 hover:border-violet-400/25"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]"><Icon className="h-5 w-5 text-violet-300" /></div><span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-slate-400">{status}</span></div><h2 className="mt-5 text-xl font-bold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p><div className="mt-5 flex items-center gap-2 text-sm font-semibold text-violet-300">Read documentation <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div></Link>)}
    </div>
    {!filtered.length && <div className="glass-card p-8 text-center text-sm text-slate-400">No documentation sections match <strong className="text-slate-200">{query}</strong>.</div>}
  </div>
}

export function DocumentationArticlePage() {
  const { section } = useParams()
  const index = sections.findIndex(item => item.slug === section)
  const current = sections[index]
  if (!current) return <div className="glass-card p-10"><h1 className="text-2xl font-bold text-white">Documentation not found</h1><Link className="mt-4 inline-flex text-violet-300" to="/documentation">Back to documentation</Link></div>
  const previous = sections[index - 1]
  const next = sections[index + 1]
  return <div className="pb-10">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link to="/documentation" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to docs</Link><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{current.status}</span></div>
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-24 space-y-2"><p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">On this page</p>{headings[current.slug].map(([id, title]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200">{title}</a>)}</div></aside>
      <article className="min-w-0"><header className="mb-9"><div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200"><current.icon className="h-3.5 w-3.5" /> {current.title}</div><h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">{current.title}</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">{current.description}</p></header>{renderArticle(current.slug)}<nav className="mt-10 grid gap-3 sm:grid-cols-2">{previous ? <Link to={`/documentation/${previous.slug}`} className="glass-card p-4"><span className="text-xs text-slate-500">Previous</span><span className="mt-1 flex items-center gap-2 font-semibold text-white"><ArrowLeft className="h-4 w-4" />{previous.title}</span></Link> : <span />}{next ? <Link to={`/documentation/${next.slug}`} className="glass-card p-4 text-right"><span className="text-xs text-slate-500">Next</span><span className="mt-1 flex items-center justify-end gap-2 font-semibold text-white">{next.title}<ArrowRight className="h-4 w-4" /></span></Link> : <span />}</nav></article>
    </div>
  </div>
}

function renderArticle(slug: string): ReactNode {
  const articles: Record<string, () => ReactNode> = {
    'getting-started': GettingStarted, library: Library, launching: Launching,
    integrations: Integrations, account: Account, 'cloud-sync': CloudSync,
    development: Development, reference: Reference,
  }
  return articles[slug]?.() ?? null
}

function GettingStarted() { return <div className="space-y-9">
  <Section id="overview" title="1. What you are installing"><p>Mochi is a desktop game launcher. It does not replace Steam, Heroic, Lutris, Bottles, itch.io, Flatpak, or the games themselves. Instead, it gives those games a single library and launches them using the appropriate target or source launcher.</p><Callout icon={CheckCircle2} title="Local first">A Mochi account and Mochi Cloud are optional. Your local library and game installations remain on the device.</Callout></Section>
  <Section id="first-launch" title="2. First-launch setup"><p>The guided setup is split into Welcome, Account, IGDB, and Game Imports. Account and IGDB configuration are optional. The import stage detects supported sources and lets you select what to scan.</p><p>Setup remembers completion locally. It can be reset from Mochi's app-data controls.</p></Section>
  <Section id="importing" title="3. Import existing games"><p>Mochi can detect and scan existing game sources instead of requiring every game to be added manually.</p><ul className="list-disc space-y-2 pl-6"><li><strong>Steam</strong> — installed Steam games and Steam non-Steam shortcuts.</li><li><strong>Heroic Games Launcher</strong> — installed Epic, GOG, and Amazon games represented in Heroic's local configuration.</li><li><strong>Lutris</strong> — existing Lutris games and launch configurations.</li><li><strong>Bottles</strong> — programs exposed by Bottles.</li><li><strong>itch.io</strong> — games represented by itch receipts.</li><li><strong>Flatpak</strong> — installed Flatpak applications categorised as games.</li></ul><p>Imports are non-destructive: Mochi records a launch target and installation information rather than moving or taking ownership of the source installation.</p></Section>
  <Section id="add-game" title="4. Add a game manually"><p>For a custom game, choose the target with the native file picker or enter a supported target manually. Linux can also select an installed Flatpak by application ID.</p><p>If IGDB credentials are configured, the add flow moves from the initial form to a separate matching step rather than silently guessing the game's identity.</p></Section>
  <Section id="identify" title="5. Identify a game with IGDB"><p>Mochi searches for up to six likely IGDB candidates. Each candidate can provide a name, summary, cover/artwork, genres, and release information. You can approve the proposed match or choose another result. You can also continue without metadata.</p></Section>
  <Section id="tofu" title="6. Create and use a Tofu"><p>A Piko is the game identity; a Tofu is an environment or configuration for running that game. A Piko can contain multiple Tofus, which is useful for separate versions, profiles, or future runtime configurations.</p></Section>
  <Section id="play" title="7. Launch and play"><p>Launching a Piko calls the native backend. The launcher can track playtime around a launch and expose recent playtime through the tray and library experience.</p></Section>
  <Section id="troubleshooting" title="8. Troubleshooting"><p>If a launch fails, first verify the target still exists and that its owning launcher is installed and available. For imported games, the source application's own runtime, prefix, authentication, or configuration may still be required.</p><p>For support reports, include the OS, Mochi version, source or launch-target type, and the exact error message.</p></Section>
</div> }

function Library() { return <div className="space-y-9">
  <Section id="model" title="1. Piko + Tofu"><Diagram title="Core library model"><div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"><Box title="Piko" >Game identity</Box><ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" /><div className="text-slate-600 sm:hidden">↓</div><Box title="Tofu" >Environment / instance</Box></div></Diagram><p><strong>Piko</strong> answers “what game is this?” while <strong>Tofu</strong> answers “how is this instance configured or run?”</p></Section>
  <Section id="piko" title="2. Pikos"><p>A Piko contains the game's name, description, accent/artwork, categories, source information, launch target, and its Tofus. Source-aware imports can retain a source ID such as Steam, Heroic, Lutris, Bottles, itch.io, or Flatpak.</p></Section>
  <Section id="tofu" title="3. Tofus"><p>A Tofu contains a name, game version, runtime, content/mod count, status, and optional install path. The install path is especially important for local content management and is not assumed to be portable between computers.</p></Section>
  <Section id="sources" title="4. Game sources"><p>Source integrations discover existing installations without taking ownership of them. Steam shortcuts, for example, are launched through Steam so Steam keeps control of its launch context.</p></Section>
  <Section id="categories" title="5. Categories"><p>Library search matches names, descriptions, and categories. The interface can group games using their category information. IGDB genres can be used as metadata categories when accepted.</p></Section>
  <Section id="metadata" title="6. Metadata"><p>Metadata is enrichment, not ownership. Artwork, summaries, genres, and release information can make a Piko easier to identify while the underlying installation remains local.</p></Section>
  <Section id="local" title="7. Local storage"><p>The current desktop frontend stores the local Piko library and launcher preferences in browser local storage. Native application state such as playtime, themes, and the configured Mochi data directory is handled by the Tauri/Rust layer.</p></Section>
  <Section id="paths" title="8. Machine-specific paths"><Callout title="Paths are not portable">A local executable or Tofu directory can be valid on one machine and invalid on another. Cloud metadata does not magically make a local installation available elsewhere.</Callout></Section>
</div> }

function Launching() { return <div className="space-y-9">
  <Section id="targets" title="1. Supported launch targets"><p>The frontend normalises launch targets before passing them to the native layer. Linux currently supports file targets, Flatpak targets, and custom source-aware targets.</p><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-slate-400"><tr><th className="p-3">Target</th><th className="p-3">Linux behaviour</th><th className="p-3">macOS</th></tr></thead><tbody className="divide-y divide-white/10 text-slate-300"><tr><td className="p-3">Executable</td><td className="p-3">Direct process launch</td><td className="p-3">Direct process launch</td></tr><tr><td className="p-3">.desktop</td><td className="p-3">gio launch, xdg-open fallback</td><td className="p-3">Not a dedicated path</td></tr><tr><td className="p-3">Flatpak</td><td className="p-3">flatpak run</td><td className="p-3">Unavailable</td></tr><tr><td className="p-3">.sh / .bash</td><td className="p-3">sh</td><td className="p-3">sh</td></tr><tr><td className="p-3">.py / .js</td><td className="p-3">python3 / node</td><td className="p-3">Not explicitly handled by platform adapter</td></tr></tbody></table></div></Section>
  <Section id="executable" title="2. Executables"><p>Ordinary file targets are passed to the operating system as processes. Mochi does not construct a shell command string for a normal executable target.</p></Section>
  <Section id="desktop" title="3. .desktop files"><p>Linux desktop entries are launched through <code>gio launch</code>, with <code>xdg-open</code> as a fallback. This lets the desktop environment resolve the application entry.</p></Section>
  <Section id="flatpak" title="4. Flatpak"><p>Linux can discover installed Flatpaks and categorise them using their application metadata. Game Flatpaks are prioritised in the picker. Mochi stores a normalised <code>flatpak://application.id</code> target and invokes <code>flatpak run</code> at launch.</p></Section>
  <Section id="scripts" title="5. Scripts"><p>Linux supports <code>.sh</code> and <code>.bash</code> through <code>sh</code>, <code>.py</code> through <code>python3</code>, and <code>.js</code> through <code>node</code>. macOS explicitly handles shell scripts and otherwise launches the selected target directly.</p></Section>
  <Section id="sources" title="6. Source-launcher handoff"><p>Imported games may use source-specific targets so the original launcher remains responsible for its environment.</p><ul className="list-disc space-y-2 pl-6"><li>Steam: <code>steam://rungameid/…</code></li><li>Heroic: Heroic launch URI</li><li>Lutris: <code>lutris:rungameid/…</code></li><li>Bottles: <code>bottles:run/…</code></li><li>itch.io: itch game launch integration</li></ul></Section>
  <Section id="tracked" title="7. Playtime tracking"><p>The tracked launch command starts a playtime session when launching a game. Playtime is stored by the native layer and can be shown in Mochi's activity/tray experience. The tray menu also lists up to five most-played games.</p></Section>
  <Section id="platforms" title="8. Platform behaviour"><p>Linux is the primary development platform and has the broadest integrations. macOS has its own native adapter with executable, shell-script, and application-bundle launching. Unsupported platforms use a fallback adapter rather than pretending that Linux-specific functionality exists.</p></Section>
  <Section id="errors" title="9. Errors"><p>Common failures include missing executables, unavailable source launchers, invalid Flatpak IDs, missing runtimes such as Python/Node, or inaccessible paths. The native backend returns an error rather than silently claiming that the launch succeeded.</p></Section>
</div> }

function Integrations() { return <div className="space-y-9">
  <Section id="overview" title="1. Integration model"><p>Integrations enrich or manage existing local games; they are not intended to turn Mochi into a replacement store. The launcher should remain useful if an external service is offline or unavailable.</p></Section>
  <Section id="igdb" title="2. IGDB"><p>IGDB is used for optional game identification and metadata. The current website-backed flow can securely use Twitch application credentials through the Mochi provider-credential backend.</p><Callout icon={KeyRound} title="Credentials are sensitive">Twitch client secrets, bearer credentials, and other provider secrets must never be committed to source code or public issues.</Callout></Section>
  <Section id="matching" title="3. Matching and confirmation"><p>When adding a game with IGDB configured, Mochi requests up to six likely candidates. The user explicitly approves the selected identity or chooses another candidate. This avoids trusting a game name as a unique identifier.</p></Section>
  <Section id="modrinth" title="4. Modrinth"><p>Mochi now includes a Modrinth workspace for Minecraft Tofus. Users can search Modrinth for <strong>mods, resource packs, and shaders</strong>, filter by Minecraft version and loader, inspect installed content, and manage files inside a Tofu.</p><p>The Discover view also surfaces popular <strong>mods, modpacks, resource packs, and shaders</strong>, with project details and version information.</p><p>Modrinth downloads are restricted by the native backend to the official <code>cdn.modrinth.com</code> host before a download is started.</p></Section>
  <Section id="downloads" title="5. Background downloads"><p>Modrinth downloads run through the native layer and expose progress, completion, and failure state. Downloads can continue while Mochi is hidden in the tray. Completed entries are retained for ten minutes before cleanup.</p></Section>
  <Section id="credentials" title="6. Provider credentials">
  <p>The current provider system supports IGDB and Nexus Mods credentials. Saved secrets are handled server-side and status checks reveal whether a credential is configured without returning the secret itself.</p>
  <Section id="nexus-api-key" title="Adding your Nexus Mods API key">
    <p>Mochi's Nexus Mods integration uses a <strong>Personal API Key</strong>. Do not use an API key belonging to another application, such as an application-specific key shown for a registered mod manager or integration. The Personal API Key is the user-level key intended for personal/testing API access.</p>
    <p><strong>1. Open the Nexus Mods API keys page.</strong> Sign in to your Nexus Mods account, then open <a href="https://www.nexusmods.com/settings/api-keys" target="_blank" rel="noreferrer">Nexus Mods → API Keys</a>. If Nexus Mods asks you to sign in again, complete that first.</p>
    <p><strong>2. Find the “Personal API Key” section.</strong> The API keys page contains multiple keys and application-specific entries. For Mochi, scroll to the <strong>Personal API Key</strong> section, which is the user-level key for your own Nexus Mods account. <strong>This is the key you should copy into Mochi.</strong></p>
    <Callout icon={KeyRound} title="Use this exact key">Choose <strong>Personal API Key</strong>. Do not copy a key labelled for Mod Organizer 2, Vortex, another registered application, or another third-party tool. Mochi's API credential field expects the value of your Personal API Key.</Callout>
    <p><strong>3. Generate or reveal the Personal API Key.</strong> If you do not already have a Personal API Key, use the control provided in that section to generate one. If Nexus Mods displays an existing key, use the copy control and copy the entire key exactly as shown. Never add quotes, spaces, or other text around it.</p>
    <p>Mochi checks that the key contains at least 32 printable characters with no spaces or line breaks, then asks Nexus Mods to validate it before storing. This catches incomplete, malformed, and revoked keys before they can break game discovery.</p>
    <p><strong>4. Open Mochi.</strong> Go to <strong>Dashboard → API</strong> and find the <strong>Nexus Mods</strong> card. This is separate from the IGDB credentials below it.</p>
    <p><strong>5. Paste the key into the Nexus Mods credential field.</strong> Paste the complete Personal API Key into the Nexus Mods API key field. You do not need to enter your Nexus Mods username or password, and you should not paste an IGDB Client ID or Client Secret into this field.</p>
    <p><strong>6. Save the credential.</strong> Select the save button on the Nexus Mods card. Mochi sends the credential through its secure provider-credential flow. The saved secret is not displayed again in the normal settings interface; Mochi only reports whether the Nexus credential is configured.</p>
    <p><strong>7. Verify it is configured.</strong> After saving, the Nexus Mods card should show <strong>Configured</strong>. If it still shows <strong>Not configured</strong> or an error appears, check that you copied the <strong>Personal API Key</strong> in full and try again.</p>
    <Callout title="Keep your key private">Treat the Personal API Key like a password. Do not paste it into GitHub issues, Discord, screenshots, bug reports, source code, or chat messages. If you believe the key has been exposed, revoke/regenerate it from the Nexus Mods API keys page and then replace the credential in Mochi.</Callout>
    <p><strong>Nexus Mods API policy:</strong> Nexus Mods states that Personal API Keys are intended for experimentation, testing builds, and personal-use applications. Public-facing applications intended for wider use should follow Nexus Mods' application registration process instead of relying on users' Personal API Keys. See the <a href="https://help.nexusmods.com/article/114-api-acceptable-use-policy" target="_blank" rel="noreferrer">Nexus Mods API Acceptable Use Policy</a> for the current requirements.</p>
  </Section>
</Section>
  <Section id="limits" title="7. Integration boundaries"><p>External APIs can fail, rate-limit, change their responses, or become unavailable. Mochi's core library and local launching should not depend on an integration being healthy.</p></Section>
</div> }

function Account() { return <div className="space-y-9">
  <Section id="methods" title="1. Authentication"><p>The desktop launcher supports email/password, email sign-in codes, Google, and GitHub authentication. Email verification can return to the desktop application through a <code>mochi://</code> deep link.</p></Section>
  <Section id="switching" title="2. Account switching"><p>Mochi can remember up to five signed-in accounts locally. Switching restores the selected account session; invalid saved sessions are removed and require signing in again.</p><Callout title="Local session storage">Saved account session material is local application state. It should be treated as sensitive and must not be copied into bug reports or shared.</Callout></Section>
  <Section id="sessions" title="3. Sessions"><p>The authentication client persists sessions and listens for authentication changes. Signing in to an account does not automatically enable cloud synchronisation.</p></Section>
  <Section id="totp" title="4. TOTP MFA"><p>TOTP is Mochi's native authenticator-app multi-factor method. Enrollment provides a QR/manual secret and requires a six-digit verification code before the factor becomes active.</p></Section>
  <Section id="passkeys" title="5. Passkeys"><p>Passkeys use WebAuthn and provide a separate passwordless/security-key style authentication method. They are managed independently from TOTP factors.</p></Section>
  <Section id="identities" title="6. Connected identities"><p>The account UI can manage connected Google and GitHub identities. This lets an account maintain provider-based access without creating unrelated Mochi accounts for each identity.</p></Section>
  <Section id="profile" title="7. Profiles and avatars"><p>Profile information includes user-facing display information and an optional avatar URL. The launcher can fall back to a Gravatar-derived avatar or local initials when a custom/provider avatar is unavailable.</p></Section>
  <Section id="credentials" title="8. Credential security"><p>Provider secrets such as IGDB/Twitch and Nexus Mods credentials are deliberately separate from ordinary library metadata. The backend credential store is designed so saved secrets are not returned to the normal launcher settings view.</p></Section>
</div> }

function CloudSync() { return <div className="space-y-9">
  <Section id="principles" title="1. Local first, cloud optional"><p>Mochi Cloud is an optional companion to the desktop library. The cloud system is for supported metadata, not game-file backup.</p></Section>
  <Section id="access" title="2. Cloud access"><p>Cloud use is permissioned per account. An account can be eligible for metadata access while still keeping actual synchronisation disabled. Administrative controls can enable or disable eligibility and sync separately.</p></Section>
  <Section id="data" title="3. Synchronised data"><p>The current library model synchronises supported profile/Piko/Tofu metadata: names, descriptions, artwork/accents, categories, source information, launch metadata, Tofu names, versions, runtimes, counts, and statuses as represented by the cloud schema.</p><p>Machine-specific files and complete game installations are outside this boundary.</p></Section>
  <Section id="pull" title="4. Pull behaviour"><p>When a signed-in launcher starts cloud synchronisation, it pulls the account's Pikos and their Tofus. If cloud data exists, it becomes the current library state.</p></Section>
  <Section id="push" title="5. Push behaviour"><p>If the cloud library is empty during initial synchronisation, the local library can be used as the initial cloud state. Later local library changes are pushed after synchronisation has been initialised.</p></Section>
  <Section id="ownership" title="6. Ownership and row-level security"><p>Cloud records are account-scoped. Database row-level security and server-side functions are used to restrict access to the owning user and authorised administrative operations.</p></Section>
  <Section id="local" title="7. The local boundary"><Diagram title="Data boundary"><div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"><Box title="Local machine" >Installations, paths, native files</Box><ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" /><Box title="Mochi Cloud" >Supported metadata</Box></div></Diagram><p>A synced Piko can arrive on another device, but the device still needs a valid local installation and launch target before that game can actually run.</p></Section>
  <Section id="failure" title="8. Failure handling"><p>Cloud errors set the launcher into an error state rather than pretending the library is synchronised. The local library remains the primary fallback.</p></Section>
</div> }

function Development() { return <div className="space-y-9">
  <Section id="stack" title="1. Technology stack"><div className="grid gap-3 sm:grid-cols-2"><Box title="React + TypeScript">Desktop UI</Box><Box title="Tauri 2">Desktop boundary</Box><Box title="Rust">Native/platform layer</Box><Box title="Vite">Frontend build</Box><Box title="Supabase">Auth + cloud metadata</Box><Box title="Modrinth API">Minecraft content discovery</Box></div></Section>
  <Section id="architecture" title="2. Application architecture"><Diagram title="Main boundary"><div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"><Box title="React UI" >Library, settings, account</Box><ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" /><Box title="src/lib" >Small typed wrappers</Box><ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" /><Box title="Tauri commands" >Native operations</Box><ArrowRight className="hidden h-5 w-5 text-slate-600 sm:block" /><Box title="Rust adapters" >OS/source integration</Box></div></Diagram></Section>
  <Section id="frontend" title="3. Frontend"><p><code>src/App.tsx</code> owns the main launcher experience. Focused libraries under <code>src/lib/</code> wrap cloud, authentication, IGDB, Modrinth, platform, source, provider-credential, and theme behaviour.</p><p>Reusable setup/import/content components live under <code>src/components/</code>.</p></Section>
  <Section id="native" title="4. Tauri and Rust"><p><code>src-tauri/src/main.rs</code> registers native commands for launching, source discovery, playtime, themes, notifications, and Modrinth file management. Rust owns operations that require local filesystem/process access.</p></Section>
  <Section id="platforms" title="5. Platform adapters"><p><code>src-tauri/src/platform/</code> isolates Linux, macOS, and unsupported-platform behaviour. Linux currently exposes Flatpak support and source-aware launching; macOS exposes application-bundle and shell-script handling.</p></Section>
  <Section id="sources" title="6. Source adapters"><p><code>src-tauri/src/sources/</code> separates game discovery from the operating-system launch layer. Linux currently scans Flatpak, Steam, Steam shortcuts, Heroic, Lutris, Bottles, and itch.io state.</p></Section>
  <Section id="themes" title="7. Theme system"><p>Mochi includes built-in themes and a user theme system. Users can import a single <code>theme.json</code> file or a complete theme folder containing CSS and assets. Theme data lives in the Mochi configuration area and can be moved to another directory.</p></Section>
  <Section id="local" title="8. Local development"><p>Install Node.js, npm, Rust/Cargo, Tauri's native dependencies, and the platform tools needed for the features you are testing. Run <code>npm install</code>, then <code>npm run tauri dev</code> for the desktop application or <code>npm run dev</code> for frontend-only work.</p></Section>
  <Section id="build" title="9. Builds"><p><code>npm run build</code> creates the frontend production build. <code>npm run tauri build</code> creates desktop packages for the target platform. CI checks the project and the release workflow uses version tags.</p></Section>
</div> }

function Reference() { return <div className="space-y-9">
  <Section id="glossary" title="1. Glossary"><dl className="space-y-4"><div><dt className="font-semibold text-white">Piko</dt><dd className="text-slate-400">The top-level identity of a game in Mochi.</dd></div><div><dt className="font-semibold text-white">Tofu</dt><dd className="text-slate-400">An environment, instance, or configuration belonging to a Piko.</dd></div><div><dt className="font-semibold text-white">Launch target</dt><dd className="text-slate-400">The executable, URI, desktop entry, Flatpak reference, or script target passed to the native launcher.</dd></div><div><dt className="font-semibold text-white">Source</dt><dd className="text-slate-400">An external game manager or installation system from which Mochi can discover games.</dd></div><div><dt className="font-semibold text-white">Mochi Cloud</dt><dd className="text-slate-400">Optional account-scoped synchronisation of supported metadata.</dd></div><div><dt className="font-semibold text-white">TOTP</dt><dd className="text-slate-400">Time-based one-time passwords from an authenticator application.</dd></div></dl></Section>
  <Section id="platforms" title="2. Platform matrix"><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/[0.03] text-slate-400"><tr><th className="p-3">Platform</th><th className="p-3">Status</th><th className="p-3">Notable native features</th></tr></thead><tbody className="divide-y divide-white/10 text-slate-300"><tr><td className="p-3">Linux</td><td className="p-3">Primary</td><td className="p-3">Flatpak, source imports, source handoff, .desktop, scripts, startup, notifications</td></tr><tr><td className="p-3">macOS</td><td className="p-3">Development</td><td className="p-3">Executable, .app, shell scripts</td></tr><tr><td className="p-3">Other</td><td className="p-3">Fallback</td><td className="p-3">No Linux-specific integration assumed</td></tr></tbody></table></div></Section>
  <Section id="targets" title="3. Launch matrix"><p>Linux supports native executables, <code>.desktop</code>, Flatpak IDs, <code>.sh</code>/<code>.bash</code>, <code>.py</code>, <code>.js</code>, and source-specific URIs. macOS supports executables, <code>.app</code>, and shell scripts.</p></Section>
  <Section id="storage" title="4. Storage"><p>The frontend keeps the local library and launcher preferences in browser local storage. The native layer manages its application configuration/data directory, themes, playtime data, and location marker. The user can move the Mochi data directory from settings.</p></Section>
  <Section id="states" title="5. Feature states"><p><strong>Current</strong> means implemented in the current launcher or website. <strong>Reference</strong> means architectural or explanatory documentation. Roadmap items are directional and are not evidence that a feature is currently implemented.</p></Section>
  <Section id="troubleshooting" title="6. Troubleshooting checklist"><ul className="list-disc space-y-2 pl-6"><li>Confirm the game/source application is installed.</li><li>Confirm a local target or Tofu path still exists.</li><li>For Steam/Heroic/Lutris/Bottles/itch games, verify the source launcher itself can launch the game.</li><li>For Flatpak, verify the application ID with <code>flatpak list</code>.</li><li>For scripts, verify the relevant runtime is installed.</li><li>For Modrinth content, verify the Tofu has an install path and the requested version/loader has a compatible file.</li><li>For account/cloud issues, distinguish authentication problems from cloud-eligibility or synchronisation problems.</li></ul></Section>
</div> }
