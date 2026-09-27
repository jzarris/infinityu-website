import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security middleware for MeltAwayMD
 * - Redirects non-www to www domain
 * - Adds security headers to all responses
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Redirect non-www to www (production only)
  if (hostname === 'meltawaymd.com') {
    const url = request.nextUrl.clone();
    url.host = 'www.meltawaymd.com';
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();

  // Content Security Policy
  // Allows inline styles/scripts for Next.js hydration, restricts other sources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.anthropic.com https://www.zohoapis.com https://accounts.zoho.com https://graph.instagram.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Only set HSTS in production (requires HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    response.headers.set('Content-Security-Policy', csp);
  } else {
    // More permissive CSP for development
    response.headers.set('Content-Security-Policy-Report-Only', csp);
  }

  return response;
}

// Apply middleware to all routes except static files and API routes that need special handling
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
