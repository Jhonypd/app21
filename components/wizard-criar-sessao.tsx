'use client';

import React, { useState, useEffect } from 'react';
import { StepConvidados } from './wizard-steps/step-convidados';
import { StepHistorias } from './wizard-steps/step-historias';
import { StepConclusao } from './wizard-steps/step-conclusao';
import {
   useEntrarSalaMutation,
   useCriarSessaoMutation,
} from '@/services/api/salas-api';
import { useLazyPesquisarPorNomeOuEmailQuery } from '@/services/api/pessoas.api';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { iniciarSessao } from '@/services/api/configs/store/sala-auth-slice';
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
   const [convidadosSelecionados, setConvidadosSelecionados] = useState<
      Array<{ id: string; nome: string; email: string }>
   >([]);
   const [historias, setHistorias] = useState<
      Array<{ id: string; titulo: string; descricao: string }>
   >([]);
   const [listaPessoas, setListaPessoas] = useState<
      Array<{ id: string; nome: string; email: string }>
   >([]);
   const [termoBusca, setTermoBusca] = useState('');

   const [entrarSala] = useEntrarSalaMutation();
   const [criarSessao] = useCriarSessaoMutation();
   const [buscarPessoas, { data: dadosPessoas, isLoading: buscandoPessoas }] =
      useLazyPesquisarPorNomeOuEmailQuery();

   // Atualizar lista de pessoas quando a busca retornar
   useEffect(() => {
      if (dadosPessoas?.Sucesso && dadosPessoas.Resultado?.pessoas) {
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
         // Validar histórias antes de prosseguir
         if (historias.length === 0) {
            toastError({
               title: 'Histórias obrigatórias',
               description:
                  'É necessário adicionar pelo menos uma história para iniciar a sessão.',
            });
            return;
         }

         // Preparar lista de visitantes para enviar ao criar sessão
         const visitantes =
            convidadosSelecionados.length > 0
               ? convidadosSelecionados.map((c) => c.id)
               : undefined;

         // ✅ 1. CRIAR SESSÃO COM HISTÓRIAS (POST /salas/:id/sessoes)
         // Agora envia as histórias junto com a sessão
         console.log(
            '[WIZARD] Criando sessão para sala:',
            salaId,
            'com visitantes:',
            visitantes,
            'e historias:',
            historias.length,
         );
         const resultadoCriarSessao = await criarSessao({
            salaId,
            visitantes,
            historias: historias.map((h) => ({
               titulo: h.titulo,
               descricao: h.descricao,
            })),
         }).unwrap();

         if (!resultadoCriarSessao.Sucesso) {
            throw new Error(
               resultadoCriarSessao.Mensagem || 'Erro ao criar sessão',
            );
         }

         console.log(
            '[WIZARD] Sessão criada com sucesso!',
            resultadoCriarSessao,
         );

         // ✅ 2. ENTRAR NA SALA (POST /salas/:codigo/entrar)
         // Agora sim a sessão existe, participantes criados (permanentes + visitantes)
         console.log('[WIZARD] Entrando na sala:', codigoSala);
         const resultadoEntrar = await entrarSala({
            codigo: codigoSala,
            // Não envia mais visitantes - já foram adicionados ao criar sessão
         }).unwrap();

         if (!resultadoEntrar.Sucesso) {
            throw new Error(
               resultadoEntrar.Mensagem || 'Erro ao iniciar sessão',
            );
         }

         // NOTA: token_sala é setado automaticamente via cookie httpOnly pelo backend
         // Não é necessário gerenciar no Redux

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

         console.log('[WIZARD] Exibindo toast de sucesso...');
         toastSuccess({
            title: 'Sessão iniciada!',
            description: 'Redirecionando para a sala...',
         });

         // Redirecionar para a sala PRIMEIRO
         console.log('[WIZARD] Redirecionando para:', `/salas/${codigoSala}`);
         router.push(`/salas/${codigoSala}`);

         // Limpar estado e fechar DEPOIS (permite o redirect acontecer)
         setTimeout(() => {
            console.log('[WIZARD] Fechando wizard...');
            handleFechar();
         }, 100);
      } catch (error) {
         const apiError = getApiErrorMessage(error);
         toastError({
            description: apiError.Mensagem,
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
         descricao: 'Adicione pessoas para participar da sessão',
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
         descricao: 'Adicione as histórias para serem planejadas',
         conteudo: (
            <StepHistorias
               salaId={salaId}
               historias={historias}
               aoMudarHistorias={setHistorias}
            />
         ),
         validar: () => historias.length > 0,
         obrigatorio: true,
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
         textoBotaoFinal="Iniciar Sessão"
         permitirPularSteps={false}
      />
   );
}
