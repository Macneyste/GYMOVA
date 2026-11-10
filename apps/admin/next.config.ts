import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').origin;
  } catch {
    return 'http://localhost:3000';
  }
})();

// The admin talks only to the GYMOVA API. Production CSP blocks every other origin, framing and plugins.
// (Next.js dev mode needs eval for fast refresh, so the CSP is production-only.)
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@gymova/api-client', '@gymova/shared-types', '@gymova/shared-validation', '@gymova/design-tokens'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isProd
            ? [
                { key: 'Content-Security-Policy', value: csp },
                { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
