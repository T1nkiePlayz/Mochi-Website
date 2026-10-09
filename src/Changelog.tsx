import { AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2, ExternalLink, RefreshCw, Sparkles, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'

type Release = {
  id: number
  name: string
  tag_name: string
  body: string | null
  html_url: string
  published_at: string | null
  prerelease: boolean
}

function formatDate(value: string | null) {
  if (!value) return 'Unpublished'
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value))
}

function releaseKind(release: Release) {
  if (release.prerelease) return 'Pre-release'
  if (release.tag_name.toLowerCase().includes('alpha')) return 'Alpha'
  if (release.tag_name.toLowerCase().includes('beta')) return 'Beta'
  return 'Release'
}

export function ChangelogPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await fetch('https://api.github.com/repos/T1nkiePlayz/Mochi/releases?per_page=30', {
        headers: { Accept: 'application/vnd.github+json' },
      })
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
      const data = await response.json() as Release[]
      setReleases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load releases.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <div className="space-y-10 pb-10">
      <header className="max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" /> Release history
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">Changelog</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          A live view of Mochi releases from the GitHub repository. Release notes are pulled directly from GitHub, so this page stays in step with published releases.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Tag className="h-4 w-4 text-violet-300" />
          {loading ? 'Loading releases…' : `${releases.length} release${releases.length === 1 ? '' : 's'} loaded`}
        </div>
        <button type="button" onClick={() => { setError(''); setRefreshing(true); void load() }} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-violet-400/40 hover:bg-white/10 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5 text-sm text-amber-200">
          <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">We couldn't load the release history.</p><p className="mt-1 text-amber-200/70">{error}</p><a href="https://github.com/T1nkiePlayz/Mochi/releases" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 font-semibold underline underline-offset-2">Open releases on GitHub <ExternalLink className="h-3.5 w-3.5" /></a></div></div>
        </div>
      )}

      {loading && <div className="glass-card p-10 text-center text-slate-400">Fetching the latest release notes…</div>}

      {!loading && !error && releases.length === 0 && (
        <div className="glass-card p-10 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-violet-300" /><h2 className="mt-4 text-xl font-semibold text-white">No public releases yet</h2><p className="mt-2 text-sm text-slate-400">Once a release is published in the Mochi repository, its notes will appear here automatically.</p></div>
      )}

      {!loading && releases.length > 0 && (
        <div className="relative space-y-5">
          <div className="absolute bottom-8 left-5 top-8 hidden w-px bg-gradient-to-b from-violet-400/40 via-cyan-400/20 to-transparent sm:block" />
          {releases.map((release, index) => (
            <article key={release.id} className="relative sm:pl-14">
              <div className="absolute left-0 top-6 hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950 sm:flex">
                <CalendarDays className={`h-4 w-4 ${index === 0 ? 'text-violet-300' : 'text-slate-500'}`} />
              </div>
              <div className="glass-card p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-violet-200">{release.tag_name}</span>
                      {index === 0 && <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Latest</span>}
                      <span className="text-xs text-slate-500">{releaseKind(release)}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-white">{release.name || release.tag_name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{formatDate(release.published_at)}</p>
                  </div>
                  <a href={release.html_url} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-violet-400/40 hover:text-white">
                    View release <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="mt-6 border-t border-white/10 pt-5">
                  {release.body ? (
                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{release.body}</div>
                  ) : (
                    <p className="text-sm italic text-slate-500">This release has no release notes.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
