'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useAtualizarParticipaVotacaoMutation } from '@/services/api/sessoes-api';
import {
   useAdicionarParticipanteMutation,
   useAdicionarVisitanteMutation,
   useLazyListarParticipantesSalaQuery,
} from '@/services/api/salas-api';
import { getApiErrorMessage } from '@/utils/api-error';
import type { VotosPorHistoriaResponse } from '@/services/types';
import { toastError, toastSuccess } from '@/components/custom-toast';

type PessoaBusca = { id: string; nome: string; email: string };

interface UseSalaPlanningDataParams {
   salaId: string;
   sessaoId?: string;
   aoBuscarVotosPorHistoria?: (
      historiaId: string,
   ) => Promise<VotosPorHistoriaResponse | null>;
}

export function useSalaPlanningData({
   salaId,
   sessaoId,
   aoBuscarVotosPorHistoria,
}: UseSalaPlanningDataParams) {
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

   const [adicionarVisitante, { isLoading: adicionandoVisitante }] =
      useAdicionarVisitanteMutation();
   const [adicionarParticipante, { isLoading: adicionandoParticipante }] =
      useAdicionarParticipanteMutation();
   const [
      atualizarParticipaVotacao,
      { isLoading: atualizandoParticipaVotacao },
   ] = useAtualizarParticipaVotacaoMutation();

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
         adicionandoVisitante ||
         adicionandoParticipante ||
         atualizandoParticipaVotacao,
      [
         carregandoParticipantes,
         buscandoPessoas,
         adicionandoVisitante,
         adicionandoParticipante,
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
         const res = await adicionarVisitante({
            sala_id: salaId,
            pessoa_id: pessoaId,
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
         const res = await adicionarParticipante({
            sala_id: salaId,
            pessoa_id: pessoaId,
            role: 2,
            ...(sessaoId ? { sessao_id: sessaoId } : {}),
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
      if (!aoBuscarVotosPorHistoria) return;
      const votos = await aoBuscarVotosPorHistoria(historiaId);
      setListaVotosCarregados({
         media: votos?.media ?? 0,
         voto_vencedor: votos?.voto_vencedor ?? 0,
         votos: votos?.votos ?? [],
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
      },
   };
}
