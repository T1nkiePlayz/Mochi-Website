import type { User } from '@supabase/supabase-js'
import { AlertTriangle, Check, ChevronRight, Cloud, KeyRound, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSignInFactors, manageApiCredential, type Profile } from '../lib/supabase'
import { Chip, Panel, Skeleton } from './ui'

type TabId = 'overview' | 'account' | 'security' | 'cloud' | 'admin'

export default function OverviewTab({ user, profile, go }: { user: User; profile: Profile | null; go: (tab: TabId) => void }) {
  const [state, setState] = useState<{ totp: number; passkeys: number; keys: number } | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([getSignInFactors(), manageApiCredential('status')]).then(([factors, keys]) => {
      if (!active) return
      setState({
        totp: factors.data?.totp.length ?? 0,
        passkeys: factors.data?.passkeys.length ?? 0,
        keys: keys.error ? 0 : ((keys.data?.providers ?? []) as string[]).length,
      })
    })
    return () => { active = false }
  }, [])

  const identities = new Set((user.identities ?? []).map((identity) => identity.provider))
  const checks = state ? [
    { label: 'Email verified', ok: Boolean(user.email_confirmed_at), action: 'Verify email', tab: 'account' as const },
    { label: 'Second sign-in factor', ok: state.totp + state.passkeys > 0, action: 'Add a passkey or authenticator', tab: 'security' as const },
    { label: 'Backup sign-in method', ok: identities.has('google') || identities.has('github') || state.passkeys > 0, action: 'Link Google or GitHub', tab: 'security' as const },
  ] : []
  const done = checks.filter((check) => check.ok).length
  const cloud = !profile?.metadata_sync_allowed ? { text: 'Not enabled', tone: 'muted' as const } : profile.cloud_sync_enabled ? { text: 'Syncing', tone: 'good' as const } : { text: 'Available · off', tone: 'info' as const }

  return (
    <div className="space-y-4">
      <Panel title="Account health" icon={ShieldCheck}
        description="A quick look at how well protected your account is."
        action={state ? <Chip tone={done === checks.length ? 'good' : 'warn'}>{done}/{checks.length}</Chip> : undefined}>
        {!state ? <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : (
          <>
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${(done / checks.length) * 100}%` }} /></div>
            <ul className="space-y-2">
              {checks.map((check) => (
                <li key={check.label} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                  {check.ok ? <Check className="h-4 w-4 shrink-0 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />}
                  <span className="min-w-0 flex-1 basis-40 text-sm font-medium text-white">{check.label}</span>
                  {!check.ok && <button onClick={() => go(check.tab)} className="inline-flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-white">{check.action}<ChevronRight className="h-4 w-4" /></button>}
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { id: 'account' as const, icon: UserRound, title: 'Account', value: profile?.display_name || user.email || 'Your account', hint: 'Profile, email, password' },
          { id: 'cloud' as const, icon: Cloud, title: 'Mochi Cloud', value: cloud.text, hint: 'Sync and library', tone: cloud.tone },
          { id: 'security' as const, icon: KeyRound, title: 'Service keys', value: state ? `${state.keys} saved` : '…', hint: 'IGDB and Nexus Mods' },
        ].map(({ id, icon: Icon, title, value, hint }) => (
          <button key={id} onClick={() => go(id)} className="glass-card group p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-400/30">
            <Icon className="h-5 w-5 text-violet-300" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
            <p className="mt-1 truncate text-base font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
