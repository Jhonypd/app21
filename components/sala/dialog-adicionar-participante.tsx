import { useState, useEffect } from 'react';
import { Shield, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  useLazyPesquisarPorNomeOuEmailQuery,
  DadosPessoaResumo,
} from '@/services/api/pessoas.api';

interface DialogAdicionarParticipanteProps {
  aberto: boolean;
  aoFechar: () => void;
  onAdicionar: (
    pessoaId: string,
    nome: string,
    role: 1 | 2,
  ) => void;
  participantesExistentes: {
    id: string;
    nome: string;
    role: number;
  }[]; // Participantes já na sala
  meuRole?: number | null; // 0=Dono, 1=Admin
}

export function DialogAdicionarParticipante({
  aberto,
  aoFechar,
  onAdicionar,
  participantesExistentes,
  meuRole,
}: DialogAdicionarParticipanteProps) {
  const podeAdicionarAdmin = meuRole === 0; // Apenas Dono pode adicionar Admin
  const [pessoaSelecionada, setPessoaSelecionada] =
    useState<string>('');
  const [roleSelecionado, setRoleSelecionado] = useState<
    1 | 2
  >(2);
  const [termoBusca, setTermoBusca] = useState('');
  const [pessoasEncontradas, setPessoasEncontradas] =
    useState<DadosPessoaResumo[]>([]);

  const [buscarPessoas, { isLoading: buscando }] =
    useLazyPesquisarPorNomeOuEmailQuery();

  // Buscar pessoas ao digitar
  useEffect(() => {
    const buscar = async () => {
      if (termoBusca.trim().length < 2) {
        setPessoasEncontradas([]);
        return;
      }

      try {
        const resultado = await buscarPessoas({
          termo: termoBusca,
        }).unwrap();
        const pessoas = resultado.Resultado?.pessoas || [];
        // Filtrar pessoas que já são participantes
        const idsExistentes = participantesExistentes.map(
          (p) => p.id,
        );
        const pessoasFiltradas = pessoas.filter(
          (p: DadosPessoaResumo) =>
            !idsExistentes.includes(p.id),
        );
        setPessoasEncontradas(pessoasFiltradas);
      } catch {
        setPessoasEncontradas([]);
      }
    };

    const timer = setTimeout(buscar, 300);
    return () => clearTimeout(timer);
  }, [termoBusca, buscarPessoas, participantesExistentes]);

  const handleFechar = () => {
    setPessoaSelecionada('');
    setRoleSelecionado(2);
    setTermoBusca('');
    setPessoasEncontradas([]);
    aoFechar();
  };

  const handleAdicionar = () => {
    if (!pessoaSelecionada) return;
    const pessoa = pessoasEncontradas.find(
      (p) => p.id === pessoaSelecionada,
    );
    if (!pessoa) return;
    onAdicionar(
      pessoaSelecionada,
      pessoa.nome,
      roleSelecionado,
    );
    handleFechar();
  };

  return (
    <AlertDialog
      open={aberto}
      onOpenChange={(open) => !open && handleFechar()}
    >
      <AlertDialogContent className="border-white/20 bg-slate-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Adicionar Participante
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Busque e adicione um novo participante à sala
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Busca */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Buscar pessoa
            </label>
            <div className="relative">
              <input
                type="text"
                value={termoBusca}
                onChange={(e) =>
                  setTermoBusca(e.target.value)
                }
                placeholder="Digite o nome ou email..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
              />
              {buscando && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de resultados */}
          {termoBusca.trim().length >= 2 &&
            pessoasEncontradas.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl bg-white/5 p-2">
                {pessoasEncontradas.map((pessoa) => (
                  <button
                    key={pessoa.id}
                    onClick={() =>
                      setPessoaSelecionada(pessoa.id)
                    }
                    className={`w-full rounded-lg p-3 text-left transition-all ${
                      pessoaSelecionada === pessoa.id
                        ? 'border border-purple-500 bg-purple-600/20'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {pessoa.nome}
                    </p>
                    <p className="text-xs text-gray-400">
                      {pessoa.email}
                    </p>
                  </button>
                ))}
              </div>
            )}

          {termoBusca.trim().length >= 2 &&
            pessoasEncontradas.length === 0 &&
            !buscando && (
              <p className="py-4 text-center text-sm text-gray-400">
                Nenhuma pessoa encontrada
              </p>
            )}

          {/* Seletor de Role */}
          {pessoaSelecionada && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">
                Tipo de participante
              </label>
              <Select
                value={roleSelecionado.toString()}
                onValueChange={(value) =>
                  setRoleSelecionado(Number(value) as 1 | 2)
                }
              >
                <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/20 bg-slate-900">
                  <SelectItem
                    value="2"
                    className="text-white hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Membro</span>
                    </div>
                  </SelectItem>
                  {podeAdicionarAdmin && (
                    <SelectItem
                      value="1"
                      className="text-white hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Administrador</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!podeAdicionarAdmin && (
                <p className="text-xs text-gray-500">
                  Apenas o dono pode adicionar
                  administradores
                </p>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAdicionar}
            disabled={!pessoaSelecionada}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            Adicionar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
