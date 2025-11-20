'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { StepConvidados } from './wizard-steps/step-convidados';
import { StepHistorias } from './wizard-steps/step-historias';
import { StepConclusao } from './wizard-steps/step-conclusao';
import { usePesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { useSalaEntrarMutation } from '@/services/api/salas-api';
import { useCriarVariasHistoriasMutation } from '@/services/api/historias-api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSalaToken } from '@/services/api/configs/store/sala-auth-slice';

interface WizardCriarSessaoProps {
  aberto: boolean;
  aoFechar: () => void;
  salaId: string;
  codigoSala: string;
  tituloSala: string;
}

type Step = 'convidados' | 'historias' | 'conclusao';

export function WizardCriarSessao({
  aberto,
  aoFechar,
  salaId,
  codigoSala,
  tituloSala,
}: WizardCriarSessaoProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [stepAtual, setStepAtual] =
    useState<Step>('convidados');
  const [
    convidadosSelecionados,
    setConvidadosSelecionados,
  ] = useState<
    Array<{ id: string; nome: string; email: string }>
  >([]);
  const [historias, setHistorias] = useState<
    Array<{ id: string; titulo: string; descricao: string }>
  >([]);
  const [argumentoBusca, setArgumentoBusca] = useState('');
  const [criandoSessao, setCriandoSessao] = useState(false);

  const [entrarSala] = useSalaEntrarMutation();
  const [criarHistorias] =
    useCriarVariasHistoriasMutation();

  const { data, isLoading } =
    usePesquisarPorNomeOuEmailQuery({
      termo: argumentoBusca,
    });

  const steps: {
    id: Step;
    titulo: string;
    numero: number;
  }[] = [
    { id: 'convidados', titulo: 'Convidados', numero: 1 },
    { id: 'historias', titulo: 'Histórias', numero: 2 },
    { id: 'conclusao', titulo: 'Conclusão', numero: 3 },
  ];

  const stepAtualIndex = steps.findIndex(
    (s) => s.id === stepAtual,
  );

  const podeAvancar =
    stepAtual === 'convidados' ||
    stepAtual === 'historias' ||
    stepAtual === 'conclusao';

  const handleProximo = async () => {
    if (stepAtual === 'convidados') {
      setStepAtual('historias');
    } else if (stepAtual === 'historias') {
      setStepAtual('conclusao');
    } else {
      // Última etapa: criar sessão e redirecionar
      await handleIniciarSessao();
    }
  };

  const handleIniciarSessao = async () => {
    try {
      setCriandoSessao(true);

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

      // 2. Criar histórias (se houver)
      if (historias.length > 0) {
        await criarHistorias({
          salaId,
          historias: historias.map((h) => ({
            titulo: h.titulo,
            descricao: h.descricao,
          })),
        }).unwrap();
      }

      toastSuccess({
        title: 'Sessão iniciada!',
        description: 'Redirecionando para a sala...',
      });

      // Limpar estado e fechar
      handleFechar();

      // Redirecionar para a sala
      setTimeout(() => {
        router.push(`/salas/${codigoSala}`);
      }, 500);
    } catch (error: any) {
      const apiError = getApiErrorMessage(error);
      toastError({
        title: apiError.Mensagem,
        description: apiError.Detalhe,
      });
    } finally {
      setCriandoSessao(false);
    }
  };

  const handleVoltar = () => {
    if (stepAtual === 'historias') {
      setStepAtual('convidados');
    } else if (stepAtual === 'conclusao') {
      setStepAtual('historias');
    }
  };

  const handleFechar = () => {
    setStepAtual('convidados');
    setConvidadosSelecionados([]);
    setHistorias([]);
    aoFechar();
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={handleFechar}
    >
      <DialogContent className="max-h-[90vh] overflow-hidden border-white/20 bg-slate-900 p-0 text-white sm:max-w-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">
              Iniciar Sessão de Planning
            </h2>
            <button
              onClick={handleFechar}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-all hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${
                      stepAtualIndex > index
                        ? 'bg-green-600 text-white'
                        : stepAtual === step.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {stepAtualIndex > index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.numero
                    )}
                  </div>
                  <span
                    className={`text-sm ${stepAtual === step.id ? 'text-white' : 'text-gray-400'}`}
                  >
                    {step.titulo}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-6">
          {stepAtual === 'convidados' && (
            <StepConvidados
              salaId={salaId}
              convidados={convidadosSelecionados}
              aoMudarConvidados={setConvidadosSelecionados}
              listaPessoas={data?.Resultado?.pessoas || []}
              argumentoBusca={setArgumentoBusca}
              isLoading={isLoading}
            />
          )}

          {stepAtual === 'historias' && (
            <StepHistorias
              salaId={salaId}
              historias={historias}
              aoMudarHistorias={setHistorias}
            />
          )}

          {stepAtual === 'conclusao' && (
            <StepConclusao
              tituloSala={tituloSala}
              codigoSala={codigoSala}
              totalConvidados={
                convidadosSelecionados.length
              }
              totalHistorias={historias.length}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 p-6">
          <button
            onClick={handleVoltar}
            disabled={stepAtual === 'convidados'}
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>

          <button
            onClick={handleProximo}
            disabled={!podeAvancar || criandoSessao}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {criandoSessao ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Criando...
              </>
            ) : stepAtual === 'conclusao' ? (
              <>
                Iniciar Sessão
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
