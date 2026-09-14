export const SESSION_COOKIE = 'mmdg_session'

export function hasSessionCookie(): boolean {
  return document.cookie.split('; ').some((entry) => entry.startsWith(`${SESSION_COOKIE}=`))
}
