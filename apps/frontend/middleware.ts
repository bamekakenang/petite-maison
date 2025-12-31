import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

const intl = createMiddleware({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) || 'fr';
  // Protect account pages
  if (pathname === `/${locale}/compte` || pathname.startsWith(`/${locale}/compte/`)) {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/connexion`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\.).*)']
};
