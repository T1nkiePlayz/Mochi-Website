import { Activity, Ban, ChevronDown, Cloud, LogOut, RefreshCw, Search, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { avatarFor } from '../lib/avatar'
import {
  adminApi, setUserCloudSync, setUserMetadataAccess, supabase,
  type AdminAuditEntry, type AdminStats, type AdminUser,
} from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import { Chip, ConfirmAction, CopyButton, Field, Panel, Row, Skeleton } from './ui'
import { btn, formatDate, input, timeAgo } from './ui-utils'
import { useNotice } from './useNotice'

const PAGE = 25
const MIGRATION_HINT = 'The admin tools need the latest database migration (supabase/migrations/20261008140000_admin_tools_and_account_deletion.sql).'
const MFA_HINT = 'Admin actions need a session verified with your authenticator app. Enter a code to continue.'
const friendly = (message: string) => (/could not find the function|does not exist|schema cache/i.test(message) ? MIGRATION_HINT : /\bAAL2\b|multi-factor/i.test(message) ? MFA_HINT : message)

function AdminPanel() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [audit, setAudit] = useState<AdminAuditEntry[]>([])
  const [showAudit, setShowAudit] = useState(false)
  const n = useNotice()

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(0) }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    const [s, u] = await Promise.all([adminApi.stats(), adminApi.users(query, PAGE, page * PAGE)])
    if (s.error || u.error) n.error(friendly((s.error ?? u.error)!.message))
    else {
      setStats(s.data as AdminStats)
      const rows = (u.data ?? []) as AdminUser[]
      setUsers(rows)
      setTotal(rows[0]?.total_count ?? 0)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- n is stable enough for this
  }, [query, page])
  useEffect(() => { void load() }, [load])

  const loadAudit = async () => {
    setShowAudit(true)
    const { data, error } = await adminApi.audit(50)
    if (error) n.error(friendly(error.message))
    else setAudit((data ?? []) as AdminAuditEntry[])
  }

  const tiles = stats ? [
    { label: 'Users', value: stats.users, hint: `+${stats.new_7d} this week` },
    { label: 'Active (7d)', value: stats.active_7d, hint: `${stats.admins} admin${stats.admins === 1 ? '' : 's'}` },
    { label: 'Cloud access', value: stats.cloud_access, hint: `${stats.cloud_sync} syncing` },
    { label: 'Synced library', value: stats.pikos, hint: `${stats.tofus} Tofus` },
  ] : []

  return (
    <div className="space-y-4">
      {n.node}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading && !stats ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />) : tiles.map((tile) => (
          <div key={tile.label} className="glass-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{tile.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{tile.value}</p>
            <p className="text-xs text-slate-500">{tile.hint}{tile.label === 'Users' && stats && stats.banned > 0 ? ` · ${stats.banned} suspended` : ''}</p>
          </div>
        ))}
      </div>

      <Panel title="Users" icon={Users} description="Search by email, username, or exact account ID."
        action={<button onClick={() => void load()} disabled={loading} aria-label="Refresh" className={btn('ghost', '!p-2')}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users…" aria-label="Search users" className={`${input} !pl-9`} />
        </div>
        <div className="mt-4 space-y-2">
          {loading && users.length === 0 ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />) : users.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No users match.</p>
          ) : users.map((row) => <UserCard key={row.id} row={row} self={row.id === user?.id} reload={load} />)}
        </div>
        {total > PAGE && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <button disabled={page === 0 || loading} onClick={() => setPage(page - 1)} className={btn('secondary', '!px-3 !py-1.5')}>Previous</button>
            <span>{page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} of {total}</span>
            <button disabled={(page + 1) * PAGE >= total || loading} onClick={() => setPage(page + 1)} className={btn('secondary', '!px-3 !py-1.5')}>Next</button>
          </div>
        )}
      </Panel>

      <Panel title="Audit log" icon={Activity} description="Every admin action taken from this dashboard.">
        {!showAudit ? <button onClick={() => void loadAudit()} className={btn('secondary')}>Show recent activity</button> : audit.length === 0 ? (
          <p className="text-sm text-slate-500">No admin actions recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {audit.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2"><Chip tone={/delete|suspend|clear|revoke/.test(entry.action) ? 'bad' : 'info'}>{entry.action.replace(/_/g, ' ')}</Chip><span className="text-slate-300">{entry.target_email ?? entry.target_id ?? '—'}</span><span className="ml-auto text-xs text-slate-500">{timeAgo(entry.created_at)}</span></div>
                <p className="mt-1 text-xs text-slate-500">by {entry.actor_email ?? 'unknown'}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function UserCard({ row, self, reload }: { row: AdminUser; self: boolean; reload: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const n = useNotice()

  const run = async (label: string, action: () => PromiseLike<{ error: { message: string } | null }>) => {
    setBusy(true); n.clear()
    const { error } = await action()
    if (error) n.error(friendly(error.message))
    else { n.success(label); await reload() }
    setBusy(false)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025]">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <img src={avatarFor(row.email, row.avatar_url, 64)} alt="" className="h-9 w-9 shrink-0 rounded-full border border-white/10 bg-slate-900 object-cover" loading="lazy" decoding="async" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{row.display_name || row.email || 'Unnamed account'}{self && <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>}</span>
          <span className="block truncate text-xs text-slate-500">{row.email} · last seen {timeAgo(row.last_sign_in_at)}</span>
        </span>
        <span className="hidden shrink-0 gap-1.5 sm:flex">
          {row.is_admin && <Chip tone="info">Admin</Chip>}
          {row.banned && <Chip tone="bad">Suspended</Chip>}
          {row.metadata_sync_allowed && <Chip tone={row.cloud_sync_enabled ? 'good' : 'muted'}>Cloud</Chip>}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/10 px-4 py-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            {[
              ['Joined', formatDate(row.created_at)],
              ['Last sign-in', timeAgo(row.last_sign_in_at)],
              ['Email', row.email_confirmed ? 'Verified' : 'Unverified'],
              ['Providers', row.providers.length ? row.providers.join(', ') : '—'],
              ['Passkeys / authenticators', `${row.passkey_count} / ${row.authenticator_count}`],
              ['Library', `${row.piko_count} Pikos · ${row.tofu_count} Tofus`],
            ].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 break-words text-slate-200">{value}</dd></div>)}
          </dl>
          <Row title="Account ID" detail={<span className="break-all font-mono">{row.id}</span>} right={<CopyButton value={row.id} />} />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cloud</p>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => void run(row.metadata_sync_allowed ? 'Cloud access revoked.' : 'Cloud access granted.', () => setUserMetadataAccess(row.id, !row.metadata_sync_allowed) as PromiseLike<{ error: { message: string } | null }>)} className={btn('secondary')}><Cloud className="h-4 w-4" />{row.metadata_sync_allowed ? 'Revoke access' : 'Grant access'}</button>
              <button disabled={busy || !row.metadata_sync_allowed} onClick={() => void run(row.cloud_sync_enabled ? 'Cloud sync turned off.' : 'Cloud sync turned on.', () => setUserCloudSync(row.id, !row.cloud_sync_enabled) as PromiseLike<{ error: { message: string } | null }>)} className={btn('secondary')}>{row.cloud_sync_enabled ? 'Turn sync off' : 'Turn sync on'}</button>
            </div>
            <ConfirmAction label="Clear cloud library" confirmLabel="Clear library" prompt={`Delete all synced Pikos and Tofus for ${row.email}?`} busy={busy} variant="secondary" onConfirm={() => run('Cloud library cleared.', () => adminApi.clearCloud(row.id))} />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Access</p>
            <div className="flex flex-wrap gap-2">
              <ConfirmAction label="Sign out everywhere" confirmLabel="End sessions" prompt={`End every active session for ${row.email}?`} busy={busy} variant="secondary" icon={LogOut} onConfirm={() => run('Sessions ended.', () => adminApi.revokeSessions(row.id))} />
              {row.banned
                ? <button disabled={busy} onClick={() => void run('Account unsuspended.', () => adminApi.setBanned(row.id, false))} className={btn('secondary')}><ShieldCheck className="h-4 w-4" />Unsuspend</button>
                : <ConfirmAction label="Suspend" confirmLabel="Suspend account" prompt={`Suspend ${row.email}? They'll be signed out and unable to sign in.`} busy={busy} disabled={self} icon={Ban} onConfirm={() => run('Account suspended.', () => adminApi.setBanned(row.id, true))} />}
              <ConfirmAction label="Delete user" confirmLabel="Delete permanently" prompt={`Permanently delete ${row.email} and all of their data?`} requireText={row.email ?? 'DELETE'} busy={busy} disabled={self} icon={Trash2} onConfirm={() => run('User deleted.', () => adminApi.deleteUser(row.id))} />
            </div>
            {self && <p className="text-xs text-slate-500">You can’t suspend or delete yourself here — use Account → Delete account.</p>}
          </div>
          {n.node}
        </div>
      )}
    </div>
  )
}

type Step = 'checking' | 'ready' | 'verify' | 'enroll'

/**
 * Administrator actions need an AAL2 session (the database checks it). A password, email-code or passkey sign-in
 * is AAL1, so ask for an authenticator code here and upgrade the session instead of making the admin sign in again.
 */
export default function AdminTab() {
  const [step, setStep] = useState<Step>('checking')
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const n = useNotice()

  useEffect(() => {
    let active = true
    void (async () => {
      if (!supabase) { if (active) setStep('ready'); return }
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!active) return
      if (error || data?.currentLevel === 'aal2') { setStep('ready'); return }
      const factors = await supabase.auth.mfa.listFactors()
      if (!active) return
      const totp = (factors.data?.totp ?? []).find((factor) => factor.status === 'verified')
      if (totp) { setFactorId(totp.id); setStep('verify') } else setStep('enroll')
    })()
    return () => { active = false }
  }, [])

  const verify = async () => {
    if (!supabase || !factorId) return
    setBusy(true)
    n.clear()
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
    if (error) n.error(error.message)
    else {
      await supabase.auth.refreshSession()
      setStep('ready')
    }
    setBusy(false)
  }

  if (step === 'checking') return <Skeleton className="h-40" />
  if (step === 'ready') return <AdminPanel />
  return (
    <Panel title="Verify to use admin tools" description="Administrator actions need a session verified with your authenticator app." icon={ShieldCheck}>
      {step === 'enroll'
        ? <p className="text-sm leading-6 text-slate-300">Add an authenticator app under Security first. A passkey on its own cannot unlock admin actions. Then come back to this tab.</p>
        : (
          <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void verify() }}>
            <Field label="Authenticator code">
              <input className={input} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={8} value={code} onChange={(event) => setCode(event.target.value)} />
            </Field>
            <button type="submit" disabled={busy || code.trim().length < 6} className={btn('primary')}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
            {n.node}
          </form>
        )}
    </Panel>
  )
}
