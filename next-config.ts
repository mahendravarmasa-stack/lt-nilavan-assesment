import type { NextConfig } from 'next';

const securityHeaders = [
  // Prevent clickjacking — blocks site from being embedded in iframes
  {
    key:   'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME-type sniffing attacks
  {
    key:   'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Legacy XSS filter for older browsers
  {
    key:   'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer information sent with requests
  {
    key:   'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser feature access
  {
    key:   'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Force HTTPS for 2 years
  {
    key:   'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",       // unsafe-inline needed for Next.js
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "frame-src https://maps.google.com",                      // Allow Google Maps iframe in map.tsx
      "connect-src 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source:  '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
