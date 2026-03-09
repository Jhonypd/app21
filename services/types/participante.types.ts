// ========================================
// Tipos de domínio: Participante
// ========================================

// ---- Payloads de Participante de Sala (gerenciamento permanente) ----

export interface AlterarRoleParticipantePayload {
   sala_id: string;
   pessoa_id: string;
   role: 1 | 2;
}

export interface ListarParticipantesSalaPayload {
   sala_id: string;
   sessao_id?: string;
   apenasOnline?: boolean;
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

// ---- Payload unificado para Participante ou Visitante (NOVO - usa rota consolidada) ----
export interface AdicionarParticipanteOuVisitantePayload {
   sala_id: string;
   pessoa_id: string;
   role: 0 | 1 | 2 | 3; // 0=Dono, 1=Admin, 2=Membro, 3=Visitante
   sessao_id?: string; // Necessário para role=3 (visitante)
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
