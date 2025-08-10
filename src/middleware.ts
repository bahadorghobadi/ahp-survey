import createIntlMiddleware from 'next-intl/middleware';

export default createIntlMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa'
});

export const config = {
  matcher: ['/', '/(fa|en)/:path*']
};