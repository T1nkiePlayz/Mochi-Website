import { Cloud, Gamepad2, Layers3, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { clearMyCloudData, manageApiCredential, supabase, updateMyProfile, type Profile } from '../lib/supabase'
import { Chip, ConfirmAction, Panel, Skeleton, Switch } from './ui'
import { input } from './ui-utils'
import { useNotice } from './useNotice'

type SyncedGame = { id: string; name: string; artwork: string | null; artwork_url?: string | null; source: string | null; categories: string[] | null; tofus: { id: string }[] | null }

const cssImage = /^(url|linear-gradient|radial-gradient|conic-gradient|image-set)\(/i
const httpsUrl = /^https:\/\/[^\s"'()\\]+$/i

/**
 * CSS background for a synced game. The launcher stores either a CSS image/gradient value or a bare URL in `artwork`
 * and the original image link in `artwork_url`; use the https link when there is one, a stored CSS value as it is,
 * and nothing for local-only values (such as bundled launcher art) that mean nothing on the web.
 */
function coverImage(game: SyncedGame): string | undefined {
  const link = game.artwork_url?.trim()
  if (link && httpsUrl.test(link)) return `url("${link}")`
  const stored = game.artwork?.trim()
  if (!stored) return undefined
  if (cssImage.test(stored)) return stored
  return httpsUrl.test(stored) ? `url("${stored}")` : undefined
}

export default function CloudTab({ profile, refreshProfile }: { profile: Profile | null; refreshProfile: () => Promise<void> }) {
  const [sync, setSync] = useState(profile?.cloud_sync_enabled ?? false)
  const [games, setGames] = useState<SyncedGame[]>([])
  const [artwork, setArtwork] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [query, setQuery] = useState('')
  const n = useNotice()
  const allowed = Boolean(profile?.metadata_sync_allowed)

  useEffect(() => { setSync(profile?.cloud_sync_enabled ?? false) }, [profile?.cloud_sync_enabled])

  useEffect(() => {
    setLoading(allowed)
    if (!allowed) { setGames([]); setArtwork(false) }
  }, [allowed])

  useEffect(() => {
    if (!allowed || !supabase) return
    let active = true
    void Promise.all([
      supabase.from('pikos').select('id, name, artwork, artwork_url, source, categories, tofus(id)').order('name'),
      manageApiCredential('status'),
    ]).then(([pikos, status]) => {
      if (!active) return
      if (pikos.error) n.error(pikos.error.message)
      else setGames((pikos.data ?? []) as unknown as SyncedGame[])
      setArtwork(!status.error && ((status.data?.providers ?? []) as string[]).includes('igdb'))
      setLoading(false)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when access changes
  }, [allowed])

  const toggle = async (enabled: boolean) => {
    if (!profile) return
    setSaving(true); n.clear()
    const { error } = await updateMyProfile({ display_name: profile.display_name, avatar_url: profile.avatar_url, cloud_sync_enabled: enabled, metadata_sync_allowed: profile.metadata_sync_allowed })
    if (error) n.error(error.message)
    else { setSync(enabled); await refreshProfile() }
    setSaving(false)
  }

  const clear = async () => {
    setClearing(true); n.clear()
    const { data, error } = await clearMyCloudData()
    if (error) n.error(error.message)
    else {
      const deleted = data as { deleted_pikos?: number; deleted_tofus?: number } | null
      setGames([])
      n.success(`Cloud data cleared: ${deleted?.deleted_pikos ?? 0} Pikos and ${deleted?.deleted_tofus ?? 0} Tofus removed.`)
    }
    setClearing(false)
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? games.filter((game) => game.name.toLowerCase().includes(needle)) : games
  }, [games, query])
  const tofuTotal = games.reduce((total, game) => total + (game.tofus?.length ?? 0), 0)

  if (!allowed) {
    return (
      <Panel title="Mochi Cloud isn’t enabled for this account" icon={Cloud}
        description="Cloud access is granted by an administrator while Mochi Cloud is limited to selected users. Everything in Mochi keeps working locally without it — your games never depend on the cloud." />
    )
  }

  return (
    <div className="space-y-4">
      <Panel title="Cloud sync" icon={Cloud} description="Sync your Pikos and Tofus between devices. Game files are never uploaded."
        action={<Switch checked={sync} onChange={(next) => void toggle(next)} disabled={saving} label="Cloud sync" />}>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Chip tone={sync ? 'good' : 'muted'}>{sync ? 'Sync on' : 'Sync off'}</Chip>
          <Chip tone="info">Cloud access granted</Chip>
          {!loading && <span>{games.length} {games.length === 1 ? 'Piko' : 'Pikos'} · {tofuTotal} {tofuTotal === 1 ? 'Tofu' : 'Tofus'}</span>}
        </div>
        {n.node && <div className="mt-4">{n.node}</div>}
      </Panel>

      <Panel title="Synced library" icon={Layers3}
        description={artwork ? undefined : 'Save an IGDB key under Security → Service keys to show cover artwork.'}
        action={games.length > 0 ? <div className="relative w-40 sm:w-56"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search synced games" className={`${input} !py-2 !pl-9 text-sm`} /></div> : undefined}>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Skeleton className="aspect-[3/4] h-auto" /><Skeleton className="aspect-[3/4] h-auto" /><Skeleton className="hidden aspect-[3/4] h-auto sm:block" /></div>
        ) : games.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">Nothing synced yet. Turn on sync here and in the launcher, and your library will appear.</p>
        ) : visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No games match “{query}”.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((game) => {
              const cover = coverImage(game)
              return (
              <li key={game.id} className="min-w-0">
                <div role="img" aria-label={game.name} style={artwork && cover ? { backgroundImage: cover } : undefined}
                  className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 bg-cover bg-center text-slate-600">
                  {!(artwork && cover) && <Gamepad2 className="h-9 w-9" />}
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-white" title={game.name}>{game.name}</p>
                <p className="truncate text-xs text-slate-500">{game.tofus?.length ?? 0} {(game.tofus?.length ?? 0) === 1 ? 'Tofu' : 'Tofus'}{game.categories?.[0] ? ` · ${game.categories[0]}` : ''}</p>
              </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Clear cloud data" tone="danger" icon={Trash2}
        description="Permanently deletes every Piko and Tofu stored in Mochi Cloud for this account. Your local library and your account are not affected.">
        <ConfirmAction label="Clear all cloud data" confirmLabel="Clear everything" prompt="This permanently removes your synced library from Mochi Cloud." requireText="CLEAR" busy={clearing} onConfirm={clear} />
      </Panel>
    </div>
  )
}
