// ========================================
// Tipos de domínio: Sala
// ========================================

import type { PessoaRef } from './pessoa.types';

/** Proprietário da sala */
export interface Proprietario {
   id: string;
   inativo: boolean;
   nome: string;
}

/** Sessão ativa dentro de uma sala (dados da API) */
export interface SessaoAtiva {
   id: string;
   criada_em: Date;
   ativa: boolean;
   iniciada_por: string;
}

/** Resumo de participantes (calculado no backend para sessão ativa) */
export interface ResumoParticipantes {
   totalParticipantes: number;
   totalOnline: number;
   totalDevemVotar: number;
}

/** Item da listagem de salas (GET /salas/listarSalas) */
export interface Salas {
   id: string;
   titulo: string;
   codigo: string;
   inativo: boolean;
   salaPrivada: boolean;
   data_criacao: Date;
   proprietario: PessoaRef;
   membros: number;
   meuRole?: number | null; // 0=Dono, 1=Admin, 2=Membro, null=não participante
   temSessaoAtiva: boolean;
   status: 'online' | 'offline';
   data_ultima_sessao: Date | null;
}

/** Sala completa retornada por obterPorCodigo / obterPorId / sessao-ativa */
export interface SalaCompleta {
   id: string;
   codigo: string;
   titulo: string;
   senha: string | null;
   inativo: boolean;
   data_criacao: Date;
   data_alteracao: Date | null;
   criado_por: string;
   historia_atual_id: string | null;
   votos_revelados: boolean;
   meuRole?: number | null;
   proprietario: Proprietario;
   resumoParticipantes?: ResumoParticipantes;
   participantes?: ParticipanteBasico[];
   sessaoAtiva?: SessaoAtiva;
}

/** Dados da sala para edição (GET /salas/:id/editar) */
export interface SalaParaEdicao {
   id: string;
   titulo: string;
   salaPrivada: boolean;
   participantes: Array<{
      id: string;
      nome: string;
      inativo: boolean;
      role: number;
   }>;
}

// ---- Sub-tipos usados na SalaCompleta ----

/** História dentro de uma sessão (com status de votação) */
export interface HistoriaSessao {
   id: string;
   titulo: string;
   descricao?: string;
   jaFoiVotada: boolean;
   historiaAtual: boolean;
   ordem: number;
   voto: number[] | [];
}

/**
 * Voto dentro da sessão ativa
 * {
 *  id: string;
 *  pessoa_id: string;
 *  valor: number;
 *  pessoa: {
 *    nome: string;
 *    inativo: boolean;
 *  }
 * }
 * */
export interface VotoSessao {
   id: string;
   pessoa_id: string;
   valor: number;
   pessoa: {
      nome: string;
      inativo: boolean;
   };
}

/** Participante básico (listagens sem detalhes de sessão) */
export interface ParticipanteBasico {
   id: string;
   nome: string;
   inativo: boolean;
   role: number; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
}

/** Participante com status online (retornado por ListarParticipantesSala) */
export interface ParticipanteOnline extends ParticipanteBasico {
   online: boolean;
}

// ---- Payloads ----

export interface LoginSalaPayload {
   codigo: string;
   senha?: string;
}

export interface CriarSalaPayload {
   titulo: string;
   senha?: string;
   salaPrivada: boolean;
   participantesIds?: string[];
}

export interface AlterarSalaPayload {
   id: string;
   titulo?: string;
   senha?: string | null;
   salaPrivada?: boolean;
   participantesAdicionarIds?: string[];
   participantesRemoverIds?: string[];
}

export interface DeletarSalaPayload {
   ids: string[];
}

export interface ListarSalasQuery {
   pagina: number;
   itensPagina: number;
}

// ---- Responses ----

export interface ResponseLoginSala {
   tokenSala: string;
   dataExpiracao: Date;
   role: number;
   sessaoId?: string;
}

export interface ResponseCriarSala {
   id: string;
}

/** Wrapper da API: { sala: SalaCompleta } */
export interface SalaPorCodigo {
   sala: SalaCompleta;
}
