import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth-context'
import { supabase, type Profile } from './supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    const client = supabase
    const { data, error } = await client.from('profiles').select('id, display_name, avatar_url, cloud_sync_enabled, metadata_sync_allowed, email').eq('id', session.user.id).maybeSingle()
    if (!error) setProfile(data ? { ...(data as Profile), is_admin: session.user.app_metadata?.role === 'admin' } : null)
  }, [session])

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true
    client.auth.getSession().then(async ({ data }) => {
      if (!active) return

      if (data.session) {
        // Supabase persists the browser session and refresh token locally.
        // Refresh the persisted session when the site is opened again so a
        // long gap between visits does not leave the UI holding an expired
        // access token. Supabase handles refresh-token rotation and expiry.
        const refreshed = await client.auth.refreshSession()
        // Do not resurrect an old session when refresh fails or returns no session.
        if (active) {
          if (refreshed.error || !refreshed.data.session) {
            await client.auth.signOut({ scope: 'local' })
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
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
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
