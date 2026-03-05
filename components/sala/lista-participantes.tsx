import React, { useMemo, useState } from 'react';
import { CardParticipante } from './card-participante';
import CardVotacaoSimples from './card-participante-simples';
import { ModalBase } from './modal-base';
import { ModalAdicionarParticipanteOuVisitante } from './modal-adicionar-visitante';
import { Button } from '../ui/button';
import { UserPlus, UsersIcon } from 'lucide-react';
import { ButtonCustom } from '../button-custom';

interface Voto {
   id: string;
   pessoa_id: string;
   valor: number;
   pessoa: {
      nome: string;
      inativo: boolean;
   };
}

interface ParticipanteItem {
   id: string;
   nome: string;
   inativo: boolean;
   role: number;
   online: boolean;
}

interface ListaParticipantesProps {
   participantes: ParticipanteItem[];
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onBuscarParticipantes: () => void | Promise<unknown>;
   uiDisabled: boolean;
   votos: Voto[];
   totalOnline: number;
   totalParticipantes: number;
   meuRole: number;
   votosRevelados: boolean;
   handleAnularVoto: (votoId: string, nomeParticipante: string) => void;
   pessoasEncontradas: Array<{ id: string; nome: string; email: string }>;
   onBuscarPessoas: (termo: string) => void;
   onAdicionarParticipante: (pessoaId: string) => Promise<boolean>;
}

const ListaParticipantes: React.FC<ListaParticipantesProps> = ({
   participantes,
   open,
   onOpenChange,
   onBuscarParticipantes,
   uiDisabled,
   votos,
   totalOnline,
   totalParticipantes,
   meuRole,
   votosRevelados,
   handleAnularVoto,
   pessoasEncontradas,
   onBuscarPessoas,
   onAdicionarParticipante,
}) => {
   const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
   const [termoBusca, setTermoBusca] = useState('');
   const participantesOnline = useMemo(
      () => participantes.filter((p) => p.online),
      [participantes],
   );

   const votosPorPessoaId = useMemo(
      () => new Map(votos.map((voto) => [voto.pessoa_id, voto])),
      [votos],
   );

   const handleBuscarPessoas = (termo: string) => {
      setTermoBusca(termo);
      onBuscarPessoas(termo);
   };

   const handleAdicionarParticipante = async (pessoaId: string) => {
      const sucesso = await onAdicionarParticipante(pessoaId);
      if (sucesso) {
         setModalAdicionarAberto(false);
         setTermoBusca('');
      }
   };

   return (
      <>
         <Button
            variant="outline"
            onClick={onBuscarParticipantes}
            disabled={uiDisabled}
            className="relative"
         >
            <UsersIcon />
            <p>Participantes</p>
            <span className="bg-accent absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px]">
               {totalOnline}
            </span>
         </Button>
         <ModalBase
            onOpenChange={onOpenChange}
            open={open}
            titulo={
               <div className="flex w-full items-center gap-2 truncate text-left text-nowrap text-ellipsis">
                  <UsersIcon className="h-5 w-5" /> Participantes da Sala
               </div>
            }
            botoesAcoes={
               <div className="flex justify-end gap-2">
                  <ButtonCustom
                     variant={'outline'}
                     className="uppercase"
                     onClick={() => onOpenChange(false)}
                  >
                     Fechar
                  </ButtonCustom>
               </div>
            }
         >
            <div className="flex h-full w-full flex-col px-3">
               <div className="flex justify-between gap-4 border-b border-b-slate-400/10 py-2">
                  <h2 className="flex items-center gap-2 md:text-sm">
                     Online {participantesOnline.length} / {totalParticipantes}
                  </h2>
                  {meuRole <= 1 && (
                     <ButtonCustom
                        variant={'outline'}
                        className="uppercase"
                        icon={<UserPlus className="h-4 w-4" />}
                        onClick={() => setModalAdicionarAberto(true)}
                     >
                        Adicionar
                     </ButtonCustom>
                  )}
               </div>
               <div className="mx-auto grid max-h-96 min-h-56 w-full grid-cols-2 place-items-center gap-4 overflow-y-auto py-3 md:grid-cols-3 lg:grid-cols-4">
                  {participantesOnline.map((participante) => {
                     const voto = votosPorPessoaId.get(participante.id);

                     // Roles 2 e 3: Card simples com flip
                     if (meuRole >= 2) {
                        return (
                           <CardVotacaoSimples
                              key={participante.id}
                              participante={participante}
                              voto={voto ? voto.valor.toString() : null}
                              votou={!!voto}
                              votosRevelados={votosRevelados}
                           />
                        );
                     }

                     // Roles 0 e 1: Card completo (Dono/Admin)
                     return (
                        <div
                           className="space-y-2"
                           key={participante.id}
                        >
                           <CardParticipante
                              layout="vertical"
                              participante={{
                                 id: participante.id,
                                 nome: participante.nome,
                                 role: participante.role,
                              }}
                              jaExistia={true}
                              meuRole={meuRole}
                              mostrarAcoes={false}
                              voto={voto ? voto.valor.toString() : null}
                              votosRevelados={votosRevelados}
                              votoId={voto?.id}
                              onAnularVoto={handleAnularVoto}
                           />
                        </div>
                     );
                  })}
               </div>
            </div>
         </ModalBase>

         {/* Modal para adicionar participante permanente */}
         <ModalAdicionarParticipanteOuVisitante
            titulo="Adicionar participante"
            open={modalAdicionarAberto}
            onOpenChange={setModalAdicionarAberto}
            termoBusca={termoBusca}
            onBuscar={handleBuscarPessoas}
            pessoas={pessoasEncontradas}
            loading={uiDisabled}
            onAdicionar={handleAdicionarParticipante}
         />
      </>
   );
};

export default ListaParticipantes;
