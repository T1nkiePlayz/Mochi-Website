import { createClient, type User } from '@supabase/supabase-js'

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

// The site may be served from a sub-path (GitHub Pages project sites), so
// redirects must include the pathname rather than only the origin.
export const siteUrl = () => window.location.origin + window.location.pathname.replace(/index\.html$/, '')

const notConfigured = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string, redirectTo?: string) {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo ?? siteUrl() } })
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
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() })
}

export async function signInWithProvider(provider: 'github' | 'google', redirectTo?: string) {
  if (!supabase) return { error: new Error(notConfigured) }
  return supabase.auth.signInWithOAuth({
    provider,
    // HashRouter routes live in the URL fragment. OAuth/PKCE codes must stay in
    // the real query string, so redirect to the site origin and let Supabase
    // detect the returned session before HashRouter takes over.
    options: { redirectTo: redirectTo ?? siteUrl() },
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
    options: { redirectTo: siteUrl() },
  })
  if (result.error) return result
  if (result.data?.url) window.location.assign(result.data.url)
  return result
}

export async function unlinkAuthIdentity(provider: 'github' | 'google', user: User) {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  const identity = user.identities?.find((item) => item.provider === provider)
  if (!identity) return { data: null, error: new Error('No ' + provider + ' identity is linked to this account.') }
  return supabase.auth.unlinkIdentity(identity)
}

export async function refreshAuthSession() {
  if (!supabase) return { data: { session: null }, error: new Error(notConfigured) }
  return supabase.auth.refreshSession()
}

// A passkey sign-in creates its own session, and Supabase does not raise such a session to AAL2. It already proves
// possession of a user-verified credential, so the site remembers (for this tab only) that this account signed in
// with one and does not ask for a second factor again. This is a UI convenience; the database never trusts it.
const PASSKEY_FLAG = 'mochi:passkey-verified'
const rememberPasskeySignIn = (userId: string) => { try { sessionStorage.setItem(PASSKEY_FLAG, userId) } catch { /* storage unavailable */ } }
const forgetPasskeySignIn = () => { try { sessionStorage.removeItem(PASSKEY_FLAG) } catch { /* storage unavailable */ } }
export const signedInWithPasskey = (userId: string) => {
  try { return sessionStorage.getItem(PASSKEY_FLAG) === userId } catch { return false }
}

export async function signOutCurrentUser() {
  if (!supabase) return { error: new Error(notConfigured) }
  forgetPasskeySignIn()
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

export async function getSignInFactors() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }

  const [mfaResult, passkeyResult] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.passkey.list(),
  ])

  if (mfaResult.error) return { data: null, error: mfaResult.error }
  if (passkeyResult.error) return { data: null, error: passkeyResult.error }

  return {
    data: {
      totp: mfaResult.data.totp.filter((factor) => factor.status === 'verified'),
      passkeys: passkeyResult.data ?? [],
    },
    error: null,
  }
}

export async function signInWithPasskey() {
  if (!supabase) return { data: { user: null, session: null }, error: new Error(notConfigured) }
  const result = await supabase.auth.signInWithPasskey()
  if (!result.error && result.data?.user) rememberPasskeySignIn(result.data.user.id)
  return result
}


export type ApiCredentialProvider = 'nexus' | 'igdb' | 'steamgriddb'

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

export async function clearMyCloudData() {
  if (!supabase) return { data: null, error: new Error(notConfigured) }
  return supabase.rpc('clear_my_cloud_data')
}

export async function signOutEverywhere() {
  if (!supabase) return { error: new Error(notConfigured) }
  forgetPasskeySignIn()
  return supabase.auth.signOut({ scope: 'global' })
}

export async function deleteMyAccount(confirmationEmail: string) {
  if (!supabase) return { error: new Error(notConfigured) }
  const { error } = await supabase.rpc('delete_my_account', { confirmation_email: confirmationEmail })
  if (error) return { error }
  forgetPasskeySignIn()
  await supabase.auth.signOut({ scope: 'local' })
  return { error: null }
}

export type AdminStats = {
  users: number; new_7d: number; active_7d: number; cloud_access: number; cloud_sync: number
  admins: number; banned: number; pikos: number; tofus: number
}

export type AdminUser = {
  id: string; email: string | null; display_name: string | null; avatar_url: string | null
  created_at: string; last_sign_in_at: string | null; email_confirmed: boolean; providers: string[]
  authenticator_count: number; passkey_count: number; metadata_sync_allowed: boolean
  cloud_sync_enabled: boolean; is_admin: boolean; banned: boolean
  piko_count: number; tofu_count: number; total_count: number
}

export type AdminAuditEntry = {
  id: number; created_at: string; actor_email: string | null; action: string
  target_id: string | null; target_email: string | null; details: Record<string, unknown>
}

export const adminApi = {
  stats: async () => supabase ? supabase.rpc('admin_overview_stats') : { data: null, error: new Error(notConfigured) },
  users: async (search: string, limit: number, offset: number) =>
    supabase ? supabase.rpc('admin_list_users', { p_search: search, p_limit: limit, p_offset: offset }) : { data: null, error: new Error(notConfigured) },
  audit: async (limit = 50) => supabase ? supabase.rpc('admin_audit_log_list', { p_limit: limit }) : { data: null, error: new Error(notConfigured) },
  clearCloud: async (id: string) => supabase ? supabase.rpc('admin_clear_user_cloud', { target_user_id: id }) : { data: null, error: new Error(notConfigured) },
  revokeSessions: async (id: string) => supabase ? supabase.rpc('admin_revoke_sessions', { target_user_id: id }) : { data: null, error: new Error(notConfigured) },
  setBanned: async (id: string, banned: boolean) => supabase ? supabase.rpc('admin_set_banned', { target_user_id: id, banned }) : { data: null, error: new Error(notConfigured) },
  deleteUser: async (id: string) => supabase ? supabase.rpc('admin_delete_user', { target_user_id: id }) : { data: null, error: new Error(notConfigured) },
}

