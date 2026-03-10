import React, { useState } from 'react';
import {
   MdGroups,
   MdOutlineBroadcastOnPersonal,
   MdLockPerson,
   MdOutlineChevronRight,
   MdOutlinePlayArrow,
   MdDelete,
   MdEditSquare,
   MdShare,
} from 'react-icons/md';
import { GiUnplugged } from 'react-icons/gi';

import { copiarParaAreaTransferencia } from '@/utils/copiarTexto';
import type { Salas, SalaParaEdicao } from '@/services/types';
import {
   useExcluirSalaMutation,
   useLazyObterDadosFormAlterarQuery,
} from '@/services/api/salas-api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';
import { ButtonCustom } from './button-custom';
import { ModalEntrarSala } from './sala/modal-entrar-sala';
import { DialogEditarSala } from './sala/dialog-editar-sala';
import { Card, CardContent } from './ui/card';
import DialogConfirmacao from './dialog-confirmacao';

interface CardSalaProps {
   sala: Salas;
   index: number;
   entrarSessaoAtiva?: (codigo: string, senha?: string) => Promise<boolean>;
   abrirWizard?: (sala: Salas) => void;
   editarSala?: (
      salaId: string,
      dados: {
         titulo: string;
         senha?: string;
         participantesAdicionarIds?: string[];
         participantesRemoverIds?: string[];
      },
   ) => Promise<void>;
   podeIniciarSessao?: boolean; // Se o usuário pode iniciar sessão (dono ou admin)
}

export function CardSala({
   sala,
   index,
   entrarSessaoAtiva,
   abrirWizard,
   editarSala,
   podeIniciarSessao = false,
}: CardSalaProps) {
   const urlCompartilhamento = `${window.location.origin}/entrar/${sala.codigo}`;

   const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
   const [dialogExcluirAberto, setDialogExcluirAberto] = useState(false);
   const [modalEntrarSalaAberto, setModalEntrarSalaAberto] = useState(false);
   const [dadosSala, setDadosSala] = useState<SalaParaEdicao | null>(null);
   const [obterSala, { isLoading: carregandoDados }] =
      useLazyObterDadosFormAlterarQuery();
   const [excluirSala, { isLoading: excluindoSala }] = useExcluirSalaMutation();

   // const copiarCodigo = (codigo: string) => {
   //   copiarParaAreaTransferencia(codigo);
   // };

   const handleAbrirDialogEditar = async () => {
      try {
         const response = await obterSala(sala.id).unwrap();
         setDadosSala(response.Resultado?.sala || null);
         setDialogEditarAberto(true);
      } catch (error) {
         const apiError = getApiErrorMessage(error);
         toastError({
            description: `${apiError.Mensagem}`,
         });
      }
   };

   const handleAbrirDialogExcluir = async (id: string) => {
      try {
         if (!id) {
            throw new Error('Id da sala é necessário para exclusão.');
         }

         const sala = await excluirSala({ ids: [id] }).unwrap();

         if (!sala.Sucesso) {
            throw new Error(`${sala.Mensagem}`);
         }

         toastSuccess({ description: `${sala.Mensagem}` });
      } catch (error) {
         const errorMessage = getApiErrorMessage(error);
         toastError({
            description: `${errorMessage.Mensagem}`,
         });
      } finally {
         setDialogExcluirAberto(false);
      }

      // Lógica para abrir dialog de exclusão
   };

   const handleFecharDialog = () => {
      setDialogEditarAberto(false);
      setDadosSala(null);
   };

   const handlerAbrirModalEntrarSala = () => {
      setModalEntrarSalaAberto(true);
   };

   const entrarNaSala = async () => {
      if (entrarSessaoAtiva) {
         await entrarSessaoAtiva(sala.codigo);
      }
   };

   const entrarViaModal = async (codigo: string, senha?: string) => {
      if (!entrarSessaoAtiva) return false;
      return await entrarSessaoAtiva(codigo, senha);
   };

   const handleEntrarClick = async () => {
      const eAdminOuDono = sala.meuRole === 0 || sala.meuRole === 1;
      const precisaSenhaComModal = sala.salaPrivada && !eAdminOuDono;

      if (precisaSenhaComModal) {
         handlerAbrirModalEntrarSala();
         return;
      }

      await entrarNaSala();
   };

   // Gerar avatar com iniciais do título
   const gerarAvatar = (titulo: string) => {
      const palavras = titulo.trim().split(' ');
      if (palavras.length >= 2) {
         return palavras[0][0] + palavras[1][0];
      }
      return titulo.substring(0, 2);
   };

   // Calcular tempo decorrido
   const calcularTempoDecorrido = (data: string) => {
      const agora = new Date();
      const dataAlteracao = new Date(data);
      const diferencaMs = agora.getTime() - dataAlteracao.getTime();

      const minutos = Math.floor(diferencaMs / 60000);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);

      if (dias > 0) return `${dias}d`;
      if (horas > 0) return `${horas}h`;
      if (minutos > 0) return `${minutos}m`;
      return 'agora';
   };

   // Gerar cor aleatória mas consistente baseada no ID
   const gerarCorAvatar = (id: string) => {
      const cores = [
         'from-purple-500 to-pink-500',
         'from-blue-500 to-cyan-500',
         'from-green-500 to-emerald-500',
         'from-orange-500 to-red-500',
         'from-indigo-500 to-purple-500',
         'from-pink-500 to-rose-500',
      ];
      // Usar primeiro caractere do ID para escolher cor
      const index = id.charCodeAt(0) % cores.length;
      return cores[index];
   };

   // const eProprietario = sala.meuRole === 0;

   const tempoDecorrido =
      sala.data_ultima_sessao &&
      calcularTempoDecorrido(sala.data_ultima_sessao.toString());
   // : calcularTempoDecorrido(sala.data_criacao.toString());
   const avatar = gerarAvatar(sala.titulo);
   const corAvatar = gerarCorAvatar(sala.id);

   return (
      <>
         {carregandoDados ||
            (excluindoSala && (
               <Loading
                  active
                  type="transaction"
               />
            ))}
         <Card
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all active:scale-98"
            style={{ animationDelay: `${index * 100}ms` }}
         >
            <CardContent className="flex h-full items-start justify-between gap-4 p-3">
               <div className="flex w-full flex-col items-start justify-start gap-3">
                  <div className="flex items-center gap-4">
                     <div className="relative flex-shrink-0">
                        <div
                           className={`h-14 w-14 bg-gradient-to-br ${corAvatar} flex items-center justify-center rounded-2xl shadow-lg shadow-purple-500/50`}
                        >
                           <span className="text-lg uppercase">{avatar}</span>
                        </div>
                        {sala.salaPrivada && (
                           <MdLockPerson className="h4 absolute bottom-1 left-1 w-4 text-slate-300" />
                        )}
                        {sala.status === 'online' && (
                           <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-slate-950 bg-green-500 shadow-lg shadow-green-500/50"></div>
                        )}
                     </div>

                     <div className="min-w-0 flex-1 items-start justify-start">
                        <h4 className="truncate text-base">{sala.titulo}</h4>
                        <div className="flex items-center justify-start gap-2 text-xs">
                           <span className="flex items-center justify-start gap-1 text-gray-400">
                              <MdGroups className="h-4 w-4" />
                              {sala.membros > 0
                                 ? `${sala.membros} ${sala.membros === 1 ? 'membro' : 'membros'}`
                                 : 'Sem membros'}
                           </span>
                           <span className="text-gray-600">•</span>
                           <span className="text-center text-gray-400">
                              {sala.status === 'online' ? (
                                 <MdOutlineBroadcastOnPersonal
                                    className="text-green-500"
                                    size={16}
                                 />
                              ) : (
                                 <GiUnplugged
                                    className="text-gray-400"
                                    size={16}
                                 />
                              )}
                           </span>
                           <span className="text-gray-400">
                              {tempoDecorrido}
                           </span>
                        </div>
                        <p className="mt-1 truncate text-start text-xs text-gray-500">
                           por {sala.proprietario.nome}
                        </p>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex w-full gap-2">
                     <ButtonCustom
                        onClick={handleEntrarClick}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm uppercase transition-all hover:bg-purple-700 active:bg-purple-800"
                        disabled={sala.inativo || sala.status !== 'online'}
                        icon={<MdOutlineChevronRight className="h-6 w-6" />}
                        iconPosition="right"
                     >
                        Entrar
                     </ButtonCustom>

                     {podeIniciarSessao && abrirWizard && (
                        <ButtonCustom
                           disabled={sala.inativo || sala.status === 'online'}
                           onClick={() => abrirWizard(sala)}
                           className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 uppercase transition-all hover:bg-green-700 active:scale-95 active:bg-green-800"
                           icon={<MdOutlinePlayArrow className="h-6 w-6" />}
                        >
                           <span className="text-xs">Iniciar</span>
                        </ButtonCustom>
                     )}
                  </div>
               </div>

               <div className="flex h-full w-fit flex-1 flex-col justify-between gap-2">
                  {/* Botão Editar (dono ou admin) */}
                  {(sala.meuRole === 0 || sala.meuRole === 1) && editarSala && (
                     <ButtonCustom
                        size={'sm'}
                        onClick={handleAbrirDialogEditar}
                        disabled={sala.inativo || carregandoDados}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                           carregandoDados ? 'Carregando...' : 'Editar sala'
                        }
                        icon={<MdEditSquare className="h-6 w-6" />}
                     ></ButtonCustom>
                  )}
                  {/* Botão excluir (dono) */}
                  {sala.meuRole === 0 && (
                     <ButtonCustom
                        size={'sm'}
                        variant={'destructive'}
                        onClick={() => setDialogExcluirAberto(true)}
                        disabled={sala.inativo || carregandoDados}
                        className="flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all hover:bg-red-500/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                           carregandoDados ? 'Carregando...' : 'Excluir sala'
                        }
                        icon={<MdDelete className="h-6 w-6" />}
                     ></ButtonCustom>
                  )}
                  <ButtonCustom
                     size={'sm'}
                     onClick={() => {
                        const shareText = `Entre na minha sala ${sala.codigo} com o link ${urlCompartilhamento}. `;
                        copiarParaAreaTransferencia(shareText);
                     }}
                     className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10 active:scale-95"
                  >
                     <MdShare className="h-4 w-4" />
                  </ButtonCustom>
               </div>
            </CardContent>

            {/* Modal de entrar na sala com senha */}

            <ModalEntrarSala
               open={modalEntrarSalaAberto}
               onOpenChange={setModalEntrarSalaAberto}
               onEntrar={entrarViaModal}
               codigoInicial={sala.codigo}
               bloquearCodigo={
                  sala.salaPrivada && sala.meuRole !== 0 && sala.meuRole !== 1
               }
            />

            {/* Dialog Editar - Renderizado fora do dropdown */}
            <DialogEditarSala
               aberto={dialogEditarAberto}
               aoFechar={handleFecharDialog}
               dadosSala={dadosSala}
               meuRole={sala.meuRole}
               aoSalvar={async (dados) => {
                  if (editarSala) {
                     await editarSala(sala.id, dados);
                  }
               }}
            />

            <DialogConfirmacao
               dialogLoading={false}
               dialogAberto={dialogExcluirAberto}
               setDialogAberto={() =>
                  setDialogExcluirAberto(
                     (dialogExcluirAberto) => !dialogExcluirAberto,
                  )
               }
               titulo="Confirmar exclusão?"
               textoPadrao="Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
               handleSubmit={() => handleAbrirDialogExcluir(sala.id)}
               tipo="destrutivo"
            />
         </Card>
      </>
   );
}
