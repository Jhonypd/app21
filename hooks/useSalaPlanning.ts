'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import {
   useAdicionarParticipanteOuVisitanteSalaMutation,
   // useAdicionarVisitanteMutation,
   useLazyListarParticipantesSalaQuery,
   useAtualizarParticipaVotacaoMutation,
   useSelecionarHistoriaAtualMutation,
   SalasApi,
} from '@/services/api/salas-api';
import {
   useRevelarVotosMutation,
   useResetarVotosMutation,
} from '@/services/api/sessoes-api';
import {
   useVotarMutation,
   useAnularVotoMutation,
   useLazyObterVotosPorHistoriaSessaoSessaoSalaQuery,
} from '@/services/api/votos-api';
import { useAdicionarOuRemoverHistoriaSessaoSalaMutation } from '@/services/api/historias-api';
import { getApiErrorMessage } from '@/utils/api-error';
import type { VotosPorHistoriaResponse } from '@/services/types';
import { toastError, toastSuccess } from '@/components/custom-toast';
import { useDispatch } from 'react-redux';

type PessoaBusca = { id: string; nome: string; email: string };

interface UseSalaPlanningDataParams {
   salaId: string;
   sessaoId?: string;
}

export function useSalaPlanningData({
   salaId,
   sessaoId,
}: UseSalaPlanningDataParams) {
   const dispatch = useDispatch();

   const [listaVotosCarregados, setListaVotosCarregados] =
      useState<VotosPorHistoriaResponse>({
         media: 0,
         voto_vencedor: 0,
         votos: [],
      });

   const [
      buscarParticipantes,
      { data: participantesData, isFetching: carregandoParticipantes },
   ] = useLazyListarParticipantesSalaQuery();

   const [
      pesquisarPessoas,
      { data: pessoasEncontradasData, isFetching: buscandoPessoas, reset },
   ] = useLazyPesquisarPorNomeOuEmailQuery();

   // const [adicionarVisitante, { isLoading: adicionandoVisitante }] =
   //    useAdicionarVisitanteMutation();
   const [
      adicionarParticipanteOuVisitante,
      { isLoading: adicionandoParticipanteOuVisitante },
   ] = useAdicionarParticipanteOuVisitanteSalaMutation();
   const [
      atualizarParticipaVotacao,
      { isLoading: atualizandoParticipaVotacao },
   ] = useAtualizarParticipaVotacaoMutation();

   const [votar] = useVotarMutation();
   const [anularVoto] = useAnularVotoMutation();
   const [revelarVotos] = useRevelarVotosMutation();
   const [resetarVotos] = useResetarVotosMutation();
   const [selecionarHistoriaAtual, { reset: resetSelecionarHistoria }] =
      useSelecionarHistoriaAtualMutation();
   const [buscarVotosPorHistoria] =
      useLazyObterVotosPorHistoriaSessaoSessaoSalaQuery();
   const [adicionarHistoriaDuranteSessao] =
      useAdicionarOuRemoverHistoriaSessaoSalaMutation();

   const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

   const pessoasEncontradas: PessoaBusca[] = useMemo(
      () =>
         (pessoasEncontradasData?.Resultado?.pessoas ?? []).map((pessoa) => ({
            id: pessoa.id,
            nome: pessoa.nome,
            email: pessoa.email ?? '',
         })),
      [pessoasEncontradasData],
   );

   const participantes = useMemo(
      () => participantesData?.Resultado?.participantes ?? [],
      [participantesData],
   );
   const loadingApi = useMemo(
      () =>
         carregandoParticipantes ||
         buscandoPessoas ||
         adicionandoParticipanteOuVisitante ||
         atualizandoParticipaVotacao,
      [
         carregandoParticipantes,
         buscandoPessoas,
         adicionandoParticipanteOuVisitante,
         atualizandoParticipaVotacao,
      ],
   );

   const onBuscarParticipantes = async () => {
      try {
         await buscarParticipantes({
            sala_id: salaId,
            ...(sessaoId ? { sessao_id: sessaoId } : {}),
            apenasOnline: true,
         }).unwrap();
         return true;
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
         return false;
      }
   };

   const onBuscarPessoas = (termo: string) => {
      reset();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (termo.length < 2) return;
      timerRef.current = setTimeout(() => pesquisarPessoas({ termo }), 800);
   };

   const onAdicionarVisitante = async (pessoaId: string) => {
      try {
         const res = await adicionarParticipanteOuVisitante({
            pessoa_id: pessoaId,
            role: 3,
         }).unwrap();
         if (!res.Sucesso) {
            toastError({ description: `${res.Mensagem}` });
            return false;
         }
         toastSuccess({ description: `${res.Mensagem}` });
         reset();
         return true;
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
         return false;
      }
   };

   const onAdicionarParticipante = async (pessoaId: string) => {
      try {
         const res = await adicionarParticipanteOuVisitante({
            pessoa_id: pessoaId,
            role: 2,
         }).unwrap();
         toastSuccess({ description: `${res.Mensagem}` });
         reset();
         return true;
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
         return false;
      }
   };

   const onCarregarVotos = async (historiaId: string) => {
      if (!sessaoId) return;
      const votos = await buscarVotosPorHistoria({
         sessaoId,
         historiaId,
      }).unwrap();
      setListaVotosCarregados({
         media: votos?.Resultado?.media ?? 0,
         voto_vencedor: votos?.Resultado?.voto_vencedor ?? 0,
         votos: votos?.Resultado?.votos ?? [],
      });
   };

   const onAtualizarParticipaVotacao = async (participaVotacao: boolean) => {
      if (!sessaoId) return false;
      try {
         await atualizarParticipaVotacao({
            sessaoId,
            participaVotacao,
         }).unwrap();
         return true;
      } catch (error) {
         toastError({
            title: 'Erro ao atualizar participação',
            description: getApiErrorMessage(error).Mensagem,
         });
         return false;
      }
   };

   const onEnviarVoto = async (
      valor: number,
      participaVotacao: boolean,
      historiaId: string,
   ) => {
      if (!sessaoId || !historiaId) {
         toastError({
            title: 'Erro ao votar',
            description: 'Nenhuma história selecionada para votação',
         });
         return;
      }
      try {
         await votar({
            sessaoId,
            valor,
            historia_id: historiaId,
            participa_votacao: participaVotacao,
         }).unwrap();

         toastSuccess({
            description: participaVotacao
               ? 'Voto registrado com sucesso!'
               : 'Você não está participando da votação',
         });
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
      }
   };

   const onAnularVoto = async (votoId: string) => {
      try {
         const res = await anularVoto(votoId).unwrap();
         toastSuccess({ description: `${res.Mensagem}` });
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
      }
   };

   const onRevelarVotos = async () => {
      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }
      try {
         await revelarVotos(sessaoId).unwrap();
         toastSuccess({ description: 'Votos revelados com sucesso!' });
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
      }
   };

   const onResetarVotos = async () => {
      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }
      try {
         await resetarVotos(sessaoId).unwrap();
         toastSuccess({
            description: 'Votos resetados! Podem votar novamente.',
         });
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
      }
   };

   const onSelecionarHistoria = async (historiaId: string) => {
      try {
         resetSelecionarHistoria();
         await selecionarHistoriaAtual({ historiaId }).unwrap();
         toastSuccess({
            title: 'História alterada',
            description: 'Todos os participantes foram notificados',
         });
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
      }
   };

   const onAdicionarHistorias = async (
      historias: Array<{ titulo: string; descricao?: string; ordem: number }>,
   ) => {
      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return;
      }
      await adicionarHistoriaDuranteSessao({
         adicionar: historias.map((h) => ({
            titulo: h.titulo,
            descricao: h.descricao,
            ordem: h.ordem,
         })),
      }).unwrap();
   };

   const onReordenarHistorias = async (
      novasHistorias: Array<{ id: string; titulo: string; descricao?: string }>,
      historiasSessao: Array<{ id: string }>,
   ) => {
      if (!sessaoId) {
         toastError({
            title: 'Erro',
            description: 'Nenhuma sessão ativa encontrada',
         });
         return false;
      }

      const idsAtuais = new Set(historiasSessao.map((h) => h.id));
      const idsNovos = new Set(novasHistorias.map((h) => h.id));

      const remover = historiasSessao
         .filter((h) => idsAtuais.has(h.id) && !idsNovos.has(h.id))
         .map((h) => h.id);

      if (remover.length === 0) return true;

      try {
         await adicionarHistoriaDuranteSessao({ remover }).unwrap();
         toastSuccess({
            description:
               remover.length === 1
                  ? 'História removida com sucesso!'
                  : 'Histórias removidas com sucesso!',
         });
         return true;
      } catch (error) {
         toastError({ description: getApiErrorMessage(error).Mensagem });
         return false;
      }
   };

   const onModoVisualizacaoChange = (ativo: boolean) => {
      if (!ativo) {
         dispatch(SalasApi.util.invalidateTags(['salaPlaning']));
      }
   };

   useEffect(() => {
      return () => {
         if (timerRef.current) clearTimeout(timerRef.current);
      };
   }, []);

   return {
      state: {
         participantes,
         pessoasEncontradas,
         loadingApi,
         listaVotosCarregados,
      },
      actions: {
         onBuscarParticipantes,
         onBuscarPessoas,
         onAdicionarVisitante,
         onAdicionarParticipante,
         onCarregarVotos,
         onAtualizarParticipaVotacao,
         resetBuscaPessoas: reset,
         setListaVotosCarregados,
         onEnviarVoto,
         onAnularVoto,
         onRevelarVotos,
         onResetarVotos,
         onSelecionarHistoria,
         onAdicionarHistorias,
         onReordenarHistorias,
         onModoVisualizacaoChange,
      },
   };
}
