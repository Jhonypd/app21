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

import type { Salas, SalaParaEdicao } from '@/services/types';
import { useLazyObterDadosFormAlterarQuery } from '@/services/api/salas-api';
import { toastError } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import Loading from './loading';
import { ButtonCustom } from './button-custom';
import { ModalEntrarSala } from './sala/modal-entrar-sala';
import { DialogEditarSala } from './sala/dialog-editar-sala';
import { Card, CardContent } from './ui/card';
import DialogConfirmacao from './dialog-confirmacao';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import ModalCompartilhar from './sala/modal-compartilhar';

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
   excluirSala?: (id: string) => Promise<boolean>;
   excluirSalaLoading?: boolean;
   podeIniciarSessao?: boolean; // Se o usuário pode iniciar sessão (dono ou admin)
}

export function CardSala({
   sala,
   index,
   entrarSessaoAtiva,
   abrirWizard,
   editarSala,
   excluirSala,
   podeIniciarSessao = false,
   excluirSalaLoading = false,
}: CardSalaProps) {
   const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
   const urlCompartilhamento = `${baseUrl}/entrar/${sala.codigo}`;

   const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
   const [dialogExcluirAberto, setDialogExcluirAberto] = useState(false);
   const [modalEntrarSalaAberto, setModalEntrarSalaAberto] = useState(false);
   const [modalCompartilharAberto, setModalCompartilharAberto] =
      useState(false);
   const [dadosSala, setDadosSala] = useState<SalaParaEdicao | null>(null);
   const [obterSala, { isLoading: carregandoDados }] =
      useLazyObterDadosFormAlterarQuery();
   // const [excluirSala, { isLoading: excluindoSala }] = useExcluirSalaMutation();

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
         'from-[var(--color-accent)] to-[var(--color-primary)]',
         'from-[var(--color-primary)] to-[var(--color-chart-4)]',
         'from-[var(--color-chart-3)] to-[var(--color-chart-4)]',
         'from-[var(--color-chart-5)] to-[var(--color-accent)]',
         'from-[var(--color-secondary)] to-[var(--color-primary)]',
         'from-[var(--color-chart-1)] to-[var(--color-chart-2)]',
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
            (excluirSalaLoading && (
               <Loading
                  active
                  type="transaction"
               />
            ))}
         <Card
            className="group border-border/40 bg-card/90 text-card-foreground relative overflow-hidden rounded-3xl border shadow-[0_25px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all active:scale-98"
            style={{ animationDelay: `${index * 100}ms` }}
         >
            <CardContent className="flex h-full items-start justify-between gap-4 p-3">
               <div className="flex w-full flex-col items-start justify-start gap-3">
                  <div className="flex items-center gap-4">
                     <div className="relative flex-shrink-0">
                        <div
                           className={`h-14 w-14 bg-gradient-to-br ${corAvatar} flex items-center justify-center rounded-2xl text-white`}
                           style={{
                              boxShadow: '0 20px 45px rgba(124, 58, 237, 0.35)',
                           }}
                        >
                           <span className="text-lg uppercase">{avatar}</span>
                        </div>
                        {sala.salaPrivada && (
                           <MdLockPerson className="h4 text-foreground/70 absolute bottom-1 left-1 w-4" />
                        )}
                        {sala.status === 'online' && (
                           <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-[var(--background)] bg-[var(--color-chart-3)] shadow-[0_0_12px_rgba(22,163,74,0.55)]"></div>
                        )}
                     </div>

                     <div className="min-w-0 flex-1 items-start justify-start">
                        <h4 className="truncate text-base">{sala.titulo}</h4>
                        <div className="text-muted-foreground flex items-center justify-start gap-2 text-xs">
                           <span className="flex items-center justify-start gap-1">
                              <MdGroups className="h-4 w-4" />
                              {sala.membros > 0
                                 ? `${sala.membros} ${sala.membros === 1 ? 'membro' : 'membros'}`
                                 : 'Sem membros'}
                           </span>
                           <span className="text-muted-foreground/60">•</span>
                           <span className="text-center">
                              {sala.status === 'online' ? (
                                 <MdOutlineBroadcastOnPersonal
                                    className="text-[var(--color-chart-3)]"
                                    size={16}
                                 />
                              ) : (
                                 <GiUnplugged
                                    className="text-muted-foreground"
                                    size={16}
                                 />
                              )}
                           </span>
                           <span>{tempoDecorrido}</span>
                        </div>
                        <p className="text-muted-foreground/80 mt-1 truncate text-start text-xs">
                           por {sala.proprietario.nome}
                        </p>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex w-full gap-2">
                     <ButtonCustom
                        onClick={handleEntrarClick}
                        variant="ghost"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm uppercase"
                        disabled={sala.inativo || sala.status !== 'online'}
                     >
                        <span>Entrar</span>
                        <MdOutlineChevronRight className="h-6 w-6" />
                     </ButtonCustom>

                     {podeIniciarSessao && abrirWizard && (
                        <Tooltip>
                           <TooltipTrigger>
                              <ButtonCustom
                                 disabled={
                                    sala.inativo || sala.status === 'online'
                                 }
                                 onClick={() => abrirWizard(sala)}
                                 className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-chart-3)] px-4 py-3 text-white uppercase transition-all hover:brightness-110 active:scale-95"
                              >
                                 <MdOutlinePlayArrow className="h-6 w-6" />
                                 <span className="hidden text-xs sm:block">
                                    Iniciar
                                 </span>
                              </ButtonCustom>
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>Iniciar sessão</p>
                           </TooltipContent>
                        </Tooltip>
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
                        className="bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                           carregandoDados ? 'Carregando...' : 'Editar sala'
                        }
                     >
                        <MdEditSquare className="h-6 w-6" />
                     </ButtonCustom>
                  )}
                  {/* Botão excluir (dono) */}
                  {sala.meuRole === 0 && excluirSala && (
                     <ButtonCustom
                        size={'sm'}
                        variant={'destructive'}
                        onClick={() => setDialogExcluirAberto(true)}
                        disabled={sala.inativo || carregandoDados}
                        className="flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        title={
                           carregandoDados ? 'Carregando...' : 'Excluir sala'
                        }
                     >
                        <MdDelete className="h-6 w-6" />
                     </ButtonCustom>
                  )}
                  <ButtonCustom
                     size={'sm'}
                     onClick={() => setModalCompartilharAberto(true)}
                     className="bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 flex h-9 w-9 items-center justify-center rounded-xl p-2 transition-all active:scale-95"
                     title="Compartilhar sala"
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
               dialogLoading={excluirSalaLoading}
               dialogAberto={dialogExcluirAberto}
               setDialogAberto={setDialogExcluirAberto}
               titulo="Confirmar exclusão?"
               textoPadrao="Tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita."
               handleSubmit={async () => {
                  if (excluirSala) {
                     const sucesso = await excluirSala(sala.id);
                     if (sucesso) {
                        setDialogExcluirAberto(false);
                     }
                  }
               }}
               tipo="destrutivo"
            />

            <ModalCompartilhar
               open={modalCompartilharAberto}
               onOpenChange={setModalCompartilharAberto}
               tituloSala={sala.titulo}
               codigoSala={sala.codigo}
               linkCompartilhamento={urlCompartilhamento}
            />
         </Card>
      </>
   );
}
