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

export const btn = (variant: keyof typeof buttonVariants = 'secondary', extra = '') =>
  `${buttonBase} ${buttonVariants[variant]} ${extra}`

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
