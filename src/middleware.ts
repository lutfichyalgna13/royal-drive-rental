import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Common attack vectors and malicious scanner paths to block immediately
const BLOCKED_PATTERNS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.svn/i,
  /\/\.DS_Store/i,
  /\/wp-login\.php/i,
  /\/wp-admin/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/cgi-bin/i,
  /\/\.aws/i,
  /\/\.ssh/i,
  /\.bak$/i,
  /\.config$/i,
  /\/\.\./,      // Path traversal
  /%2e%2e/i,    // Encoded path traversal
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Block malicious path traversal and vulnerability scanners
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Access Denied: Malicious request blocked by Royal Drive Security Engine.", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  // 2. Clone response and inject industry-standard Security Headers
  const response = NextResponse.next();

  // Protect against clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Site Scripting filter
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Enforce HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Disable sensitive hardware access
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
