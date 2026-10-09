import { Cloud, LayoutDashboard, LogOut, Shield, ShieldCheck, UserRound, Users, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { avatarFor } from '../lib/avatar'
import { signOutCurrentUser } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import AccountTab from './AccountTab'
import AdminTab from './AdminTab'
import CloudTab from './CloudTab'
import OverviewTab from './OverviewTab'
import SecurityTab from './SecurityTab'
import { Chip } from './ui'
import { btn } from './ui-utils'

type TabId = 'overview' | 'account' | 'security' | 'cloud' | 'admin'

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [tab, setTab] = useState<TabId>('overview')

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md pt-6">
        <div className="glass-card p-8 text-center">
          <UserRound className="mx-auto h-8 w-8 text-violet-300" />
          <h1 className="mt-4 text-xl font-bold text-white">Sign in to see your dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your Mochi account, security, and cloud sync.</p>
          <Link to="/signin" className={btn('primary', 'mt-6 w-full')}>Sign in</Link>
        </div>
      </div>
    )
  }

  const isAdmin = user.app_metadata?.role === 'admin' || profile?.is_admin === true
  const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'account', label: 'Account', icon: UserRound },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'cloud', label: 'Cloud', icon: Cloud },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: Users }] : []),
  ]
  const active = tabs.some((item) => item.id === tab) ? tab : 'overview'

  return (
    <div className={`mx-auto w-full pb-12 pt-2 sm:pt-4 max-w-3xl`}>
      <header className="glass-card flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <img src={avatarFor(user.email, profile?.avatar_url, 128)} alt="" className="h-12 w-12 shrink-0 rounded-full border border-white/15 bg-slate-900 object-cover" decoding="async" />
        <div className="min-w-0 flex-1 basis-48">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-white">{profile?.display_name || 'Your account'}</h1>
            {isAdmin && <Chip tone="info"><Shield className="mr-1 h-3 w-3" />Admin</Chip>}
          </div>
          <p className="truncate text-sm text-slate-400">{user.email}</p>
        </div>
        <button onClick={() => void signOutCurrentUser()} className={btn('secondary', '!px-3.5')}><LogOut className="h-4 w-4" />Sign out</button>
      </header>

      <nav aria-label="Dashboard sections" role="tablist" className="no-scrollbar -mx-4 mt-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" aria-selected={active === id} onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${active === id ? 'bg-violet-500/20 text-white ring-1 ring-violet-400/30' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </nav>

      <main className="mt-5" role="tabpanel">
        {active === 'overview' && <OverviewTab user={user} profile={profile} go={setTab} />}
        {active === 'account' && <AccountTab user={user} profile={profile} refreshProfile={refreshProfile} />}
        {active === 'security' && <SecurityTab user={user} />}
        {active === 'cloud' && <CloudTab profile={profile} refreshProfile={refreshProfile} />}
        {active === 'admin' && isAdmin && <AdminTab />}
      </main>
    </div>
  )
}
