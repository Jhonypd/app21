export interface ApiResponse<T = unknown> {
  Resultado: T | null;
  Sucesso: boolean;
  Mensagem: string;
  Detalhe?: string;
  CodigoRetorno: number;
  TipoRetorno: number;
}
