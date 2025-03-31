import { withAuth } from "next-auth/middleware"
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr'

const locales = ['en', 'es'];
const publicPages = ['/', '/privacy-policy', '/auth/login', '/auth/register', '/auth/forgot-password']; // añadidas las rutas de auth

// Primero maneja la internacionalización
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en'
});

// Luego añade la autenticación
export async function middleware(request: NextRequest) {
  // Obtener el locale de la URL actual
  const locale = request.nextUrl.pathname.split('/')[1]

  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.join('|')})?/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(request);
  }

  // Comprueba la autenticación para rutas de la plataforma
  const authMiddleware = withAuth({
    pages: {
      signIn: '/auth/login',
    },
  });

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const SUPABASE_URL =  process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variables');
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name, options) => {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión y la ruta es /platform, redirigir a login
  if (!session && request.nextUrl.pathname.includes('/platform')) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url))
  }

  // Si hay sesión y la ruta es /auth, redirigir a platform
  if (session && request.nextUrl.pathname.includes('/auth')) {
    return NextResponse.redirect(new URL(`/${locale}/platform`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|apple-touch-icon.png|manifest.json).*)'],
}; 