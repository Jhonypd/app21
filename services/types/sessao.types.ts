// ========================================
// Tipos de domínio: Sessão
// ========================================

import type {
  VotoSessao,
  HistoriaSessao,
} from './sala.types';

/** Payload para criar sessão */
export interface CriarSessaoPayload {
  salaId: string;
  visitantes?: string[];
  historias?: Array<{ titulo: string; descricao?: string }>;
}

/** Sessão completa (GET /sessoes/:id) */
export interface Sessao {
  id: string;
  sala_id: string;
  historia_id: string | null;
  data_criacao: Date;
  data_encerramento: Date | null;
  votos_revelados: boolean;
  participantes: {
    id: string;
    pessoa_id: string;
    pessoa: {
      id: string;
      nome: string;
      email: string;
      inativo: boolean;
    };
  }[];
  votos: {
    id: string;
    pessoa_id: string;
    valor: number;
    pessoa: {
      id: string;
      nome: string;
      inativo: boolean;
    };
  }[];
}

/** Payload para atualizar flag participa_votacao */
export interface AtualizarParticipaVotacaoPayload {
  sessaoId: string;
  participaVotacao: boolean;
}

/** Payload para obter votos por história */
export interface ObterVotosPorHistoriaPayload {
  sessaoId: string;
  historiaId: string;
}

/** Response de votos por história */
export interface VotosPorHistoriaResponse {
  votos: VotoSessao[];
}

/** Response de listar histórias por sessão */
export interface ListarHistoriasSessaoResponse {
  historias: HistoriaSessao[];
}
