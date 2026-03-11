import { useState } from 'react';
import DialogConfirmacao from '../dialog-confirmacao';
import { ModalAdicionarParticipanteOuVisitante } from './modal-adicionar-participante-visitante';
import { DadosPessoaResumo, SalaParaEdicao } from '@/services/types';
import { MdOutlinePersonAddAlt } from 'react-icons/md';
import { CardParticipante } from './card-participante';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';

type ParticipanteLocal = SalaParaEdicao['participantes'][0];

// Componente interno para Aba de Participantes
interface AbaParticipantesProps {
   participantes: ParticipanteLocal[];
   participantesOriginais: ParticipanteLocal[]; // Para verificar se já existia no banco
   onAlterarParticipantes: (participantes: ParticipanteLocal[]) => void;
   meuRole?: number | null;
}

export const AbaParticipantes = ({
   participantes,
   participantesOriginais,
   onAlterarParticipantes,
   meuRole,
}: AbaParticipantesProps) => {
   const [participanteRemover, setParticipanteRemover] = useState<{
      id: string;
      nome: string;
   } | null>(null);
   const [dialogAdicionarAberto, setDialogAdicionarAberto] = useState(false);
   const [termoBusca, setTermoBusca] = useState('');
   const [pessoasEncontradas, setPessoasEncontradas] = useState<
      DadosPessoaResumo[]
   >([]);
   const [buscarPessoas, { isLoading: buscandoPessoas }] =
      useLazyPesquisarPorNomeOuEmailQuery();

   const podeAdicionar = meuRole === 0 || meuRole === 1;

   const resetBuscaAdicionar = () => {
      setTermoBusca('');
      setPessoasEncontradas([]);
   };

   const handleRemoverParticipante = () => {
      if (!participanteRemover) return;

      const novosParticipantes = participantes.filter(
         (p) => p.id !== participanteRemover.id,
      );
      onAlterarParticipantes(novosParticipantes);
      setParticipanteRemover(null);
   };

   const handleAlterarRole = (pessoa_id: string, novoRole: 1 | 2) => {
      const novosParticipantes = participantes.map((p) =>
         p.id === pessoa_id ? { ...p, role: novoRole } : p,
      );
      onAlterarParticipantes(novosParticipantes);
   };

   const handleAbrirDialogAdicionar = () => {
      resetBuscaAdicionar();
      setDialogAdicionarAberto(true);
   };

   const handleFecharDialogAdicionar = () => {
      resetBuscaAdicionar();
      setDialogAdicionarAberto(false);
   };

   const handleBuscarPessoas = async (termo: string) => {
      setTermoBusca(termo);

      if (termo.trim().length < 2) {
         setPessoasEncontradas([]);
         return;
      }

      try {
         const resultado = await buscarPessoas({ termo }).unwrap();
         const pessoas = resultado.Resultado?.pessoas || [];
         const idsExistentes = new Set(participantes.map((p) => p.id));

         setPessoasEncontradas(
            pessoas.filter((pessoa) => !idsExistentes.has(pessoa.id)),
         );
      } catch {
         setPessoasEncontradas([]);
      }
   };

   const handleAdicionarParticipante = async (pessoaId: string) => {
      const pessoa = pessoasEncontradas.find((item) => item.id === pessoaId);
      if (!pessoa) return;

      const novoParticipante: ParticipanteLocal = {
         id: pessoa.id,
         nome: pessoa.nome,
         role: 2,
         inativo: false,
      };

      onAlterarParticipantes([...participantes, novoParticipante]);
      handleFecharDialogAdicionar();
   };

   return (
      <>
         <div className="h-full space-y-4">
            {/* Header com contador */}
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-sm font-medium">
                     Participantes Permanentes
                  </h3>
                  <p className="text-xs text-gray-400">
                     {participantes.length} participante
                     {participantes.length !== 1 ? 's' : ''}
                  </p>
               </div>

               {podeAdicionar && (
                  <button
                     onClick={handleAbrirDialogAdicionar}
                     className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm text-white transition-all hover:from-purple-700 hover:to-pink-700 active:scale-95"
                  >
                     <MdOutlinePersonAddAlt className="h-4 w-4" />
                     Adicionar
                  </button>
               )}
            </div>

            {/* Lista de Participantes */}
            <div className="h-48 max-h-96 space-y-2 overflow-y-auto py-3 sm:min-h-52">
               {participantes.map((participante) => {
                  const jaExistia = participantesOriginais.some(
                     (p) => p.id === participante.id,
                  );

                  return (
                     <CardParticipante
                        key={participante.id}
                        participante={participante}
                        jaExistia={jaExistia}
                        meuRole={meuRole}
                        onAlterarRole={handleAlterarRole}
                        onRemover={(participante) =>
                           setParticipanteRemover(participante)
                        }
                     />
                  );
               })}
            </div>
         </div>

         {/* Modal para Adicionar Participante */}
         <ModalAdicionarParticipanteOuVisitante
            titulo="Adicionar participante"
            open={dialogAdicionarAberto}
            onOpenChange={(open) => {
               if (!open) {
                  handleFecharDialogAdicionar();
               }
            }}
            termoBusca={termoBusca}
            onBuscar={handleBuscarPessoas}
            pessoas={pessoasEncontradas}
            loading={buscandoPessoas}
            onAdicionar={handleAdicionarParticipante}
         />

         <DialogConfirmacao
            titulo="Remover Participante"
            btnConfirmar="Remover"
            btnCancelar="Cancelar"
            textoPadrao={`Tem certeza que deseja remover ${participanteRemover?.nome} da sala? Esta ação não pode ser desfeita.`}
            dialogAberto={!!participanteRemover}
            setDialogAberto={(open) => {
               if (!open) {
                  setParticipanteRemover(null);
               }
            }}
            tipo="destrutivo"
            handleSubmit={async () => {
               handleRemoverParticipante();
            }}
            dialogLoading={false}
         />
      </>
   );
};
