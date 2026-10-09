import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, type Profile } from './supabase'

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
  const [loading, setLoading] = useState(Boolean(supabase))

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase.from('profiles').select('id, display_name, avatar_url, cloud_sync_enabled, metadata_sync_allowed, email').eq('id', session.user.id).maybeSingle()
    if (!error) setProfile(data ? { ...(data as Profile), is_admin: session.user.app_metadata?.role === 'admin' } : null)
  }, [session])

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return

      if (data.session) {
        // Supabase persists the browser session and refresh token locally.
        // Refresh the persisted session when the site is opened again so a
        // long gap between visits does not leave the UI holding an expired
        // access token. Supabase handles refresh-token rotation and expiry.
        const refreshed = await supabase.auth.refreshSession()
        // Do not resurrect an old session when refresh fails or returns no session.
        if (active) {
          if (refreshed.error || !refreshed.data.session) {
            await supabase.auth.signOut({ scope: 'local' })
            setSession(null)
            setProfile(null)
          } else {
            setSession(refreshed.data.session)
          }
          setLoading(false)
        }
      } else {
        setSession(null)
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
    void Promise.resolve().then(() => refreshProfile())
  }, [refreshProfile])

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
