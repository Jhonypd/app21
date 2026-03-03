// ========================================
// Tipos de domínio: História
// ========================================

/** História de uma sala (CRUD completo) */
export interface HistoriaSala {
  id: string;
  sala_id: string;
  titulo: string;
  descricao: string | null;
  criado_por: string;
  data_criacao: Date;
}

// ---- Payloads ----

export interface CriarHistoriaPayload {
  salaId: string;
  titulo: string;
  descricao?: string;
}

export interface CriarVariasHistoriasPayload {
  salaId: string;
  historias: Array<{
    titulo: string;
    descricao?: string;
  }>;
}

export interface AtualizarHistoriaPayload {
  id: string;
  titulo?: string;
  descricao?: string;
}

export interface AdicionarHistoriaDuranteSessaoPayload {
  sessaoId: string;
  // Formato legado (retrocompatível)
  titulo?: string;
  descricao?: string;
  // Formato em lote
  adicionar?: Array<{
    titulo: string;
    descricao?: string;
  }>;
  remover?: string[];
}
