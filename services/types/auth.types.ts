// ========================================
// Tipos de domínio: Autenticação
// ========================================

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CriarContaPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface NovoCodigoPayload {
  email: string;
}

export interface ConfirmacaoContaEmailPayload {
  codigo: string;
  confirmarConta: boolean;
}

export interface EsqueciMinhaSenhaPayload {
  email: string;
}

export interface RedefinirSenhaPayload {
  codigo: string;
  novaSenha: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

// ---- Responses ----

export interface ResponseLogin {
  tokenAcesso: { token: string; dataExpiracao: Date };
  refreshToken: {
    token: string;
    dataExpiracao: Date;
  };
}

export interface ResponseCriarConta {
  id: string;
}

export interface ResponseConfirmacaoCodigo {
  id: string;
  contaConfirmada: boolean;
}
