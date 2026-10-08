import md5 from 'blueimp-md5'

export function avatarFor(email: string | null | undefined, avatarUrl: string | null | undefined, size = 96) {
  if (avatarUrl) return avatarUrl
  const normalized = email?.trim().toLowerCase() ?? ''
  return normalized ? `https://www.gravatar.com/avatar/${md5(normalized)}?d=identicon&s=${size}` : ''
}
