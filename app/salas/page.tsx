'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import Loading from '@/components/loading';
import { useAuth } from '@/hooks/useAuth';
import type { LoginSalaPayload, Salas } from '@/services/types';
import {
   useListarSalasQuery,
   useEntrarSalaMutation,
   useAlterarSalaMutation,
   useExcluirSalaMutation,
} from '@/services/api/salas-api';
import { toastError, toastSuccess } from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { BarraBuscaSalas } from '@/components/barra-busca-salas';
import { BotaoFiltro } from '@/components/botao-filtro';
import { PainelFiltros } from '@/components/painel-filtros';
import { TipoOrdenacao } from '@/components/opcao-ordenacao';
import { TipoFiltroStatus } from '@/components/opcao-filtro';
import { CardSala } from '@/components/card-sala';
import { WizardCriarSessao } from '@/components/wizard-criar-sessao';
import { useDispatch } from 'react-redux';
import { iniciarSessao } from '@/services/api/configs/store/sala-auth-slice';
import { ButtonCustom } from '@/components/button-custom';

const PageSalas = () => {
   const router = useRouter();
   const dispatch = useDispatch();
   const { usuario } = useAuth();

   // Estados de filtro e busca
   const [busca, setBusca] = useState('');
   const [filtroStatus, setFiltroStatus] = useState<TipoFiltroStatus>('todas');
   const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>('recentes');
   const [mostrarFiltros, setMostrarFiltros] = useState(false);

   // Estados de salas
   const [listaSalas, setListaSalas] = useState<Salas[]>([]);
   const [loadingLogin, setLoadingLogin] = useState(false);

   // Estados do wizard
   const [wizardAberto, setWizardAberto] = useState(false);
   const [salaParaIniciar, setSalaParaIniciar] = useState<Salas | null>(null);

   // Queries e mutations
   const [entrarSala] = useEntrarSalaMutation();
   const [alterarSala] = useAlterarSalaMutation();
   const { data, isLoading, error } = useListarSalasQuery({
      itensPagina: 10,
      pagina: 0,
   });
   const [excluirSala, { isLoading: excluindoSala }] = useExcluirSalaMutation();

   // Carrega as salas quando os dados chegam
   useEffect(() => {
      if (usuario && data?.Sucesso && data.Resultado) {
         setListaSalas(data.Resultado.salas);
      }
   }, [usuario, data]);

   // Exibe erro se houver
   useEffect(() => {
      if (error) {
         const { Mensagem } = getApiErrorMessage(error);
         toastError({
            title: 'Erro ao carregar salas',
            description: Mensagem,
         });
      }
   }, [error]);

   // Filtrar salas
   const salasFiltradas = listaSalas.filter((sala) => {
      // Filtro de busca
      const passaBusca =
         busca === '' ||
         sala.titulo.toLowerCase().includes(busca.toLowerCase()) ||
         sala.proprietario.nome.toLowerCase().includes(busca.toLowerCase()) ||
         sala.codigo.toString().includes(busca);

      // Filtro de status
      let passaStatus = true;
      if (filtroStatus === 'ativas') {
         passaStatus = !sala.inativo;
      } else if (filtroStatus === 'encerradas') {
         passaStatus = sala.inativo;
      }

      return passaBusca && passaStatus;
   });

   // Ordenar salas
   const salasOrdenadas = [...salasFiltradas].sort((a, b) => {
      switch (ordenacao) {
         case 'recentes':
            return (
               new Date(b.data_criacao).getTime() -
               new Date(a.data_criacao).getTime()
            );
         case 'antigas':
            return (
               new Date(a.data_criacao).getTime() -
               new Date(b.data_criacao).getTime()
            );
         case 'participantes':
            return (b.membros || 0) - (a.membros || 0);
         default:
            return 0;
      }
   });

   // Handler para abrir o wizard de criar sessão
   const handleAbrirWizard = (sala: Salas) => {
      setSalaParaIniciar(sala);
      setWizardAberto(true);
   };

   // Handler para editar sala
   const handleEditarSala = async (
      salaId: string,
      dados: {
         titulo: string;
         senha?: string;
         participantesAdicionarIds?: string[];
         participantesRemoverIds?: string[];
      },
   ): Promise<void> => {
      try {
         const payload: {
            id: string;
            titulo: string;
            senha?: string;
            participantesAdicionarIds?: string[];
            participantesRemoverIds?: string[];
         } = {
            id: salaId,
            titulo: dados.titulo,
            ...(dados.participantesAdicionarIds && {
               participantesAdicionarIds: dados.participantesAdicionarIds,
            }),
            ...(dados.participantesRemoverIds && {
               participantesRemoverIds: dados.participantesRemoverIds,
            }),
         };

         // Só incluir senha se foi fornecida (não enviar null ou undefined)
         if (dados.senha) {
            payload.senha = dados.senha;
         }

         await alterarSala(payload).unwrap();
      } catch (error) {
         throw error; // Deixar o dialog-editar-sala tratar o erro
      }
   };

   const handleExcluirSala = async (id: string): Promise<boolean> => {
      try {
         if (!id) {
            throw new Error('Id da sala é necessário para exclusão.');
         }

         const sala = await excluirSala({ ids: [id] }).unwrap();

         if (!sala.Sucesso) {
            throw new Error(`${sala.Mensagem}`);
         }

         setListaSalas((salasAtuais) =>
            salasAtuais.filter((salaAtual) => salaAtual.id !== id),
         );

         toastSuccess({ description: `${sala.Mensagem}` });
         return true;
      } catch (error) {
         const errorMessage = getApiErrorMessage(error);
         toastError({
            description: `${errorMessage.Mensagem}`,
         });
         return false;
      }

      // Lógica para abrir dialog de exclusão
   };

   // Handler para entrar na sala (compatível com CardSala)
   const handleEntrarSala = async (
      codigo: string,
      senha?: string,
   ): Promise<boolean> => {
      setLoadingLogin(true);
      try {
         const loginPayload: LoginSalaPayload = {
            codigo,
            senha: senha || undefined,
         };
         const result = await entrarSala(loginPayload).unwrap();

         if (result.Sucesso) {
            // Salvar sessão ativa no Redux (CRÍTICO!)
            if (result.Resultado?.sessaoId) {
               // Buscar salaId pela lista de salas usando o código
               const sala = listaSalas.find((s) => s.codigo === codigo);
               if (sala) {
                  dispatch(
                     iniciarSessao({
                        salaId: sala.id,
                        sessaoId: result.Resultado.sessaoId,
                     }),
                  );
               } else {
                  console.warn(
                     '[ENTRAR CARD] Sala não encontrada na lista para salvar sessão',
                  );
               }
            } else {
               console.warn(
                  '[ENTRAR CARD] sessaoId não recebido na resposta:',
                  result,
               );
            }

            // Redirecionar para a sala
            router.push(`/salas/${codigo}`);
            return true;
         }
         return false;
      } catch (error) {
         const msg = getApiErrorMessage(error);
         toastError({
            description: msg.Mensagem,
         });
         return false;
      } finally {
         setLoadingLogin(false);
      }
   };

   return (
      <div className="min-h-screen bg-slate-950 pb-6 text-white">
         {/* Loading overlay */}
         {(isLoading || loadingLogin) && (
            <Loading
               active
               type="transaction"
            />
         )}

         {/* Header sticky */}
         <div className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-4">
               {/* Cabeçalho com voltar e contador */}
               <div className="mb-4 flex items-center gap-3">
                  <ButtonCustom
                     size={'sm'}
                     onClick={() => router.replace('/')}
                     className="flex items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 active:scale-95"
                     icon={<ArrowLeft className="h-5 w-5" />}
                  />

                  <div className="flex-1">
                     <h1 className="text-xl">Todas as Salas</h1>
                     <p className="text-xs text-gray-400">
                        {salasOrdenadas.length} sala
                        {salasOrdenadas.length !== 1 ? 's' : ''} encontrada
                        {salasOrdenadas.length !== 1 ? 's' : ''}
                     </p>
                  </div>

                  <BotaoFiltro
                     ativo={mostrarFiltros}
                     aoClicar={() => setMostrarFiltros(!mostrarFiltros)}
                  />
               </div>

               {/* Barra de busca */}
               <BarraBuscaSalas
                  valor={busca}
                  aoMudar={setBusca}
                  placeholder="Buscar por nome, código ou criador..."
               />

               {/* Painel de filtros */}
               <PainelFiltros
                  visivel={mostrarFiltros}
                  statusSelecionado={filtroStatus}
                  ordenacaoSelecionada={ordenacao}
                  aoMudarStatus={setFiltroStatus}
                  aoMudarOrdenacao={setOrdenacao}
               />
            </div>
         </div>

         {/* Wizard de criar sessão */}
         {salaParaIniciar && (
            <WizardCriarSessao
               aberto={wizardAberto}
               aoFechar={() => {
                  setWizardAberto(false);
                  setSalaParaIniciar(null);
               }}
               salaId={salaParaIniciar.id}
               codigoSala={salaParaIniciar.codigo}
               tituloSala={salaParaIniciar.titulo}
            />
         )}

         {/* Lista de salas */}
         <div className="mt-6 px-4">
            {salasOrdenadas.length > 0 ? (
               <div className="space-y-3">
                  {salasOrdenadas.map((sala, index) => (
                     <CardSala
                        key={sala.id}
                        index={index}
                        sala={sala}
                        abrirWizard={handleAbrirWizard}
                        entrarSessaoAtiva={handleEntrarSala}
                        editarSala={handleEditarSala}
                        podeIniciarSessao={
                           sala.meuRole === 0 || sala.meuRole === 1
                        }
                        excluirSala={handleExcluirSala}
                        excluirSalaLoading={excluindoSala}
                     />
                  ))}
               </div>
            ) : (
               // Estado vazio

               <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                     <Search className="h-10 w-10 text-gray-500" />
                  </div>
                  <p className="mb-2 text-gray-400">Nenhuma sala encontrada</p>
                  <p className="text-sm text-gray-500">
                     Tente ajustar os filtros ou buscar por outros termos
                  </p>
               </div>
            )}
         </div>
      </div>
   );
};

export default PageSalas;
