import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/auth/login',
    '/auth/cadastro',
    '/confirmacao-email',
  ];

  // Rotas de API não precisam de redirect
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Verifica se tem o cookie access_token
  const token = request.cookies.get('access_token')?.value;

  // Se não tem token e não está em rota pública, redireciona para login
  if (!token && !publicRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se tem token e está na página de login, redireciona para dashboard
  if (token && pathname === '/auth/login') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Se tem token e está na raiz, redireciona para dashboard
  if (token && pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
