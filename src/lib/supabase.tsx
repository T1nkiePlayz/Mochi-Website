import { createClient, type Session, type User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  cloud_sync_enabled: boolean
  metadata_sync_allowed: boolean
  is_admin: boolean
  email: string | null
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          experimental: { passkey: true },
        },
      })
    : null

const notConfigured = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
}

export async function sendSignInCode(email: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
}

export async function verifySignInCode(email: string, token: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.verifyOtp({ email, token, type: 'email' })
}

export async function resetPassword(email: string) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
}

export async function signInWithProvider(provider: 'github' | 'google') {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.signInWithOAuth({
    provider,
    // HashRouter routes live in the URL fragment. OAuth/PKCE codes must stay in
    // the real query string, so redirect to the site origin and let Supabase
    // detect the returned session before HashRouter takes over.
    options: { redirectTo: window.location.origin },
  })
}

export async function updateEmail(email: string) {
  if (!supabase) return { data: { user: null }, error: new Error(notConfigured) }
  return supabase.auth.updateUser({ email })
}

export async function updatePassword(password: string, currentPassword?: string) {
  if (!supabase) return { data: { user: null }, error: new Error(notConfigured) }
  return supabase.auth.updateUser({
    password,
    ...(currentPassword ? { current_password: currentPassword } : {}),
  })
}

export async function linkAuthIdentity(provider: 'github' | 'google') {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  const result = await supabase.auth.linkIdentity({
    provider,
    options: { redirectTo: window.location.origin },
  })
  if (result.error) return result
  if (result.data?.url) window.location.assign(result.data.url)
  return result
}

export async function refreshAuthSession() {
  if (!supabase) return { data: { session: null }, error: new Error(notConfigured) }
  return supabase.auth.refreshSession()
}

export async function signOutCurrentUser() {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.signOut()
}

export async function listMfaFactors() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.mfa.listFactors()
}

export async function enrollTotp(friendlyName = 'Mochi authenticator') {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName })
}

export async function unenrollTotp(factorId: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.mfa.unenroll({ factorId })
}

export async function listPasskeys() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.passkey.list()
}

export async function registerPasskey() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.registerPasskey()
}

export async function deletePasskey(passkeyId: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.auth.passkey.delete({ passkeyId })
}

export async function verifyTotpEnrollment(factorId: string, code: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  const challenge = await supabase.auth.mfa.challenge({ factorId })
  if (challenge.error) return { data: null, error: challenge.error }
  return supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code })
}

export async function verifyMfaLogin(code: string) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  const factors = await supabase.auth.mfa.listFactors()
  if (factors.error) return { data: null, error: factors.error }
  const factor = factors.data.totp.find((item) => item.status === 'verified')
  if (!factor) return { data: null, error: new Error('No verified authenticator app is available for this account.') }
  return supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code })
}


export type ApiCredentialProvider = 'nexus' | 'igdb'

export async function manageApiCredential(
  action: 'set' | 'status' | 'delete',
  provider?: ApiCredentialProvider,
  secret?: string,
) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }

  const body = {
    action,
    ...(provider ? { provider } : {}),
    ...(secret !== undefined ? { secret } : {}),
  }

  const { data, error } = await supabase.functions.invoke('store-provider-credentials', {
    body,
  })

  if (error) return { data: null, error }
  if (data?.error) return { data: null, error: new Error(data.error) }
  return { data, error: null }
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

export async function setUserCloudSync(userId: string, enabled: boolean) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.rpc('admin_set_cloud_sync', { target_user_id: userId, enabled })
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
    if (!error) setProfile(data ? { ...(data as Profile), is_admin: session.user.app_metadata?.role === 'admin' } : null)
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return

      // Refresh once on startup so server-managed app_metadata (including the
      // admin role) is reflected in the current JWT without requiring the
      // user to discover that they need to sign out and back in.
      if (data.session) {
        const refreshed = await supabase.auth.refreshSession()
        if (active) {
          setSession(refreshed.data.session ?? data.session)
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
    void refreshProfile()
  }, [session?.user.id])

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
