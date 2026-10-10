import type { User } from '@supabase/supabase-js'
import { Fingerprint, KeyRound, Link2, Mail, ShieldCheck, Smartphone, Lock, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  deletePasskey, enrollTotp, linkAuthIdentity, listMfaFactors, listPasskeys, manageApiCredential, registerPasskey,
  unenrollTotp, unlinkAuthIdentity, verifyTotpEnrollment, type ApiCredentialProvider,
} from '../lib/supabase'
import { Chip, ConfirmAction, Field, Panel, Row, SectionLabel, Skeleton } from './ui'
import { btn, formatDate, input } from './ui-utils'
import { useNotice } from './useNotice'

type Factor = { id: string; status: string; friendly_name?: string }
type Passkey = { id: string; friendly_name?: string | null; created_at?: string }

export default function SecurityTab({ user }: { user: User }) {
  const [factors, setFactors] = useState<Factor[]>([])
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const load = useCallback(async () => {
    const [mfa, keys] = await Promise.all([listMfaFactors(), listPasskeys()])
    if (mfa.error) setLoadError(mfa.error.message)
    else setFactors([...(mfa.data?.totp ?? [])] as Factor[])
    if (keys.error) setLoadError(keys.error.message)
    else setPasskeys((keys.data ?? []) as Passkey[])
    setLoading(false)
  }, [])
  useEffect(() => {
    let active = true
    void Promise.resolve().then(async () => {
      if (!active) return
      await load()
    })
    return () => { active = false }
  }, [load])

  const verified = factors.filter((factor) => factor.status === 'verified')
  const identities = new Set((user.identities ?? []).map((identity) => identity.provider))
  const hasPassword = identities.has('email')

  const methods = [
    { icon: Lock, title: 'Password', on: hasPassword, detail: hasPassword ? 'Set' : 'Not set — add one under Account' },
    { icon: Mail, title: 'Email code', on: true, detail: 'Always available for your verified email' },
    { icon: Link2, title: 'Google', on: identities.has('google'), detail: identities.has('google') ? 'Linked' : 'Not linked' },
    { icon: Link2, title: 'GitHub', on: identities.has('github'), detail: identities.has('github') ? 'Linked' : 'Not linked' },
    { icon: Fingerprint, title: 'Passkeys', on: passkeys.length > 0, detail: passkeys.length ? `${passkeys.length} registered` : 'None registered' },
    { icon: Smartphone, title: 'Authenticator app', on: verified.length > 0, detail: verified.length ? 'Enabled' : 'Not set up' },
  ]
  const secondFactor = passkeys.length > 0 || verified.length > 0

  return (
    <div className="space-y-4">
      <Panel title="Sign-in methods" description="Every way you can get into this account." icon={ShieldCheck}>
        {loading ? <div className="space-y-2"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : (
          <div className="space-y-2">
            {methods.map(({ icon, title, on, detail }) => <Row key={title} icon={icon} title={title} detail={detail} right={<Chip tone={on ? 'good' : 'muted'}>{on ? 'On' : 'Off'}</Chip>} />)}
          </div>
        )}
        {!loading && !secondFactor && <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-4 text-sm leading-6 text-amber-100">Your account has no second sign-in factor. Add a passkey or an authenticator app below so a stolen password or email code isn’t enough to get in.</div>}
        {loadError && <div className="mt-4 text-sm text-rose-300">{loadError}</div>}
      </Panel>

      <AuthenticatorPanel factors={factors} reload={load} />
      <PasskeyPanel passkeys={passkeys} reload={load} />

      <SectionLabel>Connections</SectionLabel>
      <LinkedAccountsPanel user={user} />
      <ServiceKeysPanel />
    </div>
  )
}

function AuthenticatorPanel({ factors, reload }: { factors: Factor[]; reload: () => Promise<void> }) {
  const [setup, setSetup] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const verified = factors.filter((factor) => factor.status === 'verified')

  const start = async () => {
    setBusy(true); n.clear()
    // Pending factors lose their secret on refresh, so always enrol a fresh, uniquely named one.
    const hasPending = factors.some((factor) => factor.status !== 'verified')
    const { data, error } = await enrollTotp(hasPending ? `Mochi authenticator ${Date.now().toString().slice(-6)}` : undefined)
    if (error) n.error(error.message)
    else { setSetup({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret }); await reload() }
    setBusy(false)
  }
  const finish = async () => {
    if (!setup) return
    setBusy(true); n.clear()
    const { error } = await verifyTotpEnrollment(setup.id, code.trim())
    if (error) n.error(error.message)
    else { setSetup(null); setCode(''); n.success('Authenticator app enabled. Other sessions may need to sign in again.'); await reload() }
    setBusy(false)
  }
  const cancel = async () => {
    if (!setup) return
    setBusy(true)
    const { error } = await unenrollTotp(setup.id)
    if (error) n.error(error.message)
    else { setSetup(null); setCode(''); await reload() }
    setBusy(false)
  }
  const remove = async (id: string) => {
    const { error } = await unenrollTotp(id)
    if (error) n.error(error.message)
    else { n.success('Authenticator removed.'); await reload() }
  }

  return (
    <Panel title="Authenticator app" description="A 6-digit code from an app such as Aegis, 1Password, or Google Authenticator." icon={Smartphone}
      action={<Chip tone={verified.length ? 'good' : 'muted'}>{verified.length ? 'Enabled' : 'Off'}</Chip>}>
      {verified.length > 0 && <div className="mb-4 space-y-2">{verified.map((factor) => <Row key={factor.id} title={factor.friendly_name || 'Authenticator'} right={<ConfirmAction label="Remove" prompt="Remove this authenticator? You'll lose this second factor." confirmLabel="Remove" onConfirm={() => remove(factor.id)} />} />)}</div>}
      {setup ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex flex-wrap items-center gap-5">
            <img src={setup.qr} alt="Authenticator setup QR code" className="h-40 w-40 rounded-xl bg-white p-2" />
            <div className="min-w-0 flex-1 basis-48 text-sm leading-6 text-slate-400">Scan the QR code, or enter this key manually:<p className="mt-1 break-all font-mono text-xs text-slate-200">{setup.secret}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} aria-label="6-digit code" placeholder="123456" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className={`${input} !w-36 text-center font-mono tracking-widest`} />
            <button disabled={busy || code.length !== 6} onClick={() => void finish()} className={btn('primary')}>Verify</button>
            <button disabled={busy} onClick={() => void cancel()} className={btn('ghost')}>Cancel</button>
          </div>
        </div>
      ) : <button disabled={busy} onClick={() => void start()} className={btn('secondary')}><Plus className="h-4 w-4" />{verified.length ? 'Add another authenticator' : 'Set up authenticator app'}</button>}
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function PasskeyPanel({ passkeys, reload }: { passkeys: Passkey[]; reload: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  const add = async () => {
    setBusy(true); n.clear()
    const { error } = await registerPasskey()
    if (error) n.error(error.message)
    else { n.success('Passkey registered.'); await reload() }
    setBusy(false)
  }
  const remove = async (id: string) => {
    const { error } = await deletePasskey(id)
    if (error) n.error(error.message)
    else { n.success('Passkey removed.'); await reload() }
  }
  return (
    <Panel title="Passkeys" description="Use your device, password manager, biometrics, or a security key instead of typing a code." icon={Fingerprint}
      action={<Chip tone={passkeys.length ? 'good' : 'muted'}>{passkeys.length ? `${passkeys.length} registered` : 'None'}</Chip>}>
      {passkeys.length > 0 && <div className="mb-4 space-y-2">{passkeys.map((passkey) => <Row key={passkey.id} icon={Fingerprint} title={passkey.friendly_name || 'Mochi passkey'} detail={`Added ${formatDate(passkey.created_at)}`} right={<ConfirmAction label="Remove" prompt="Remove this passkey?" confirmLabel="Remove" onConfirm={() => remove(passkey.id)} />} />)}</div>}
      <button disabled={busy} onClick={() => void add()} className={btn('secondary')}><Plus className="h-4 w-4" />{busy ? 'Waiting for your device…' : 'Add a passkey'}</button>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

function LinkedAccountsPanel({ user }: { user: User }) {
  const [linked, setLinked] = useState(() => new Set((user.identities ?? []).map((identity) => identity.provider)))
  const hasAlternativeIdentity = linked.size > 1 || (user.identities ?? []).some((identity) => identity.provider === 'email')
  const [busy, setBusy] = useState(false)
  const n = useNotice()
  return (
    <Panel title="Linked accounts" description="Link Google or GitHub to sign in with them. You'll be redirected to the provider and brought back." icon={Link2}>
      <div className="space-y-2">
        {(['google', 'github'] as const).map((provider) => (
          <Row key={provider} icon={Link2} title={provider === 'google' ? 'Google' : 'GitHub'} detail={linked.has(provider) ? 'Linked' : 'Not linked'}
            right={linked.has(provider)
              ? <ConfirmAction label="Unlink" prompt={hasAlternativeIdentity ? `Unlink ${provider}? Make sure you have another way to sign in.` : 'You cannot unlink your only linked sign-in identity. Link and verify another sign-in method first.'} confirmLabel="Unlink" busy={busy || !hasAlternativeIdentity} onConfirm={async () => {
                  if (!hasAlternativeIdentity) { n.error('Link another sign-in method before unlinking this one.'); return }
                  setBusy(true)
                  const { error } = await unlinkAuthIdentity(provider, user)
                  if (error) n.error(error.message)
                  else { setLinked((current) => { const next = new Set(current); next.delete(provider); return next }); n.success(`${provider === 'google' ? 'Google' : 'GitHub'} unlinked.`) }
                  setBusy(false)
                }} />
              : <button disabled={busy} onClick={async () => { n.clear(); const { error } = await linkAuthIdentity(provider); if (error) n.error(error.message) }} className={btn('secondary')}>Link</button>} />
        ))}
      </div>
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}

type Provider = ApiCredentialProvider

function ServiceKeysPanel() {
  const [configured, setConfigured] = useState<Record<Provider, boolean>>({ igdb: false, nexus: false, steamgriddb: false })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Provider | null>(null)
  const [clientId, setClientId] = useState('')
  const [secret, setSecret] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const n = useNotice()

  useEffect(() => {
    let active = true
    void manageApiCredential('status').then(({ data, error }) => {
      if (!active) return
      if (error) n.error(error.message)
      else { const providers = (data?.providers ?? []) as string[]; setConfigured({ igdb: providers.includes('igdb'), nexus: providers.includes('nexus'), steamgriddb: providers.includes('steamgriddb') }) }
      setLoading(false)
    })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [])

  const reset = () => { setEditing(null); setClientId(''); setSecret(''); setShow(false) }

  const save = async (provider: Provider) => {
    let value: string
    if (provider === 'igdb') {
      if (!clientId.trim() || !secret.trim()) { n.error('Enter both the Client ID and Client Secret.'); return }
      value = JSON.stringify({ clientId: clientId.trim(), clientSecret: secret.trim() })
    } else if (provider === 'nexus') {
      const key = secret.trim()
      if (key.length < 32) { n.error('Nexus Mods Personal API Keys are at least 32 characters.'); return }
      if (key.length > 4096 || /[^!-~]/.test(key)) { n.error('Paste the full key without spaces or line breaks.'); return }
      value = key
    } else {
      const key = secret.trim()
      if (!/^[A-Za-z0-9_-]{16,256}$/.test(key)) {
        n.error('SteamGridDB API keys must be 16–256 characters and contain only letters, numbers, dashes, or underscores.')
        return
      }
      value = key
    }
    setBusy(true); n.clear()
    const { error } = await manageApiCredential('set', provider, value)
    if (error) n.error(error.message)
    else { setConfigured((current) => ({ ...current, [provider]: true })); reset(); n.success(`${provider === 'igdb' ? 'IGDB' : provider === 'nexus' ? 'Nexus Mods' : 'SteamGridDB'} key saved.`) }
    setBusy(false)
  }
  const remove = async (provider: Provider) => {
    setBusy(true); n.clear()
    const { error } = await manageApiCredential('delete', provider)
    if (error) n.error(error.message)
    else { setConfigured((current) => ({ ...current, [provider]: false })); n.success('Service key removed.') }
    setBusy(false)
  }

  const services: { id: Provider; name: string; text: string; link: string }[] = [
    { id: 'igdb', name: 'IGDB', text: 'Game artwork and metadata (Twitch Client ID and Secret).', link: 'https://dev.twitch.tv/console/apps' },
    { id: 'nexus', name: 'Nexus Mods', text: 'Experimental mod discovery (Personal API Key).', link: 'https://next.nexusmods.com/settings/api-keys' },
    { id: 'steamgriddb', name: 'SteamGridDB', text: 'Custom game artwork, grids, heroes, logos and icons (API Key).', link: 'https://www.steamgriddb.com/profile/preferences' },
  ]

  return (
    <Panel title="Service keys" icon={KeyRound}
      description="Keys for outside services, stored privately on your account and never shown again after saving. The Mochi launcher uses them on your behalf.">
      {loading ? <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : (
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="space-y-3">
              <Row icon={KeyRound} title={service.name} detail={service.text}
                right={<>
                  <Chip tone={configured[service.id] ? 'good' : 'muted'}>{configured[service.id] ? 'Saved' : 'Not set'}</Chip>
                  {editing !== service.id && <button disabled={busy} onClick={() => { reset(); setEditing(service.id) }} className={btn('secondary', '!px-3 !py-1.5')}>{configured[service.id] ? 'Replace' : 'Add'}</button>}
                </>} />
              {editing === service.id && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                  {service.id === 'igdb' && <Field label="Client ID"><input value={clientId} onChange={(event) => setClientId(event.target.value)} autoComplete="off" spellCheck={false} className={`${input} font-mono text-sm`} /></Field>}
                  <Field label={service.id === 'igdb' ? 'Client Secret' : service.id === 'nexus' ? 'Personal API Key' : 'API Key'}>
                    <div className="flex gap-2">
                      <input type={show ? 'text' : 'password'} value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="off" spellCheck={false} className={`${input} font-mono text-sm`} />
                      <button type="button" onClick={() => setShow(!show)} className={btn('secondary')}>{show ? 'Hide' : 'Show'}</button>
                    </div>
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    <button disabled={busy} onClick={() => void save(service.id)} className={btn('primary')}>{busy ? 'Saving…' : 'Save key'}</button>
                    <button disabled={busy} onClick={reset} className={btn('ghost')}>Cancel</button>
                    <a href={service.link} target="_blank" rel="noreferrer" className="ml-auto text-xs text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-white">Get a key ↗</a>
                  </div>
                </div>
              )}
              {configured[service.id] && editing !== service.id && <div className="pl-1"><ConfirmAction label={`Remove ${service.name} key`} prompt={`Remove your saved ${service.name} key? Features that need it will stop working.`} confirmLabel="Remove key" busy={busy} onConfirm={() => remove(service.id)} /></div>}
            </div>
          ))}
        </div>
      )}
      {n.node && <div className="mt-4">{n.node}</div>}
    </Panel>
  )
}
