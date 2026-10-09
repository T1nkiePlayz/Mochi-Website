import type { User } from '@supabase/supabase-js'
import { Download, LogOut, Mail, Trash2, UserRound, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { avatarFor } from '../lib/avatar'
import { deleteMyAccount, signOutEverywhere, supabase, updateEmail, updateMyProfile, updatePassword, type Profile } from '../lib/supabase'
import { ConfirmAction, CopyButton, Field, Panel, Row } from './ui'
import { btn, formatDate, input } from './ui-utils'
import { useNotice } from './useNotice'

type Props = { user: User; profile: Profile | null; refreshProfile: () => Promise<void> }

export default function AccountTab({ user, profile, refreshProfile }: Props) {
  return (
    <div className="space-y-4">
      <ProfilePanel user={user} profile={profile} refreshProfile={refreshProfile} />
      <EmailPanel user={user} />
      <PasswordPanel />
      <SessionsPanel />
      <ExportPanel />
      <DeletePanel user={user} />
    </div>
  )
}

function ProfilePanel({ user, profile, refreshProfile }: Props) {
  const [name, setName] = useState(profile?.display_name ?? '')
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const save = async () => {
    setBusy(true); n.clear()
    const { error } = await updateMyProfile({
      display_name: name,
      avatar_url: profile?.avatar_url ?? null,
      cloud_sync_enabled: profile?.cloud_sync_enabled ?? false,
      metadata_sync_allowed: profile?.metadata_sync_allowed ?? false,
    })
    if (error) n.error(error.message)
    else { n.success('Username updated.'); await refreshProfile() }
    setBusy(false)
  }
  return (
    <Panel title="Profile" description="How you appear in Mochi." icon={UserRound}>
      <div className="flex flex-wrap items-center gap-4">
        <img src={avatarFor(user.email, profile?.avatar_url, 128)} alt="" className="h-16 w-16 rounded-full border border-white/15 bg-slate-900 object-cover" loading="lazy" decoding="async" />
        <div className="min-w-0 flex-1 basis-56">
          <Field label="Username"><input value={name} onChange={(event) => setName(event.target.value)} maxLength={64} className={input} /></Field>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Row title="Account ID" detail={<span className="break-all font-mono">{user.id}</span>} right={<CopyButton value={user.id} />} />
        <Row title="Member since" detail={formatDate(user.created_at)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={busy || name.trim() === (profile?.display_name ?? '')} onClick={() => void save()} className={btn('primary')}>{busy ? 'Saving…' : 'Save username'}</button>
      </div>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function EmailPanel({ user }: { user: User }) {
  const [email, setEmail] = useState(user.email ?? '')
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const save = async () => {
    setBusy(true); n.clear()
    const { error } = await updateEmail(email.trim())
    if (error) n.error(error.message)
    else n.success('Check your inbox to confirm the email change.')
    setBusy(false)
  }
  return (
    <Panel title="Email address" description="Changing it requires confirming from your inbox." icon={Mail}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="email" autoComplete="email" aria-label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className={input} />
        <button disabled={busy || !email.trim() || email.trim() === user.email} onClick={() => void save()} className={btn('secondary', 'sm:shrink-0')}>{busy ? 'Sending…' : 'Send confirmation'}</button>
      </div>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function PasswordPanel() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const save = async () => {
    if (next.length < 8) { n.error('Choose a password with at least 8 characters.'); return }
    setBusy(true); n.clear()
    const { error } = await updatePassword(next, current || undefined)
    if (error) n.error(error.message)
    else { n.success('Password updated.'); setCurrent(''); setNext('') }
    setBusy(false)
  }
  return (
    <Panel title="Password" description="Accounts that sign in with Google, GitHub, or a code can still add a password here." icon={KeyRound}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input type="password" autoComplete="current-password" aria-label="Current password" placeholder="Current password (if you have one)" value={current} onChange={(event) => setCurrent(event.target.value)} className={input} />
        <input type="password" autoComplete="new-password" aria-label="New password" placeholder="New password" value={next} onChange={(event) => setNext(event.target.value)} className={input} />
      </div>
      <div className="mt-3"><button disabled={busy || !next} onClick={() => void save()} className={btn('secondary')}>{busy ? 'Updating…' : 'Update password'}</button></div>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function SessionsPanel() {
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  return (
    <Panel title="Sessions" description="Sign out of Mochi on every browser and device, including the desktop app. You'll need to sign in again here." icon={LogOut}>
      <ConfirmAction label="Sign out everywhere" confirmLabel="Sign out everywhere" prompt="This ends all of your active sessions, including this one." variant="secondary" icon={LogOut} busy={busy}
        onConfirm={async () => { setBusy(true); const { error } = await signOutEverywhere(); if (error) n.error(error.message); setBusy(false) }} />
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function ExportPanel() {
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const exportData = async () => {
    if (!supabase) return
    setBusy(true); n.clear()
    const { data, error } = await supabase.from('pikos').select('*, tofus(*)').order('created_at')
    if (error) n.error(error.message)
    else {
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), pikos: data }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = Object.assign(document.createElement('a'), { href: url, download: 'mochi-cloud-library.json' })
      link.click()
      URL.revokeObjectURL(url)
      n.success(`Exported ${data?.length ?? 0} Pikos.`)
    }
    setBusy(false)
  }
  return (
    <Panel title="Export your data" description="Download your Mochi Cloud library (Pikos and Tofus) as JSON. Empty if Cloud sync has never been used." icon={Download}>
      <button disabled={busy} onClick={() => void exportData()} className={btn('secondary')}>{busy ? 'Preparing…' : 'Download JSON'}</button>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function DeletePanel({ user }: { user: User }) {
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  return (
    <Panel title="Delete account" tone="danger" icon={Trash2}
      description="Permanently deletes your Mochi account, profile, Cloud library, and saved service keys. Your local game library on your devices is not affected. This cannot be undone.">
      <ConfirmAction label="Delete my account" confirmLabel="Permanently delete" prompt={`This will permanently delete ${user.email ?? 'your account'}.`} requireText={user.email ?? 'DELETE'} busy={busy}
        onConfirm={async () => {
          setBusy(true)
          const { error } = await deleteMyAccount()
          if (error) n.error(error.message)
          setBusy(false)
        }} />
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}
