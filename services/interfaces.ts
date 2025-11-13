export interface ApiResponse<T = unknown> {
  Resultado: T | null;
  Sucesso: boolean;
  Mensagem: string | null;
  Detalhe: string | null;
  CodigoRetorno: number;
  TipoRetorno: number;
}
