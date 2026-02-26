import { NextResponse, type NextRequest } from 'next/server';

/**
 * Decodifica JWT sem verificação (apenas para leitura de claims)
 * Usado apenas no middleware do frontend para ler dados do token
 */
function decodeJwtPayload(token: string): { Sala_Codigo?: string } | null {
   try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
         atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
      );

      return JSON.parse(jsonPayload);
   } catch {
      return null;
   }
}

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;

   // Rotas de API não precisam de redirect
   if (pathname.startsWith('/api/')) {
      return NextResponse.next();
   }

   // ==========================================
   // CONTROLE DE NAVEGAÇÃO BASEADO EM SALA
   // ==========================================
   // Token de sala usa COOKIE pois precisa persistir entre navegações de página (SSR)
   // Diferente do auth que usa localStorage + headers
   const tokenSala = request.cookies.get('token_sala')?.value;

   // Se tem token_sala, usuário está "locked" em uma sessão de sala
   if (tokenSala) {
      // Decodifica token para extrair código da sala
      const decoded = decodeJwtPayload(tokenSala);
      const codigoSala = decoded?.Sala_Codigo;

      // Rotas públicas permitidas mesmo com token_sala
      const publicRoutes = [
         '/auth/login',
         '/auth/cadastro',
         '/confirmacao-email',
      ];

      const isRotaPublica = publicRoutes.some((route) =>
         pathname.startsWith(route),
      );

      // Permitir apenas rotas da sala específica ou rotas públicas
      const isRotaSalaCorreta =
         codigoSala && pathname === `/salas/${codigoSala}`;

      if (!isRotaSalaCorreta && !isRotaPublica) {
         // Redirecionar para a sala correta se temos o código
         if (codigoSala) {
            const salaUrl = new URL(`/salas/${codigoSala}`, request.url);
            return NextResponse.redirect(salaUrl);
         }

         // Fallback: redireciona para lista de salas
         const salasUrl = new URL('/salas', request.url);
         return NextResponse.redirect(salasUrl);
      }
   }

   // Se não tem token_sala mas está tentando acessar sala específica (planejamento)
   // Bloquear acesso direto, deve entrar via POST /salas/entrar
   if (!tokenSala && pathname.match(/^\/salas\/[A-Z0-9]+$/)) {
      const salasUrl = new URL('/salas', request.url);
      return NextResponse.redirect(salasUrl);
   }

   // ==========================================
   // SEM VALIDAÇÃO DE AUTH NO MIDDLEWARE
   // ==========================================
   // Auth é gerenciada via Redux + localStorage no cliente
   // Backend valida tokens via headers em cada requisição

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
