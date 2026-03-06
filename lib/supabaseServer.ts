import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPPORTED_LANGS = ['cs', 'en', 'ur'];
const DEFAULT_LANG = 'cs';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🛡️ OCHRANA FARÁŘSKÉ SEKCE
  if (pathname.startsWith('/priest')) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = new URL('/priest/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: priest } = await supabase
      .from('priests')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!priest) {
      await supabase.auth.signOut();
      const redirectUrl = new URL('/priest/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  // 🌍 PŘESMĚROVÁNÍ PODLE JAZYKA
  const first = pathname.split('/')[1];
  if (SUPPORTED_LANGS.includes(first)) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const header = request.headers.get('accept-language') || '';
    const preferred = header.split(',')[0].split('-')[0];
    const lang = SUPPORTED_LANGS.includes(preferred) ? preferred : DEFAULT_LANG;
    return NextResponse.redirect(new URL(`/${lang}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};