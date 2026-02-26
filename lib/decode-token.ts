// /**
//  * Decodifica um JWT sem verificar assinatura (apenas para leitura de claims)
//  * IMPORTANTE: Nunca confie no token decodificado sem validação no backend!
//  */

// interface JwtPayload {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: any;
// }

// export function decodeJwt<T extends JwtPayload>(token: string): T | null {
//   try {
//     // JWT tem formato: header.payload.signature
//     const parts = token.split('.');

//     if (parts.length !== 3) {
//       return null;
//     }

//     // Decodifica a parte do payload (Base64URL)
//     const payload = parts[1];
//     const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//         .join('')
//     );

//     return JSON.parse(jsonPayload) as T;
//   } catch (error) {
//     console.error('Erro ao decodificar token:', error);
//     return null;
//   }
// }

// export interface ClaimsAuthSala {
//   Role: 0 | 1 | 2 | 3; // 0 = Dono, 1 = Admin, 2 = Membro, 3 = Visitante
//   Usuario_Id: string;
//   Nome: string;
//   Sala_Id: string;
//   Sala_Codigo: string; // Código da sala
//   Sala_titulo: string;
//   Dt_Ex: string;
//   Sessao_Sala_Id: string; // ID da sessão
//   iat?: number;
//   exp?: number;
// }
