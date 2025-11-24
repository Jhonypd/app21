'use client';

import React, { useState, useEffect } from 'react';
import { StepConvidados } from './wizard-steps/step-convidados';
import { StepHistorias } from './wizard-steps/step-historias';
import { StepConclusao } from './wizard-steps/step-conclusao';
import { useSalaEntrarMutation } from '@/services/api/salas-api';
import { useCriarVariasHistoriasMutation } from '@/services/api/historias-api';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  setSalaToken,
  iniciarSessao,
} from '@/services/api/configs/store/sala-auth-slice';
import { WizardBase, WizardStep } from './wizard-base';

interface WizardCriarSessaoProps {
  aberto: boolean;
  aoFechar: () => void;
  salaId: string;
  codigoSala: string;
  tituloSala: string;
}

export function WizardCriarSessao({
  aberto,
  aoFechar,
  salaId,
  codigoSala,
  tituloSala,
}: WizardCriarSessaoProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [
    convidadosSelecionados,
    setConvidadosSelecionados,
  ] = useState<
    Array<{ id: string; nome: string; email: string }>
  >([]);
  const [historias, setHistorias] = useState<
    Array<{ id: string; titulo: string; descricao: string }>
  >([]);
  const [listaPessoas, setListaPessoas] = useState<
    Array<{ id: string; nome: string; email: string }>
  >([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [entrarSala] = useSalaEntrarMutation();
  const [criarHistorias] =
    useCriarVariasHistoriasMutation();
  const [
    buscarPessoas,
    { data: dadosPessoas, isLoading: buscandoPessoas },
  ] = useLazyPesquisarPorNomeOuEmailQuery();

  // Atualizar lista de pessoas quando a busca retornar
  useEffect(() => {
    if (
      dadosPessoas?.Sucesso &&
      dadosPessoas.Resultado?.pessoas
    ) {
      setListaPessoas(dadosPessoas.Resultado.pessoas);
    }
  }, [dadosPessoas]);

  // Buscar pessoas conforme digita (com debounce)
  useEffect(() => {
    if (termoBusca.trim().length >= 2) {
      const timer = setTimeout(() => {
        buscarPessoas({ termo: termoBusca });
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timer);
    } else {
      setListaPessoas([]);
    }
  }, [termoBusca, buscarPessoas]);

  // Handler para atualizar o termo de busca
  const handleBuscarPessoas = (termo: string) => {
    setTermoBusca(termo);
  };

  const handleConfirmar = async () => {
    try {
      // Preparar lista de visitantes para enviar no entrarSala
      const visitantes =
        convidadosSelecionados.length > 0
          ? convidadosSelecionados.map((c) => c.id)
          : undefined;

      // 1. Entrar na sala (isso cria a sessão automaticamente e adiciona visitantes)
      const resultadoEntrar = await entrarSala({
        codigo: codigoSala,
        visitantes, // Visitantes são adicionados na criação da sessão
      }).unwrap();

      if (!resultadoEntrar.Sucesso) {
        throw new Error(
          resultadoEntrar.Mensagem ||
            'Erro ao iniciar sessão',
        );
      }

      // Salvar token da sala no Redux
      if (
        resultadoEntrar.Resultado?.tokenSala &&
        resultadoEntrar.Resultado?.dataExpiracao
      ) {
        dispatch(
          setSalaToken({
            tokenSala: resultadoEntrar.Resultado.tokenSala,
            expiracao: String(
              resultadoEntrar.Resultado.dataExpiracao,
            ),
          }),
        );
      }

      // Salvar sessão ativa no Redux
      if (resultadoEntrar.Resultado?.sessaoId) {
        console.log('[WIZARD] Salvando sessão no Redux:', {
          salaId,
          sessaoId: resultadoEntrar.Resultado.sessaoId,
        });
        dispatch(
          iniciarSessao({
            salaId,
            sessaoId: resultadoEntrar.Resultado.sessaoId,
          }),
        );
        console.log('[WIZARD] Sessão salva com sucesso!');
      } else {
        console.warn(
          '[WIZARD] sessaoId não recebido na resposta:',
          resultadoEntrar,
        );
      }

      // 2. Criar histórias (se houver)
      if (historias.length > 0) {
        console.log(
          '[WIZARD] Criando histórias...',
          historias.length,
        );
        await criarHistorias({
          salaId,
          historias: historias.map((h) => ({
            titulo: h.titulo,
            descricao: h.descricao,
          })),
        }).unwrap();
        console.log(
          '[WIZARD] Histórias criadas com sucesso!',
        );
      }

      console.log('[WIZARD] Exibindo toast de sucesso...');
      toastSuccess({
        title: 'Sessão iniciada!',
        description: 'Redirecionando para a sala...',
      });

      // Redirecionar para a sala PRIMEIRO
      console.log(
        '[WIZARD] Redirecionando para:',
        `/salas/${codigoSala}`,
      );
      router.push(`/salas/${codigoSala}`);

      // Limpar estado e fechar DEPOIS (permite o redirect acontecer)
      setTimeout(() => {
        console.log('[WIZARD] Fechando wizard...');
        handleFechar();
      }, 100);
    } catch (error) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    }
  };

  const handleFechar = () => {
    setConvidadosSelecionados([]);
    setHistorias([]);
    aoFechar();
  };

  const steps: WizardStep[] = [
    {
      id: 'convidados',
      titulo: 'Convidados',
      descricao:
        'Adicione pessoas para participar da sessão',
      conteudo: (
        <StepConvidados
          salaId={salaId}
          convidados={convidadosSelecionados}
          aoMudarConvidados={setConvidadosSelecionados}
          listaPessoas={listaPessoas}
          argumentoBusca={handleBuscarPessoas}
          isLoading={buscandoPessoas}
          tooltipInfo="Adicione pessoas que terão acesso permanente a
            esta sala. Elas poderão participar de todas as
            sessões."
        />
      ),
      // validar: () => convidadosSelecionados.length > 0,
      obrigatorio: false,
    },
    {
      id: 'historias',
      titulo: 'Histórias',
      descricao:
        'Adicione as histórias para serem planejadas',
      conteudo: (
        <StepHistorias
          salaId={salaId}
          historias={historias}
          aoMudarHistorias={setHistorias}
        />
      ),
      // validar: () => historias.length > 0,
      obrigatorio: false,
    },
    {
      id: 'conclusao',
      titulo: 'Conclusão',
      descricao: 'Revise e confirme as informações',
      conteudo: (
        <StepConclusao
          tituloSala={tituloSala}
          codigoSala={codigoSala}
          totalConvidados={convidadosSelecionados.length}
          totalHistorias={historias.length}
        />
      ),
      obrigatorio: false,
    },
  ];

  return (
    <WizardBase
      aberto={aberto}
      aoFechar={handleFechar}
      aoConfirmar={handleConfirmar}
      titulo="Iniciar Sessão de Planning"
      descricao="Configure sua sessão em 3 passos"
      steps={steps}
      textoBotaoFinal="Entrar na Sala"
      permitirPularSteps={false}
    />
  );
}
