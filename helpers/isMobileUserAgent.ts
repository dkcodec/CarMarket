const MOBILE_REGEX =
  /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i

export function isMobileUserAgent(ua: string): boolean {
  return MOBILE_REGEX.test(ua)
}
