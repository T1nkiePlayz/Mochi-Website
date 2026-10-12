import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isAuthRetryableFetchError, type Session } from '@supabase/supabase-js'
import { AuthContext } from './auth-context'
import { supabase, type Profile } from './supabase'

// An access token with more than this left is used as-is on load instead of being rotated.
const FRESH_SESSION_MS = 60_000

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
      const storedSession = data.session
      if (!storedSession) {
        setSession(null)
        setProfile(null)
        setLoading(false)
        return
      }
      const expiresInMs = storedSession.expires_at ? storedSession.expires_at * 1000 - Date.now() : 0
      if (expiresInMs > FRESH_SESSION_MS) {
        // The stored access token is still usable: don't spend a network round trip rotating it
        // before `loading` clears. autoRefreshToken keeps it fresh while the tab is open.
        setSession(storedSession)
        setLoading(false)
        return
      }
      const refreshed = await client.auth.refreshSession()
      if (!active) return
      if (refreshed.error && isAuthRetryableFetchError(refreshed.error)) {
        // Offline or the auth service is briefly unavailable: that says nothing about the session, so keep it
        // (Supabase retries the refresh in the background) instead of signing the user out.
        setSession(storedSession)
      } else if (refreshed.error || !refreshed.data.session) {
        await client.auth.signOut({ scope: 'local' })
        if (active) {
          setSession(null)
          setProfile(null)
        }
      } else {
        setSession(refreshed.data.session)
      }
      if (active) setLoading(false)
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

  // Memoised so consumers (header, gates, dashboard tabs) don't re-render on every AuthProvider render.
  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading, refreshProfile }),
    [session, profile, loading, refreshProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
