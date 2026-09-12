import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone server bundle — self-contained output for Node hosts;
  // the Cloudflare/OpenNext build ignores it.
  output: 'standalone' as const,
  // Workspace packages ship TypeScript sources; Next transpiles them.
  transpilePackages: ['@mgc/config', '@mgc/domain', '@mgc/recommendation', '@mgc/db', '@mgc/auth'],
  // PGlite loads its WASM engine lazily relative to its own module URL;
  // bundling it breaks that resolution. Keep it a plain Node dependency.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Keep the build self-contained (no Google Fonts — plan §45).
  images: { unoptimized: true },
}

export default withNextIntl(nextConfig)
