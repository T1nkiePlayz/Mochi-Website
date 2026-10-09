/* eslint-disable react-refresh/only-export-components -- This module intentionally exports shared utilities alongside components. */
import { Check, Copy, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export const input =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-400/60 disabled:opacity-50'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'
const buttonVariants = {
  primary: 'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20 hover:brightness-110',
  secondary: 'border border-white/10 bg-white/[0.05] text-slate-100 hover:border-white/20 hover:bg-white/[0.09]',
  danger: 'border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  ghost: 'text-slate-400 hover:text-white',
} as const
export const btn = (variant: keyof typeof buttonVariants = 'secondary', extra = '') => `${buttonBase} ${buttonVariants[variant]} ${extra}`

export function Panel({
  title, description, icon: Icon, action, tone = 'default', children,
}: { title: string; description?: ReactNode; icon?: LucideIcon; action?: ReactNode; tone?: 'default' | 'danger'; children?: ReactNode }) {
  return (
    <section className={`glass-card p-5 sm:p-6 ${tone === 'danger' ? '!border-rose-400/25' : ''}`}>
      <header className="flex items-start gap-3">
        {Icon && <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone === 'danger' ? 'bg-rose-500/10 text-rose-300' : 'bg-violet-500/10 text-violet-200'}`}><Icon className="h-4 w-4" /></span>}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>}
        </div>
        {action}
      </header>
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="px-1 pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{children}</h2>
}

const chipTones = {
  good: 'bg-emerald-500/10 text-emerald-300',
  warn: 'bg-amber-500/10 text-amber-300',
  bad: 'bg-rose-500/10 text-rose-300',
  info: 'bg-cyan-500/10 text-cyan-300',
  muted: 'bg-white/5 text-slate-400',
}
export function Chip({ tone = 'muted', children }: { tone?: keyof typeof chipTones; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${chipTones[tone]}`}>{children}</span>
}

export function Row({ icon: Icon, title, detail, right }: { icon?: LucideIcon; title: ReactNode; detail?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      {Icon && <Icon className="h-4 w-4 shrink-0 text-violet-300" />}
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error' | 'success'; children: ReactNode }) {
  const tones = {
    info: 'border-cyan-400/20 bg-cyan-500/5 text-cyan-100',
    error: 'border-rose-400/25 bg-rose-500/5 text-rose-200',
    success: 'border-emerald-400/20 bg-emerald-500/5 text-emerald-200',
  }
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${tones[tone]}`}>{children}</p>
}

/** Message state that remembers whether it is an error. */
export function useNotice() {
  const [notice, setNotice] = useState<{ tone: 'info' | 'error' | 'success'; text: string } | null>(null)
  return {
    notice,
    clear: () => setNotice(null),
    info: (text: string) => setNotice({ tone: 'info', text }),
    success: (text: string) => setNotice({ tone: 'success', text }),
    error: (text: string) => setNotice({ tone: 'error', text }),
    node: notice ? <Notice tone={notice.tone}>{notice.text}</Notice> : null,
  }
}

export function Skeleton({ className = 'h-16' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-white/[0.05] ${className}`} />
}

export function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? 'bg-emerald-500/70' : 'bg-white/15'}`}>
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

/** Inline confirmation: the button turns into a "are you sure?" row. Optional type-to-confirm. */
export function ConfirmAction({
  label, confirmLabel = 'Yes, continue', prompt = 'Are you sure?', requireText, busy, onConfirm, variant = 'danger', disabled, icon: Icon,
}: {
  label: string; confirmLabel?: string; prompt?: string; requireText?: string; busy?: boolean
  onConfirm: () => void | Promise<void>; variant?: 'danger' | 'secondary'; disabled?: boolean; icon?: LucideIcon
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  if (!open) {
    return <button type="button" disabled={disabled || busy} onClick={() => setOpen(true)} className={btn(variant)}>{Icon && <Icon className="h-4 w-4" />}{busy ? 'Working…' : label}</button>
  }
  const ok = !requireText || typed.trim().toLowerCase() === requireText.toLowerCase()
  return (
    <div className="w-full space-y-3 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] p-4">
      <p className="text-sm text-rose-100">{prompt}</p>
      {requireText && <input autoFocus value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={`Type ${requireText} to confirm`} aria-label={`Type ${requireText} to confirm`} className={input} />}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!ok || busy} onClick={async () => { await onConfirm(); setOpen(false); setTyped('') }} className={btn('danger')}>{busy ? 'Working…' : confirmLabel}</button>
        <button type="button" disabled={busy} onClick={() => { setOpen(false); setTyped('') }} className={btn('ghost')}>Cancel</button>
      </div>
    </div>
  )
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button type="button" onClick={() => { void navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }} className={btn('secondary', '!px-3 !py-1.5')}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : label}
    </button>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function timeAgo(value?: string | null) {
  if (!value) return 'never'
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
