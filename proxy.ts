import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED_LANGS = ['cs', 'en', 'ur'];
const DEFAULT_LANG = 'cs';

export async function proxy(request: NextRequest) {
  console.log('🍪 Všechny cookies:', request.cookies.getAll());

  const { pathname } = request.nextUrl;

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  response.headers.set('x-pathname', pathname);
  
  console.log('📌 proxy nastavuje x-pathname:', pathname);

  if (pathname.startsWith('/priest')) {
    console.log('🔓 Propouštím farářskou cestu:', pathname);
    return response;
  }

  const first = pathname.split('/')[1];
  if (SUPPORTED_LANGS.includes(first)) {
    return response;
  }

  if (pathname === '/') {
    const header = request.headers.get('accept-language') || '';
    const preferred = header.split(',')[0].split('-')[0];
    const lang = SUPPORTED_LANGS.includes(preferred) ? preferred : DEFAULT_LANG;
    const redirectResponse = NextResponse.redirect(new URL(`/${lang}`, request.url));
    redirectResponse.headers.set('x-pathname', '/');
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};