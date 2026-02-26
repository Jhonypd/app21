// ========================================
// Tipos de domínio: Participante
// ========================================

// ---- Payloads de Participante de Sala (gerenciamento permanente) ----

export interface AdicionarParticipanteSalaPayload {
   sala_id: string;
   pessoa_id: string;
   role: 1 | 2; // 1=Admin, 2=Membro
   sessao_id?: string; // Se fornecido, também cria ParticipanteSessao
}

export interface RemoverParticipanteSalaPayload {
   sala_id: string;
   pessoa_id: string;
}

export interface AlterarRoleParticipantePayload {
   sala_id: string;
   pessoa_id: string;
   role: 1 | 2;
}

export interface ListarParticipantesSalaPayload {
   sala_id: string;
   sessao_id?: string;
}

export interface ListarParticipantesSalaResponse {
   participantes: Array<{
      id: string;
      nome: string;
      inativo: boolean;
      role: number;
      online: boolean;
   }>;
}

// ---- Entidade completa de Participante permanente ----

/** Participante permanente completo (retornado por GET /salas/:id/participantes) */
export interface Participante {
   id: string;
   sala_id: string;
   pessoa_id: string;
   permissao: number;
   data_entrada: Date;
   pessoa: {
      id: string;
      nome: string;
      email: string;
      inativo: boolean;
   };
}

// ---- Payloads de Participante de Sessão (visitantes temporários) ----

export interface AdicionarParticipanteSessaoPayload {
   sessaoId: string;
   pessoaId: string;
}

// ---- Payloads de Visitante ----

export interface AdicionarVisitantePayload {
   sala_id: string;
   pessoa_id: string;
}

export interface RemoverVisitantePayload {
   sala_id: string;
   pessoa_id: string;
}

export interface ListarVisitantesPayload {
   sala_id: string;
   sessao_id: string;
}

export interface Visitante {
   id: string;
   pessoa_id: string;
   autorizado: boolean;
   pessoa?: {
      id: string;
      nome: string;
      email: string;
      inativo: boolean;
   };
}
