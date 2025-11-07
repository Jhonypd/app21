/**
 * Utilitários para normalizar mensagens/respostas da API.
 * A sua API padrão devolve um ApiResponse<T> com os campos em português
 * (Resultado, Sucesso, Mensagem). Porém em alguns fluxos o erro pode
 * vir com `message` (Error) ou em estruturas aninhadas. Este helper
 * tenta extrair a melhor mensagem disponível.
 */

export function obterMensagemApi(
  input: unknown,
): string | undefined {
  if (!input) return undefined;

  const anyInput = input as Record<string, unknown>;

  // ApiResponse direto: { Mensagem }
  if (
    typeof anyInput.Mensagem === 'string' &&
    anyInput.Mensagem
  ) {
    return anyInput.Mensagem;
  }

  // ApiResponse padrão com Resultado genérico
  if (anyInput.Resultado) {
    const r = anyInput.Resultado;
    if (typeof r === 'string') return r;
    const rObj = r as Record<string, unknown>;
    if (
      typeof rObj['Mensagem'] === 'string' &&
      rObj['Mensagem']
    )
      return String(rObj['Mensagem']);
    if (
      typeof rObj['mensagem'] === 'string' &&
      rObj['mensagem']
    )
      return String(rObj['mensagem']);
    // Alguns endpoints usam ResultadoOperacao.mensagem
    if (
      typeof rObj['ResultadoOperacao'] === 'object' &&
      rObj['ResultadoOperacao'] !== null
    ) {
      const ro = rObj['ResultadoOperacao'] as Record<
        string,
        unknown
      >;
      if (
        typeof ro['mensagem'] === 'string' &&
        ro['mensagem']
      )
        return String(ro['mensagem']);
      if (
        typeof ro['Mensagem'] === 'string' &&
        ro['Mensagem']
      )
        return String(ro['Mensagem']);
    }
    // Se Resultado já for o objeto de perfil/erro, tente campos comuns
    if (
      typeof rObj['message'] === 'string' &&
      rObj['message']
    )
      return String(rObj['message']);
  }

  // Caso comum: objeto de erro JS/Error
  if (
    typeof anyInput.message === 'string' &&
    anyInput.message
  ) {
    return anyInput.message;
  }

  // Axios-like: error.response.data
  if (
    typeof anyInput['response'] === 'object' &&
    anyInput['response'] !== null &&
    'data' in
      (anyInput['response'] as Record<string, unknown>)
  ) {
    return obterMensagemApi(
      (anyInput['response'] as Record<string, unknown>)[
        'data'
      ],
    );
  }

  return undefined;
}

export default obterMensagemApi;
