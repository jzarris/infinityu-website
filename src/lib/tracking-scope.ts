/**
 * Which routes may load third-party tracking scripts.
 *
 * Authenticated and health-related surfaces never load them: analytics and ad
 * pixels would otherwise receive the URL of every page a patient views. Keep
 * this list conservative; adding a new protected area means adding it here.
 */
export const TRACKING_EXCLUDED_PREFIXES = ['/portal', '/admin', '/simulate', '/auth', '/api'] as const;

export function trackingAllowedForPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return !TRACKING_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );
}
