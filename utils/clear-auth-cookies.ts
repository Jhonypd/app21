import { deleteCookie } from 'cookies-next';

/**
 * Limpa TODOS os cookies de autenticação
 * Útil antes de fazer login para evitar conflitos com tokens expirados
 */
export function clearAllAuthCookies() {
  const cookies = [
    'access_token',
    'refresh_token',
    'token_sala',
  ];

  // Método 1: Usar cookies-next (mais confiável)
  cookies.forEach((cookieName) => {
    try {
      deleteCookie(cookieName, { path: '/' });
      deleteCookie(cookieName); // Sem path como fallback
    } catch (e) {
      // Ignorar erros de SSR
    }
  });

  // Método 2: document.cookie direto (múltiplas tentativas)
  if (typeof document !== 'undefined') {
    cookies.forEach((cookieName) => {
      // 1. Limpar com path=/ e domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0;`;

      // 2. Limpar sem path
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;`;

      // 3. Limpar com path raiz explícito
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;`;

      // 4. Limpar com SameSite
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; max-age=0;`;
    });
  }

  console.log(
    '🧹 Todos os cookies de autenticação foram limpos (deleteCookie + document.cookie)',
  );
}
