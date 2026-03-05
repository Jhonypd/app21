// ========================================
// Tipos de domínio: Voto
// ========================================

/** Payload para registrar voto */
export interface VotarPayload {
   sessaoId: string;
   valor: number;
   historia_id: string;
   participa_votacao?: boolean;
}

/** Voto completo (GET /sessoes/:id/votos) */
export interface Voto {
   id: string;
   sessao_id: string;
   pessoa_id: string;
   valor: number;
   data_voto: Date;
   pessoa: {
      id: string;
      nome: string;
      email: string;
      inativo: boolean;
   };
}
