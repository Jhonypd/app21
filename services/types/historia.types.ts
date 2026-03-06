// ========================================
// Tipos de domínio: História
// ========================================

export interface AdicionarOuRemoverHistoriaSessaoSalaPayload {
   adicionar?: Array<{
      titulo: string;
      descricao?: string;
      ordem: number;
   }>;
   remover?: string[];
}
