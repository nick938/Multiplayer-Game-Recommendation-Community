import createProxy from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * next-intl locale negotiation runs as a Next 16 proxy
 * (the renamed middleware convention).
 */
export default createProxy(routing)

export const config = {
  // Skip API routes, Next internals and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
