import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from './auth-context'
import { supabase, type Profile } from './supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const profileRequest = useRef(0)
  const activeUserId = useRef<string | null>(null)
  const userId = session?.user.id ?? null
  const userRole = session?.user.app_metadata?.role

  const refreshProfile = useCallback(async () => {
    const requestId = ++profileRequest.current
    if (!supabase || !userId) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, cloud_sync_enabled, metadata_sync_allowed, email')
      .eq('id', userId)
      .maybeSingle()

    // Account changes and overlapping refreshes must never restore stale data.
    if (requestId !== profileRequest.current || activeUserId.current !== userId) return
    if (error || !data) {
      setProfile(null)
      return
    }
    setProfile({ ...(data as Profile), is_admin: userRole === 'admin' })
  }, [userId, userRole])

  useEffect(() => {
    if (!supabase) return
    const client = supabase
    let active = true
    client.auth.getSession().then(async ({ data }) => {
      if (!active) return
      if (data.session) {
        // Refresh the persisted session on return; Supabase rotates refresh tokens.
        const refreshed = await client.auth.refreshSession()
        if (!active) return
        if (refreshed.error || !refreshed.data.session) {
          await client.auth.signOut({ scope: 'local' })
          if (active) {
            setSession(null)
            setProfile(null)
          }
        } else {
          setSession(refreshed.data.session)
        }
        if (active) setLoading(false)
      } else {
        setSession(null)
        setProfile(null)
        setLoading(false)
      }
    }).catch(() => {
      if (active) {
        setSession(null)
        setProfile(null)
        setLoading(false)
      }
    })
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => {
      active = false
      profileRequest.current += 1
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (activeUserId.current !== userId) {
      activeUserId.current = userId
      profileRequest.current += 1
      setProfile(null)
    }
    void Promise.resolve().then(() => refreshProfile())
  }, [userId, refreshProfile])

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}
