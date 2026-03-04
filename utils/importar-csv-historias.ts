interface HistoriaImportada {
   id: string;
   titulo: string;
   descricao: string;
}

interface ResultadoImportacao {
   historias: HistoriaImportada[];
   avisos: string[];
}

/**
 * Importa histórias de um arquivo CSV
 * Formato esperado: titulo,descricao (com ou sem cabeçalho)
 *
 * @param file - Arquivo CSV a ser importado
 * @returns Promise com as histórias importadas e avisos
 */
export async function importarHistoriasCSV(
   file: File,
): Promise<ResultadoImportacao> {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
         reject(new Error('Erro ao ler o arquivo'));
      };

      reader.onload = (event) => {
         try {
            const text = event.target?.result as string;
            const linhas = text.split('\n').filter((l) => l.trim());

            if (linhas.length === 0) {
               reject(new Error('Arquivo CSV vazio'));
               return;
            }

            // Pular cabeçalho se existir (detecta se primeira linha contém "titulo" ou "título")
            const primeiraLinha = linhas[0].toLowerCase();
            const temCabecalho =
               primeiraLinha.includes('titulo') ||
               primeiraLinha.includes('título') ||
               primeiraLinha.includes('descricao') ||
               primeiraLinha.includes('descrição');

            const dados = temCabecalho ? linhas.slice(1) : linhas;

            const avisos: string[] = [];
            const historias: HistoriaImportada[] = [];

            dados.forEach((linha, index) => {
               const colunas = linha.split(',').map((s) => s.trim());

               // Valida se há mais de 2 colunas
               if (colunas.length > 2) {
                  avisos.push(
                     `Linha ${index + 1}: Formato incorreto - mais de 2 colunas detectadas. Apenas as 2 primeiras serão consideradas.`,
                  );
               }

               const [titulo, descricao] = colunas;

               historias.push({
                  id: `imported-${Date.now()}-${index}`,
                  titulo: titulo || `História ${index + 1}`,
                  descricao: descricao || '',
               });
            });

            // Adiciona aviso geral se houver múltiplas linhas com problema
            const linhasComProblema = avisos.length;
            if (linhasComProblema > 0) {
               const avisoGeral =
                  linhasComProblema === 1
                     ? '1 linha com formato incorreto foi ajustada.'
                     : `${linhasComProblema} linhas com formato incorreto foram ajustadas.`;

               avisos.unshift(avisoGeral);
            }

            resolve({ historias, avisos });
         } catch {
            reject(new Error('Erro ao processar o arquivo CSV'));
         }
      };

      reader.readAsText(file);
   });
}

/**
 * Valida se um arquivo é um CSV válido
 */
export function validarArquivoCSV(file: File): {
   valido: boolean;
   erro?: string;
} {
   if (!file) {
      return { valido: false, erro: 'Nenhum arquivo selecionado' };
   }

   if (!file.name.endsWith('.csv')) {
      return { valido: false, erro: 'Arquivo deve ter extensão .csv' };
   }

   if (file.size === 0) {
      return { valido: false, erro: 'Arquivo está vazio' };
   }

   // Limite de 1MB
   if (file.size > 1024 * 1024) {
      return { valido: false, erro: 'Arquivo muito grande (máximo 1MB)' };
   }

   return { valido: true };
}
