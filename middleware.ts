import { NextRequest, NextResponse } from 'next/server';

// Rate limit: 3 requests per IP per 60 seconds on the sendgrid endpoint
// This is an edge-layer guard — the route handler also has its own limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 3;
const WINDOW_MS  = 60_000;

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/sendgrid') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const now   = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait before submitting again.' },
          {
            status: 429,
            headers: {
              'Retry-After':          '60',
              'X-RateLimit-Limit':    String(RATE_LIMIT),
              'X-RateLimit-Remaining':'0',
            },
          }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/sendgrid',
};
