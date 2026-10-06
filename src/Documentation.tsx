import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'

const sections = [
  { slug: 'getting-started', title: 'Getting Started', description: 'Installation, first launch, adding games, Pikos, Tofus, launching, and the local-first workflow.' },
  { slug: 'account', title: 'Account Management', description: 'Identity, sign-in, sessions, profiles, security, permissions, and cloud access.' },
  { slug: 'pikos-tofus', title: 'Pikos & Tofus', description: 'The core Mochi model for games, environments, configurations, and metadata.' },
  { slug: 'cloud-sync', title: 'Cloud Sync', description: 'Local-first storage, synchronisation, database relationships, RLS, and failure handling.' },
]

const headingMap: Record<string, Array<[string,string]>> = {
  'getting-started': [['overview','Overview'],['architecture','How Mochi fits together'],['requirements','Requirements'],['installation','Installation'],['first-launch','First launch'],['add-game','Adding a game'],['igdb','IGDB metadata'],['launch-targets','Launch targets'],['tofu','Creating a Tofu'],['launching','Launching games'],['local-first','Local-first behaviour'],['limitations','Current limitations']],
  account: [['model','Account model'],['architecture','Account architecture'],['signin','Sign-in methods'],['sessions','Sessions & persistence'],['profiles','Profiles'],['security','Security & 2FA'],['cloud-access','Cloud access'],['data-flow','Authentication flow']],
  'pikos-tofus': [['concepts','Core concepts'],['architecture','The Piko → Tofu hierarchy'],['piko','Piko model'],['tofu','Tofu model'],['relationships','Relationships'],['examples','Example library'],['storage','Local storage'],['identity','Stable identity'],['future','Future expansion']],
  'cloud-sync': [['principles','Design principles'],['architecture','Cloud architecture'],['data','Synchronised data'],['pull','Pull behaviour'],['push','Push behaviour'],['database','Database structure'],['security','Access control'],['identifiers','Identity & ownership'],['failure','Failure handling'],['conflicts','Conflict handling']],
}

export function DocumentationPage() {
  return <div className="space-y-8 pb-10">
    <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-200">Documentation</p><h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Mochi Documentation</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">Formal technical and user documentation for the Mochi launcher. Select a section to understand its architecture, terminology, account system, game model, and cloud behaviour.</p></div>
    <div className="grid gap-5 md:grid-cols-2">{sections.map(s => <Link key={s.slug} to={`/documentation/${s.slug}`} className="glass-card group block p-6 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/[0.05]"><div className="flex justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Documentation</p><h2 className="mt-2 text-xl font-bold text-white">{s.title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{s.description}</p></div><ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 group-hover:translate-x-1 group-hover:text-violet-300" /></div></Link>)}</div>
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <h2 className="text-xl font-bold text-white">A note about this documentation</h2>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-400">Mochi is actively being built. These pages intentionally separate the current implementation from planned architecture. A feature described as planned should not be interpreted as available in the current build.</p>
    </div>
  </div>
}

function Diagram({title,children}:{title:string,children:ReactNode}) {
  return <div className="my-7 rounded-2xl border border-white/10 bg-black/20 p-5">
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">{title}</p>
    <div className="overflow-x-auto">{children}</div>
  </div>
}

function Box({title,children,muted=false}:{title:string,children?:ReactNode,muted?:boolean}) {
  return <div className={`min-w-[150px] rounded-xl border px-4 py-3 text-center ${muted?'border-white/10 bg-white/[0.03]':'border-violet-400/25 bg-violet-500/[0.07]'}`}><p className="text-sm font-semibold text-white">{title}</p>{children && <p className="mt-1 text-xs leading-5 text-slate-400">{children}</p>}</div>
}

export function DocumentationArticlePage() {
  const { section: slug } = useParams()
  const index = Math.max(0, sections.findIndex(s => s.slug === slug))
  const current = sections[index]
  const previous = sections[index - 1]
  const next = sections[index + 1]
  const headings = headingMap[current.slug]
  return <div className="grid gap-10 pb-10 lg:grid-cols-[245px_minmax(0,1fr)]">
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto"><div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="mb-4 flex items-center justify-between">{previous ? <Link to={`/documentation/${previous.slug}`} className="text-xs text-slate-400 hover:text-white">← Previous</Link> : <Link to="/documentation" className="text-xs text-slate-400 hover:text-white">← Docs</Link>}{next && <Link to={`/documentation/${next.slug}`} className="text-xs text-slate-400 hover:text-white">Next →</Link>}</div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Documentation</p>
      <nav className="space-y-1">{sections.map(s => <Link key={s.slug} to={`/documentation/${s.slug}`} className={`block rounded-lg px-3 py-2 text-sm ${s.slug===current.slug?'bg-violet-500/15 font-semibold text-white':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{s.title}</Link>)}</nav>
      <div className="my-4 border-t border-white/10" />
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">On this page</p>
      <nav className="space-y-0.5">{headings.map(([id,label]) => <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-slate-500 hover:bg-white/5 hover:text-slate-200">{label}</button>)}</nav>
    </div></aside>
    <article id="top" className="min-w-0 max-w-4xl"><header className="mb-10 border-b border-white/10 pb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">Mochi Documentation</p><h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">{current.title}</h1><p className="mt-4 text-lg leading-8 text-slate-300">{current.description}</p></header>
      {current.slug==='getting-started' && <GettingStarted/>}{current.slug==='account' && <Account/>}{current.slug==='pikos-tofus' && <PikosTofus/>}{current.slug==='cloud-sync' && <CloudSync/>}
      <div className="mt-14 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">{previous?<Link to={`/documentation/${previous.slug}`} className="rounded-2xl border border-white/10 p-4 hover:border-white/20"><span className="text-xs text-slate-500">Previous</span><strong className="mt-1 block text-white">← {previous.title}</strong></Link>:<div/>}{next?<Link to={`/documentation/${next.slug}`} className="rounded-2xl border border-white/10 p-4 text-right hover:border-white/20"><span className="text-xs text-slate-500">Next</span><strong className="mt-1 block text-white">{next.title} →</strong></Link>:<div/>}</div>
      <div className="mt-4 text-center"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs text-slate-500 hover:text-white">Back to top ↑</button></div>
    </article>
  </div>
}

function Section({id,title,children}:{id:string,title:string,children:ReactNode}) { return <section id={id} className="scroll-mt-28 border-b border-white/10 pb-9 pt-2"><h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2><div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-300">{children}</div></section> }

function GettingStarted(){return <div className="space-y-9">
<Section id="overview" title="1. Overview">
  <p>Mochi is a Linux-first desktop game launcher designed to put a user's game library, launch configurations, account tools, and launcher utilities behind one consistent interface. The most important architectural idea is that the local library remains useful on its own. Online services add capabilities; they are not supposed to become the foundation of every local action.</p>
  <p>The project is built around a React and TypeScript interface, Vite for the frontend toolchain, Tauri 2 for the desktop shell, and Rust for native operating-system responsibilities. This split lets the UI remain flexible while native operations such as process launching and filesystem integration can be kept outside the browser environment.</p>
  <p>Two terms are central to understanding the launcher: a <strong>Piko</strong> represents a game, while a <strong>Tofu</strong> represents one way that game is configured to run.</p>
</Section>
<Section id="architecture" title="2. How Mochi fits together">
  <p>Mochi is deliberately split into layers. The UI should describe what the user wants to do; the native layer should perform operating-system work; local storage should preserve the library; and optional account/cloud services should synchronise supported metadata.</p>
  <Diagram title="High-level Mochi architecture">
    <div className="flex min-w-[850px] flex-col items-center gap-3 text-xs">
      <Box title="Mochi UI">React + TypeScript · library · settings · account</Box>
      <div className="text-slate-500">↓ UI requests</div>
      <Box title="Tauri 2">Desktop application shell · native bridge</Box>
      <div className="text-slate-500">↓ native commands</div>
      <div className="flex items-stretch gap-3">
        <Box title="Rust / OS integration" muted>process launching · file dialogs · Flatpak discovery · filesystem access</Box>
        <div className="flex items-center text-slate-500">↔</div>
        <Box title="Local application data" muted>Pikos · Tofus · launcher settings · IGDB configuration</Box>
      </div>
      <div className="flex items-center gap-4 text-slate-500"><span>↙</span><span>↘</span></div>
      <div className="flex items-center gap-3">
        <Box title="Local machine" muted>games · executables · .desktop files · scripts · Flatpak apps</Box>
        <Box title="Optional cloud" muted>account identity · metadata sync · access control</Box>
      </div>
    </div>
  </Diagram>
  <p>This architecture also explains why a game installation itself is not the same thing as cloud data. A multi-gigabyte game can stay on the user's computer while a small amount of metadata describing that game is synchronised.</p>
</Section>
<Section id="requirements" title="3. Requirements">
  <p>The current development stack uses React 18, TypeScript, Vite, Tauri 2, Rust, and Cargo. A developer needs Node.js/npm for the frontend and a working Rust toolchain for the desktop application.</p>
  <p>Linux is the primary target during development. The project is intended to become broader than Linux, but Windows and macOS should be treated as future platform targets until their native integrations are implemented and tested.</p>
  <p>Native Tauri dependencies also vary by operating system. A successful frontend build does not necessarily mean a machine has everything required to package or run the native desktop application.</p>
</Section>
<Section id="installation" title="4. Installation">
  <p>For a development checkout, install dependencies with <code>npm install</code>. Use <code>npm run dev</code> when working on the web interface alone, or <code>npm run tauri dev</code> when testing the actual desktop shell and native integration.</p>
  <p>Use <code>npm run build</code> to verify the frontend production build. Use <code>npm run tauri build</code> for a packaged desktop build once the native environment is configured correctly.</p>
  <div className="rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs leading-6 text-slate-300"><p>$ npm install</p><p>$ npm run tauri dev</p><p>$ npm run build</p><p>$ npm run tauri build</p></div>
</Section>
<Section id="first-launch" title="5. First launch">
  <p>Mochi starts from a local library model. The launcher can display Pikos, select their Tofus, expose launcher preferences, and provide account functionality when the account service is configured.</p>
  <p>The frontend currently persists local state using browser storage. The long-term native boundary is intended to take over filesystem-sensitive responsibilities without changing the conceptual Piko/Tofu model presented to the user.</p>
  <p>Being local-first means a user should not need to upload an entire game library to make the launcher useful. Network-dependent features can fail while local library operations continue.</p>
</Section>
<Section id="add-game" title="6. Adding a game">
  <p>When a user adds a game manually, Mochi creates a Piko representing that game and associates a default Tofu with it. The launch target can now be selected through a native file dialog rather than requiring the user to type a path manually.</p>
  <p>The add-game flow accepts a normal executable or launcher path and is being extended around Linux-native launch targets. Flatpak games can also be selected from a picker populated by Mochi's native Flatpak discovery command.</p>
  <Diagram title="Game addition flow">
    <div className="flex min-w-[900px] items-center justify-center gap-2 text-xs">
      <Box title="Add a Piko" /><span>→</span><Box title="Name + launch target" /><span>→</span><Box title="Optional IGDB match" muted/><span>→</span><Box title="Confirmed Piko" /><span>→</span><Box title="Default Tofu" /><span>→</span><Box title="Library" />
    </div>
  </Diagram>
</Section>
<Section id="launch-targets" title="7. Launch targets">
  <p>A launch target is the value Mochi passes to the native launcher when the user presses Play. It is deliberately broader than an executable path: the target may be an executable, a <code>.desktop</code> file, a script, or a Flatpak application reference.</p>
  <p>The current desktop build sends the target to the Tauri <code>launch_game</code> command. On Linux, <code>.desktop</code> files use <code>gio launch</code> with an <code>xdg-open</code> fallback; Flatpak references use <code>flatpak run</code>; <code>.sh</code>/<code>.bash</code>, <code>.py</code>, and <code>.js</code> use <code>sh</code>, <code>python3</code>, and <code>node</code>. Other targets are spawned directly. Installed-Flatpak discovery is currently Linux-only.</p>
  <p>The native file dialog is provided by the Tauri dialog plugin. On Linux, Flatpak discovery asks the installed <code>flatpak</code> command for application IDs and names, then reads application metadata to classify entries as <strong>Games</strong> or <strong>Other</strong>. Games are sorted ahead of other installed applications in the picker.</p>
  <Diagram title="Choosing a launch target">
    <div className="flex min-w-[900px] items-center justify-center gap-3 text-xs">
      <Box title="Launch target" />
      <span>↙</span><Box title="Native file picker" muted>executable · .desktop · script</Box>
      <span>or</span><Box title="Flatpak picker" muted>installed Flatpaks · Games first</Box>
    </div>
  </Diagram>
</Section>
<Section id="igdb" title="7. IGDB metadata">
  <p>When an IGDB API configuration is provided, Mochi can use it to improve the metadata associated with a game. The intended user experience is deliberately confirmable rather than silently guessing.</p>
  <p>After the user supplies the game, Mochi can present candidates returned by IGDB. The current lookup requests up to six candidates and includes the game name, summary, cover/artwork URLs, genres, and first release date. The user can approve a candidate or choose a different match instead of silently accepting an external guess.</p>
  <p>IGDB does not use a single permanent API key in the same way as some services. Its API authentication uses a Twitch developer application: you register an application, obtain a <strong>Client ID</strong> and <strong>Client Secret</strong>, then use those credentials to obtain a Twitch OAuth access token for IGDB requests. IGDB's official getting-started guide requires a Twitch account with 2FA enabled and recommends a <code>Confidential</code> application so a client secret can be generated.</p>
  <p><strong>How to get your IGDB credentials:</strong></p>
  <ol className="list-decimal space-y-2 pl-6">
    <li>Create or sign in to a Twitch account and enable 2FA.</li>
    <li>Open the <a href="https://dev.twitch.tv/console/apps/create" target="_blank" rel="noreferrer" className="text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-white">Twitch Developer Console</a> and register a new application.</li>
    <li>Use <code>localhost</code> as the OAuth redirect URL if the console requires one for this IGDB setup, then create the application.</li>
    <li>Open the application in the Developer Console, copy the <strong>Client ID</strong>, and generate a <strong>Client Secret</strong>. Treat the secret like a password and never publish it.</li>
    <li>Use the Client ID and Client Secret with the Twitch client-credentials flow to obtain an OAuth access token. IGDB requests use the Client ID and bearer access token.</li>
  </ol>
  <p><strong>Where to put them in Mochi:</strong> in the launcher, open <strong>Settings → IGDB</strong>. Enter the <strong>Client ID</strong> in the Client ID field and the resulting <strong>OAuth bearer token</strong> in the Bearer token field. The optional API key field is an alternative credential field exposed by the current launcher and is not required for the standard Twitch/IGDB setup.</p>
  <p>If you are using the Mochi website's signed-in <strong>Dashboard → API → IGDB</strong> section, use its IGDB credential field for the provider credential supported by your current Mochi build. The dashboard stores the submitted value privately for your account; it does not display the saved secret again. The launcher settings and dashboard credential store are separate configuration surfaces, so configuring one does not automatically populate the other's local fields.</p>
  <p><a href="https://api-docs.igdb.com/" target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/15">Open the official IGDB API setup guide ↗</a></p>
  <p>When IGDB is configured, its credentials are stored in Mochi's local settings and the browser calls IGDB directly. They are not sent through Mochi's cloud-sync layer. If IGDB is not configured or no useful match is found, the game can still be added without IGDB metadata.</p>
  <p>IGDB credentials are launcher configuration rather than part of the Piko/Tofu cloud library. This keeps an external API credential separate from ordinary synchronised game metadata.</p>
</Section>
<Section id="tofu" title="8. Creating a Tofu">
  <p>A Tofu is an environment belonging to a Piko. It can represent a vanilla installation, a modded profile, a performance setup, a development environment, or another meaningful way of running the same game.</p>
  <p>The current model records a name, game version, runtime, installed-mod count, and readiness status. The design intentionally does not force one naming convention: users can create Tofus that match how they actually organise their games.</p>
  <Diagram title="One game, multiple environments">
    <div className="flex min-w-[700px] flex-col items-center gap-3">
      <Box title="Piko · Example Game" >One stable game identity</Box><div className="text-slate-500">↓</div>
      <div className="flex gap-3"><Box title="Tofu · Vanilla" muted>clean environment</Box><Box title="Tofu · Mods" muted>modded environment</Box><Box title="Tofu · Dev" muted>development setup</Box></div>
    </div>
  </Diagram>
</Section>
<Section id="launching" title="9. Launching games">
  <p>The Play action operates on the selected Piko and its selected Tofu. The selected launch target is passed from the UI to the native Tauri/Rust layer, which decides how that target should be started.</p>
  <p>Mochi currently supports ordinary executable targets plus Linux launch targets for <code>.desktop</code> files, Flatpak application IDs, and common script types. The launcher target is treated as one value, while the native layer selects the appropriate mechanism.</p>
  <ul className="list-disc space-y-2 pl-6">
    <li><strong>Executable:</strong> launched directly as a native process.</li>
    <li><strong>.desktop:</strong> launched with <code>gio launch</code>, falling back to <code>xdg-open</code> when necessary.</li>
    <li><strong>Flatpak:</strong> targets using <code>flatpak://APP_ID</code> or <code>flatpak run APP_ID</code> are launched through <code>flatpak run</code>.</li>
    <li><strong>Scripts:</strong> <code>.sh</code>/<code>.bash</code> use <code>sh</code>, <code>.py</code> uses <code>python3</code>, and <code>.js</code> uses <code>node</code>.</li>
  </ul>
  <Diagram title="Launch target routing">
    <div className="flex min-w-[900px] flex-col items-center gap-3 text-xs">
      <Box title="Play selected game" />
      <div className="text-slate-500">↓ Piko + selected Tofu</div>
      <Box title="Native launch_target" muted>one launch target passed to Tauri/Rust</Box>
      <div className="text-slate-500">↓ target type detected</div>
      <div className="flex gap-3">
        <Box title="Executable" muted />
        <Box title=".desktop" muted />
        <Box title="Flatpak" muted />
        <Box title=".sh / .bash" muted />
        <Box title=".py / .js" muted />
      </div>
      <div className="text-slate-500">↓ native launcher</div>
      <Box title="Game / application starts" />
    </div>
  </Diagram>
</Section>
<Section id="local-first" title="10. Local-first behaviour">
  <p>Local-first does not mean cloud features are unimportant. It means the local machine remains the source of immediate launcher usability. A network outage should not make an already-installed game disappear from the library.</p>
  <p>Cloud synchronisation is intended for supported metadata and configuration rather than game binaries. This also makes the model practical for limited cloud storage and reduces unnecessary network traffic.</p>
</Section>
<Section id="limitations" title="11. Current limitations">
  <p>Mochi is still early development software. Native process management, automatic installation detection, broad platform integrations, runtime management, mod management, and advanced launch configuration are evolving areas rather than finished universal features.</p>
  <p>Documentation will continue to distinguish implemented behaviour from planned behaviour so users can understand what the current build actually guarantees.</p>
</Section>
</div>}

function Account(){return <div className="space-y-9">
<Section id="model" title="1. Account model">
  <p>A Mochi account provides a shared identity between the launcher and companion website. Creating an account does not automatically make the launcher dependent on the cloud: local library functionality and cloud identity are separate concerns.</p>
  <p>Authentication proves who the user is. Authorisation determines what that authenticated user is allowed to access. Synchronisation is another layer again: it determines which supported local metadata is copied between the device and the cloud.</p>
</Section>
<Section id="architecture" title="2. Account architecture">
  <p>The account system can be thought of as a chain from identity to permissions to application data. Each layer has a different responsibility.</p>
  <Diagram title="Account architecture">
    <div className="flex min-w-[760px] items-center justify-center gap-2 text-xs">
      <Box title="User" >person using Mochi</Box><span>→</span><Box title="Authentication" >Google · GitHub · email/password · magic link</Box><span>→</span><Box title="Session" >authenticated identity</Box><span>→</span><Box title="Authorisation" >ownership + feature access</Box><span>→</span><Box title="Mochi data" >profile · Pikos · Tofus</Box>
    </div>
  </Diagram>
</Section>
<Section id="signin" title="3. Sign-in methods">
  <p>The current interface supports Google, GitHub, email and password, and passwordless magic links delivered by email. Phone-number sign-in is not supported.</p>
  <p>Google and GitHub provide external identity flows. Email/password provides a traditional credential flow, while a magic link allows the user to authenticate through a time-limited email action without entering a password.</p>
  <p>The user-facing documentation intentionally describes the product-level authentication methods rather than exposing implementation-specific service branding.</p>
</Section>
<Section id="sessions" title="4. Sessions & persistence">
  <p>After successful authentication, Mochi retains the authenticated session so the user does not have to complete the entire sign-in process every time the application starts. Session refresh is handled by the account layer.</p>
  <p>Signing out ends the authenticated session. It does not mean that the local game library, installed games, or local launcher preferences should be deleted. Identity state and local application state have different lifetimes.</p>
  <Diagram title="Returning to Mochi">
    <div className="flex min-w-[700px] flex-col items-center gap-3 text-xs"><div className="flex gap-3"><Box title="First sign-in" /><Box title="Session stored" /><Box title="Close Mochi" /></div><div className="text-slate-500">↓ reopen</div><div className="flex gap-3"><Box title="Restore session" /><span className="pt-3">→</span><Box title="Continue signed in" /></div></div>
  </Diagram>
</Section>
<Section id="profiles" title="5. Profiles">
  <p>Each account has a corresponding profile record. The profile is application-level information rather than the authentication credential itself.</p>
  <p>The current profile model supports a display name, avatar URL, cloud-sync preference, metadata access state, and timestamps. A database-side creation flow ensures a profile is created when a new account is established.</p>
</Section>
<Section id="security" title="6. Security & 2FA">
  <p>Mochi supports time-based one-time-password authentication through an authenticator application. A verified factor can be challenged when additional verification is required.</p>
  <p>Two-factor authentication should be considered an additional layer rather than a replacement for good account hygiene. Users should protect their email account, external identity provider account, recovery methods, and local device.</p>
  <p>Client-side IDs are never sufficient proof of ownership. Database-level policies must also verify that the authenticated user owns the records being requested.</p>
</Section>
<Section id="cloud-access" title="7. Cloud access">
  <p>Account creation and cloud metadata access are intentionally separate. Administrative controls can allow or disable cloud metadata synchronisation for individual accounts.</p>
  <p>This creates a useful permission boundary: someone can use a Mochi identity for website and launcher features without automatically receiving every cloud capability.</p>
</Section>
<Section id="data-flow" title="8. Authentication flow">
  <p>The exact provider internals can vary, but the product-level flow remains consistent: the user chooses a method, completes authentication, Mochi receives an authenticated session, and application requests are then associated with that identity.</p>
  <Diagram title="Authentication flow">
    <div className="flex min-w-[760px] items-center justify-center gap-2 text-xs">
      <Box title="Sign in" /><span>→</span><Box title="Identity provider" muted/><span>→</span><Box title="Authenticated session" /><span>→</span><Box title="Load profile" /><span>→</span><Box title="Optional cloud sync" muted/>
    </div>
  </Diagram>
</Section>
</div>}

function PikosTofus(){return <div className="space-y-9">
<Section id="concepts" title="1. Core concepts">
  <p>Mochi uses two primary domain concepts. A <strong>Piko</strong> is a game managed by Mochi. A <strong>Tofu</strong> is an individual environment, profile, runtime configuration, or mod setup belonging to that game.</p>
  <p>The distinction prevents a common launcher problem: treating every configuration of a game as if it were a completely different game. Mochi instead keeps the game identity stable and places variations underneath it.</p>
</Section>
<Section id="architecture" title="2. The Piko → Tofu hierarchy">
  <p>The hierarchy is intentionally simple. One Piko can own many Tofus, while a Tofu belongs to one Piko.</p>
  <Diagram title="Core object hierarchy">
    <div className="flex min-w-[700px] flex-col items-center gap-3"><Box title="Piko" >Game identity</Box><div className="text-slate-500">↓ one-to-many</div><div className="flex gap-3"><Box title="Tofu A" muted>environment</Box><Box title="Tofu B" muted>environment</Box><Box title="Tofu C" muted>environment</Box></div></div>
  </Diagram>
  <p>This relationship is useful for games where the user wants several independent configurations without duplicating the entire game entry in their library.</p>
</Section>
<Section id="piko" title="3. Piko model">
  <p>The current Piko model contains a stable identifier, name, description, accent, artwork, optional artwork URL, optional executable path, source classification, and a collection of Tofus.</p>
  <p>Source classification distinguishes built-in and custom entries. This gives Mochi room to add detected or integrated sources later without changing the fundamental game model.</p>
  <p>Custom games can also carry categories. When IGDB metadata is accepted, Mochi derives categories from the returned genres; without metadata, a custom game falls back to <strong>Other</strong>. The current library groups visible Pikos by their first category.</p>
  <p>The executable path is machine-specific integration data. A path that works on one computer may not exist on another, even when the Piko's descriptive metadata is identical.</p>
</Section>
<Section id="tofu" title="4. Tofu model">
  <p>A Tofu currently contains an identifier, name, version, runtime, installed-mod count, and status. Status distinguishes <em>Ready</em> from <em>Needs attention</em> in the current interface.</p>
  <p>Future Tofu data can grow to include launch arguments, environment variables, runtime paths, mod-loader information, compatibility settings, and other configuration without changing the user's mental model.</p>
</Section>
<Section id="relationships" title="5. Relationships">
  <p>Each Tofu belongs to exactly one Piko. In cloud storage, the Tofu references its parent Piko, and the Piko is owned by the authenticated account.</p>
  <p>This produces a simple ownership chain: <strong>account → Piko → Tofu</strong>. It also lets database policies validate access through the parent rather than trusting a client-provided Piko ID.</p>
</Section>
<Section id="examples" title="6. Example library">
  <p>Imagine a user has a game called ExampleCraft. They might create three Tofus:</p>
  <ul className="list-disc space-y-2 pl-6"><li><strong>Vanilla:</strong> the clean game with no additional modifications.</li><li><strong>Performance:</strong> a setup containing performance-focused modifications and settings.</li><li><strong>Testing:</strong> an experimental configuration used while developing or testing changes.</li></ul>
  <Diagram title="Example library">
    <div className="flex min-w-[760px] items-center justify-center gap-2 text-xs"><Box title="ExampleCraft" /><span>→</span><Box title="Vanilla" muted/><span>+</span><Box title="Performance" muted/><span>+</span><Box title="Testing" muted/></div>
  </Diagram>
</Section>
<Section id="storage" title="7. Local storage">
  <p>The current frontend stores the library and launcher settings locally. This includes Piko data, Tofu data, appearance preferences, behaviour settings, and optional IGDB configuration.</p>
  <p>Local storage is deliberately capable of holding the library without requiring cloud access. This is the foundation for offline use and for keeping game installations on the user's own machine.</p>
</Section>
<Section id="identity" title="8. Stable identity">
  <p>Stable IDs matter because names are not reliable identifiers. A user can rename a Piko without wanting the cloud service to interpret it as a new game.</p>
  <p>Synchronisation therefore uses stable local identifiers alongside authenticated ownership. This gives Mochi a consistent way to recognise the same logical object across sync operations.</p>
</Section>
<Section id="future" title="9. Future expansion">
  <p>The model is intentionally extensible. Planned capabilities include runtime management, mod loaders, platform integrations, installation detection, process state, richer launch configuration, and more detailed environment metadata.</p>
  <p>Future additions should preserve the Piko-to-Tofu ownership model and stable identifiers so the launcher can continue to operate independently from cloud availability.</p>
</Section>
</div>}

function CloudSync(){return <div className="space-y-9">
<Section id="principles" title="1. Design principles">
  <p>Mochi Cloud is an optional metadata service around a local-first launcher. It is intended to synchronise supported account information, launcher metadata, configurations, and settings rather than host complete game installations.</p>
  <p>The important boundary is <strong>metadata versus large local assets</strong>. A Piko can tell Mochi what a game is and where it is installed, while the actual game files remain on the user's machine.</p>
</Section>
<Section id="architecture" title="2. Cloud architecture">
  <p>The cloud system sits beside the local launcher rather than underneath it. Local data can continue to exist when the network is unavailable.</p>
  <Diagram title="Local-first sync architecture">
    <div className="flex min-w-[900px] flex-col items-center gap-3 text-xs">
      <Box title="Mochi on your device">UI · local library · launcher settings</Box>
      <div className="text-slate-500">↕ library synchronisation</div>
      <Box title="Cloud sync service" muted>pulls and pushes supported metadata for the signed-in account</Box>
      <div className="text-slate-500">↓ authenticated requests</div>
      <Box title="Cloud database" muted>profiles · Pikos · Tofus</Box>
      <div className="flex items-center gap-8 pt-1">
        <div className="flex flex-col items-center gap-2"><span className="text-slate-500">↑</span><Box title="Auth identity" muted>identifies the signed-in account</Box></div>
        <div className="flex flex-col items-center gap-2"><span className="text-slate-500">↓</span><Box title="Piko records" muted>game metadata owned by the account</Box><span className="text-slate-500">↓ parent relationship</span><Box title="Tofu records" muted>environment metadata belonging to a Piko</Box></div>
      </div>
    </div>
  </Diagram>
  <p>The synchronisation layer is responsible for moving supported metadata between these sides. It is not responsible for uploading a complete game installation.</p>
</Section>
<Section id="data" title="3. Synchronised data">
  <p>The current schema stores <code>profiles</code>, <code>pikos</code>, and <code>tofus</code>. Profile records contain account-level profile and cloud-sync preferences. Pikos contain game metadata. Tofus contain environment metadata.</p>
  <p>Piko records can include names, descriptions, accents, artwork, source classification, and executable-path metadata. Tofu records include names, versions, runtimes, mod counts, and status.</p>
  <p>Optional IGDB credentials remain local launcher settings rather than becoming ordinary cloud Piko/Tofu data.</p>
</Section>
<Section id="pull" title="4. Pull behaviour">
  <p>A pull begins after the launcher has an authenticated identity. Mochi retrieves Pikos owned by that account and then retrieves their related Tofus through the Piko relationship.</p>
  <p>If cloud data exists, it can populate or update the local library. If the account has no cloud library yet, the local library can initialise the cloud representation. In the current implementation, an authenticated session first attempts a pull; an empty cloud library triggers an initial push of the local library. Later local library changes trigger another push while the session remains active.</p>
  <Diagram title="Pull flow">
    <div className="flex min-w-[760px] items-center justify-center gap-2 text-xs"><Box title="Authenticated Mochi" /><span>→</span><Box title="Request Pikos" muted/><span>→</span><Box title="Load Tofus" muted/><span>→</span><Box title="Merge into local state" /></div>
  </Diagram>
</Section>
<Section id="push" title="5. Push behaviour">
  <p>A push takes supported local library records and writes them to the cloud using the authenticated account and stable identifiers. Pikos are written before their child Tofus so the parent relationship can be established safely.</p>
  <p>Records that no longer exist locally can be removed from the cloud representation. The current push implementation upserts Pikos first, removes stale Pikos, removes stale Tofus, and then upserts the remaining Tofus.</p>
  <p>The current implementation is a straightforward replication model, not a complete multi-device conflict-resolution engine.</p>
  <Diagram title="Push flow">
    <div className="flex min-w-[820px] items-center justify-center gap-2 text-xs"><Box title="Local library" /><span>→</span><Box title="Stable IDs" /><span>→</span><Box title="Upsert Pikos" muted/><span>→</span><Box title="Upsert Tofus" muted/><span>→</span><Box title="Cloud library" /></div>
  </Diagram>
</Section>
<Section id="database" title="6. Database structure">
  <p>The current schema defines three central tables: <code>profiles</code>, <code>pikos</code>, and <code>tofus</code>.</p>
  <Diagram title="Database relationships">
    <div className="flex min-w-[700px] flex-col items-center gap-3 text-xs"><Box title="auth identity" muted>authenticated user</Box><div>↓</div><Box title="profiles" >one profile per account</Box><div>↓ ownership</div><Box title="pikos" >many Pikos per account</Box><div>↓ parent_id</div><Box title="tofus" >many Tofus per Piko</Box></div>
  </Diagram>
  <p>Unique constraints prevent duplicate local identifiers within their ownership scope, while indexes support common account and parent-child queries. Tofu records use their Piko relationship rather than pretending a Tofu is an independent top-level library item. Deleting a Piko cascades to its Tofus in the current schema.</p>
</Section>
<Section id="security" title="7. Access control">
  <p>Row-level security is enabled on the application tables. Profile policies restrict records to the owning account. Piko policies restrict records to the authenticated owner. Tofu policies verify ownership through the parent Piko.</p>
  <p>This database-level authorisation is important because a malicious or buggy client must not be able to access another user's metadata simply by changing an ID in a request.</p>
  <Diagram title="Ownership check">
    <div className="flex min-w-[800px] items-center justify-center gap-2 text-xs"><Box title="Request" /><span>→</span><Box title="Authenticated user" /><span>→</span><Box title="Record owner" muted/><span>→</span><Box title="Allowed?" /><span>→</span><Box title="Data" muted/></div>
  </Diagram>
</Section>
<Section id="identifiers" title="8. Identity & ownership">
  <p>Cloud records need two different kinds of identity. The database record has its own database identity, while Mochi also retains stable local identifiers so a device can recognise the same logical Piko or Tofu across synchronisation operations.</p>
  <p>Ownership is a separate question from identity. Two records can have similar names, but only records associated with the authenticated account should be visible through that account's normal data policies.</p>
</Section>
<Section id="failure" title="9. Failure handling">
  <p>Synchronisation failures should be represented as an error state rather than silently reported as success. The local library remains available because cloud services are not intended to be a prerequisite for basic local operation.</p>
  <p>Examples include no network connection, expired authentication, insufficient cloud access, invalid data, or a server-side failure. The correct user experience is to preserve local state and explain that synchronisation did not complete.</p>
</Section>
<Section id="conflicts" title="10. Conflict handling">
  <p>The current system should not be described as having sophisticated conflict resolution. When multiple devices edit the same metadata, explicit rules will eventually be needed to decide whether to prefer the newest change, local state, cloud state, or a user-selected version.</p>
  <p>Before introducing advanced multi-device editing, Mochi should define conflict semantics, timestamps or revision identifiers, deletion handling, and a user-visible recovery path. This keeps synchronisation predictable rather than silently overwriting work.</p>
</Section>
</div>}
