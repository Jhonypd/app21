'use client';

import React, { useState } from 'react';
import { BsInfoCircle, BsSearch, BsXLg } from 'react-icons/bs';
import { MdOutlinePersonAddAlt, MdOutlineMail } from 'react-icons/md';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface Convidado {
   id: string;
   nome: string;
   email: string;
}

interface StepConvidadosProps {
   salaId: string;
   convidados: Convidado[];
   aoMudarConvidados: (convidados: Convidado[]) => void;
   listaPessoas: Convidado[];
   argumentoBusca: (termo: string) => void;
   isLoading?: boolean;
   tooltipInfo?: string;
}

export function StepConvidados({
   //   salaId,
   convidados,
   aoMudarConvidados,
   listaPessoas,
   argumentoBusca,
   isLoading,
   tooltipInfo,
}: StepConvidadosProps) {
   const [busca, setBusca] = useState('');
   const [debouncedTerm, setDebouncedTerm] = useState('');

   const handleBuscar = (termo: string) => {
      setBusca(termo);
      // update debouncedTerm via effect
      setDebouncedTerm(termo);
   };

   // debounce termo antes de acionar a busca externa
   React.useEffect(() => {
      const handler = setTimeout(() => {
         // só busca no backend quando tiver 2 ou mais caracteres
         if (debouncedTerm.length >= 2) {
            argumentoBusca(debouncedTerm);
         } else {
            // limpa busca no pai
            argumentoBusca('');
         }
      }, 300);

      return () => clearTimeout(handler);
   }, [debouncedTerm, argumentoBusca]);

   const handleAdicionar = (usuario: Convidado) => {
      if (!convidados.find((c) => c.id === usuario.id)) {
         aoMudarConvidados([...convidados, usuario]);
      }
      setBusca('');
      argumentoBusca('');
   };

   const handleRemover = (id: string) => {
      aoMudarConvidados(convidados.filter((c) => c.id !== id));
   };

   return (
      <div className="space-y-6">
         <div>
            <div className="flex items-center justify-between">
               <h3 className="mb-2 flex w-full items-center gap-2">
                  <MdOutlinePersonAddAlt className="h-5 w-5 text-purple-400" />
                  Adicionar participantes
               </h3>
               <Tooltip delayDuration={1000}>
                  <TooltipTrigger>
                     <BsInfoCircle className="h-6 w-6" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-accent">
                     <p className="max-w-60 text-sm font-medium text-gray-300">
                        {tooltipInfo}
                     </p>
                  </TooltipContent>
               </Tooltip>
            </div>
            <p className="text-sm text-gray-400">
               Pesquise e adicione pessoas para participar da sessão de planning
            </p>
         </div>

         {/* Busca */}
         <div className="relative">
            <div className="relative">
               <BsSearch className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
               <input
                  type="text"
                  value={busca}
                  onChange={(e) => handleBuscar(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-sm placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
               />
            </div>

            {/* Resultados da busca: usa listaPessoas proveniente do pai (query) */}
            {busca.length >= 2 && (
               <div className="absolute z-10 mt-2 w-full rounded-xl border border-white/10 bg-slate-800 shadow-xl">
                  {isLoading ? (
                     <div className="p-3 text-sm text-gray-400">
                        Carregando resultados...
                     </div>
                  ) : listaPessoas.length > 0 ? (
                     listaPessoas.map((usuario) => {
                        const jaAdicionado = convidados.find(
                           (c) => c.id === usuario.id,
                        );
                        return (
                           <button
                              key={usuario.id}
                              onClick={() =>
                                 !jaAdicionado && handleAdicionar(usuario)
                              }
                              disabled={!!jaAdicionado}
                              className="flex w-full items-center gap-3 border-b border-white/5 p-3 text-left transition-all last:border-0 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                           >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                 <span className="text-sm uppercase">
                                    {usuario.nome.substring(0, 2)}
                                 </span>
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm">{usuario.nome}</p>
                                 <p className="text-xs text-gray-400">
                                    {usuario.email}
                                 </p>
                              </div>
                              {jaAdicionado && (
                                 <span className="text-xs text-green-400">
                                    ✓ Adicionado
                                 </span>
                              )}
                           </button>
                        );
                     })
                  ) : (
                     <div className="p-3 text-sm text-gray-400">
                        Nenhum resultado encontrado
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Lista de convidados adicionados */}
         {convidados.length > 0 ? (
            <div>
               <p className="mb-3 text-sm text-gray-400">
                  {convidados.length} convidado
                  {convidados.length > 1 ? 's' : ''} adicionado
                  {convidados.length > 1 ? 's' : ''}
               </p>
               <div className="space-y-2">
                  {convidados.map((convidado) => (
                     <div
                        key={convidado.id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                     >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                           <span className="text-sm uppercase">
                              {convidado.nome.substring(0, 2)}
                           </span>
                        </div>
                        <div className="flex-1">
                           <p className="text-sm">{convidado.nome}</p>
                           <p className="flex items-center justify-start gap-1 text-center text-xs text-gray-400">
                              <MdOutlineMail />
                              {convidado.email}
                           </p>
                        </div>
                        <button
                           onClick={() => handleRemover(convidado.id)}
                           className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30"
                        >
                           <BsXLg className="h-4 w-4" />
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         ) : (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
               <MdOutlinePersonAddAlt className="mx-auto mb-2 h-8 w-8 text-gray-500" />
               <p className="text-sm text-gray-400">
                  Nenhum convidado adicionado ainda
               </p>
               <p className="text-xs text-gray-500">
                  Busque e adicione pessoas para começar
               </p>
            </div>
         )}
      </div>
   );
}
