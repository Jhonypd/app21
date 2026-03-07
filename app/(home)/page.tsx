'use client';

import { AcoesPrincipais } from '@/components/acoes-principais';
import { CriarSala } from '@/components/criar-sala';
import { EntrarSala } from '@/components/entrar-sala';
import { EstatisticasRapidas } from '@/components/estatisticas-rapidas';
import { useAuth } from '@/hooks/useAuth';
import type { LoginSalaPayload, Salas } from '@/services/types';
import {
   useListarSalasQuery,
   useEntrarSalaMutation,
} from '@/services/api/salas-api';
import { useEffect, useState } from 'react';
import { CardSala } from '@/components/card-sala';
import { toastError } from '@/components/custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { iniciarSessao } from '@/services/api/configs/store/sala-auth-slice';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { WizardCriarSessao } from '@/components/wizard-criar-sessao';
import Loading from '@/components/loading';

const LandingPage = () => {
   const router = useRouter();
   const dispatch = useDispatch();
   const { usuario } = useAuth();

   // Estados de filtro e busca
   const [modalCriarAberto, setModalCriarAberto] = useState(false);
   const [modalEntrarAberto, setModalEntrarAberto] = useState(false);

   // Estados de salas
   const [listaSalas, setListaSalas] = useState<Salas[]>([]);

   // Estados do wizard
   const [wizardAberto, setWizardAberto] = useState(false);
   const [salaParaIniciar, setSalaParaIniciar] = useState<Salas | null>(null);

   // Queries e mutations
   const [entrarSala, { isLoading: isLoadingEntrar }] = useEntrarSalaMutation();
   const { data, isLoading } = useListarSalasQuery({
      itensPagina: 10,
      pagina: 0,
   });

   const handleAbrirWizard = (sala: Salas) => {
      setSalaParaIniciar(sala);
      setWizardAberto(true);
   };

   const handleEntrarSala = async (
      codigo: string,
      senha?: string,
   ): Promise<boolean> => {
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
      }
   };

   useEffect(() => {
      if (usuario) {
         if (data && data.Sucesso && data.Resultado) {
            setListaSalas(data.Resultado.salas);
         }
      }
   }, [usuario, data]);
   return (
      <>
         {isLoading ||
            (isLoadingEntrar && (
               <Loading
                  active
                  type="transaction"
               />
            ))}
         <div className="container">
            <div className="relative mx-auto max-w-4xl space-y-6 overflow-x-auto rounded-2xl px-4 text-center">
               <EstatisticasRapidas />

               <AcoesPrincipais
                  aoClicarCriar={() => setModalCriarAberto(true)}
                  aoClicarEntrar={() => setModalEntrarAberto(true)}
               />
            </div>
            <CriarSala
               aberto={modalCriarAberto}
               aoFechar={() => setModalCriarAberto(false)}
            />
            <EntrarSala
               aberto={modalEntrarAberto}
               aoFechar={() => setModalEntrarAberto(false)}
            />
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
            <div className="mt-6 space-y-3 px-4">
               <div className="flex">
                  <h2 className="text-accent-foreground text-xl">
                     Sessão ativa
                  </h2>
               </div>
               {listaSalas.length > 0 &&
                  listaSalas
                     .filter((sala) => sala.status === 'online')
                     .map((sala, index) => (
                        <CardSala
                           key={sala.id}
                           index={index}
                           sala={sala}
                           abrirWizard={handleAbrirWizard}
                           entrarSessaoAtiva={handleEntrarSala}
                           podeIniciarSessao={
                              sala.meuRole === 0 || sala.meuRole === 1
                           }
                        />
                     ))}
            </div>
         </div>
      </>
   );
};

export default LandingPage;
