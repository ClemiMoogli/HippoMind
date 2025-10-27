import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Only match pages, explicitly exclude API routes, static files, and Next.js internals
  matcher: ['/', '/(fr|en)/:path*', '/((?!api/|_next/|_vercel/|.*\\..*).*)', '!/api/:path*']
};
