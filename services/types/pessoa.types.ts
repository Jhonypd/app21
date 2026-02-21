// ========================================
// Tipos de domínio: Pessoa
// ========================================

/** Dados completos da conta (perfil do próprio usuário) */
export interface DadosContaPessoa {
  id: string;
  nome: string;
  email: string;
  inativo: boolean;
  email_confirmado: boolean;
}

/** Resumo de pessoa (buscas, listagens) */
export interface DadosPessoaResumo {
  id: string;
  nome: string;
  email: string;
  inativo: boolean;
}

/** Referência mínima de pessoa (usado dentro de votos, participantes, etc.) */
export interface PessoaRef {
  id: string;
  nome: string;
  inativo: boolean;
}

/** Pessoa básica sem inativo (modal de busca, visitantes) */
export interface PessoaBasica {
  id: string;
  nome: string;
  email: string;
}

// ---- Payloads ----

export interface AlterarPessoaPayload {
  id: string;
  nome?: string;
  email?: string;
  senha?: string;
}
