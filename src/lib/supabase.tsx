import { createClient, type Session, type User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  cloud_sync_enabled: boolean
  metadata_sync_allowed: boolean
  is_admin: boolean
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

const notConfigured = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
}

export async function resetPassword(email: string) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
}

export async function signInWithProvider(provider: 'github' | 'google' | 'discord' | 'azure' | 'apple') {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.hash },
  })
}

export async function signOutCurrentUser() {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.signOut()
}

export async function updateMyProfile(values: Pick<Profile, 'display_name' | 'avatar_url' | 'cloud_sync_enabled' | 'metadata_sync_allowed'>) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.rpc('update_my_profile', { profile_data: values })
}

export async function listProfiles() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.rpc('admin_list_profiles')
}

export async function setUserMetadataAccess(userId: string, allowed: boolean) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.rpc('admin_set_metadata_access', { target_user_id: userId, allowed })
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => undefined,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    if (!error) setProfile(data as Profile | null)
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    void refreshProfile()
  }, [session?.user.id])

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
