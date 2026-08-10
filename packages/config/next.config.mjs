const apiOrigin = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : "https://jobs-view-api-edge.career-os-cloudflare-edge.workers.dev";
const monitoringOrigin = process.env.NEXT_PUBLIC_MONITORING_ENDPOINT ? new URL(process.env.NEXT_PUBLIC_MONITORING_ENDPOINT).origin : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  transpilePackages: [
    "@career-os/ui",
    "@career-os/config",
    "@career-os/types",
    "@career-os/shared",
    "@career-os/hooks",
    "@career-os/utils"
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.cloudflare.com" }
    ]
  },
  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://checkout.razorpay.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com https://www.gstatic.com",
          "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://www.gstatic.com https://fonts.gstatic.com",
          `connect-src 'self' ${apiOrigin} ${monitoringOrigin} https://www.google-analytics.com https://www.clarity.ms https://api.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com`.trim(),
          "frame-src https://api.razorpay.com https://checkout.razorpay.com https://translate.google.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join("; ")
      }
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  }
};

export default nextConfig;
