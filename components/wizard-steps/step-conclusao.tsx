'use client';

import React from 'react';
import { Users, FileText, Code, Sparkles } from 'lucide-react';
import { toastSuccess } from '../custom-toast';

interface StepConclusaoProps {
   tituloSala: string;
   codigoSala: string;
   totalConvidados: number;
   totalHistorias: number;
}

export function StepConclusao({
   tituloSala,
   codigoSala,
   totalConvidados,
   totalHistorias,
}: StepConclusaoProps) {
   const copyTexto = async (text: string, msg: string) => {
      await navigator.clipboard.writeText(text);
      toastSuccess({
         title: 'Copiado!',
         description: msg,
      });
   };
   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
         {/* Header de Sucesso */}
         <div className="space-y-3 text-center">
            <h3 className="text-foreground text-xl font-bold">Tudo pronto!</h3>

            <p className="text-muted-foreground mx-auto max-w-md text-sm">
               Sua sessão de planning está configurada e pronta para começar.
               Compartilhe o código com sua equipe!
            </p>
         </div>

         {/* Card da Sala */}
         <div className="border-primary/20 from-primary/10 to-primary/5 rounded-xl border bg-gradient-to-br p-4 shadow-lg">
            <div className="text-muted-foreground mb-3 flex items-center gap-2">
               <Code className="text-primary h-4 w-4" />
               <span className="text-xs font-medium tracking-wide uppercase">
                  Código da Sala
               </span>
            </div>

            <div className="space-y-2">
               <p className="text-foreground text-sm font-medium">
                  {tituloSala}
               </p>
               <div className="flex items-center gap-2">
                  <code className="bg-background/80 text-primary border-primary/20 flex-1 rounded-lg border px-3 py-2 font-mono text-lg font-bold">
                     {codigoSala}
                  </code>
                  <button
                     onClick={copyTexto.bind(
                        null,
                        codigoSala,
                        'Código da sala copiado para a área de transferência',
                     )}
                     className="bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                  >
                     Copiar
                  </button>
               </div>
            </div>
         </div>

         {/* Estatísticas */}
         <div className="grid grid-cols-2 gap-3">
            <div className="group border-border bg-card hover:border-primary/50 rounded-xl border p-4 transition-all hover:shadow-md">
               <div className="text-muted-foreground mb-2 flex items-center gap-2">
                  <Users className="text-primary h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium tracking-wide uppercase">
                     Convidados
                  </span>
               </div>
               <p className="text-foreground text-2xl font-bold">
                  {totalConvidados}
               </p>
               <p className="text-muted-foreground text-xs">
                  pessoa{totalConvidados !== 1 ? 's' : ''} convidada
                  {totalConvidados !== 1 ? 's' : ''}
               </p>
            </div>

            <div className="group border-border bg-card hover:border-primary/50 rounded-xl border p-4 transition-all hover:shadow-md">
               <div className="text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="text-primary h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium tracking-wide uppercase">
                     Histórias
                  </span>
               </div>
               <p className="text-foreground text-2xl font-bold">
                  {totalHistorias}
               </p>
               <p className="text-muted-foreground text-xs">
                  {totalHistorias === 0
                     ? 'Nenhum item'
                     : `item${totalHistorias !== 1 ? 's' : ''}`}{' '}
                  para estimar
               </p>
            </div>
         </div>

         {/* Próximos Passos */}
         <div className="border-primary/30 from-primary/10 via-primary/5 rounded-xl border bg-gradient-to-br to-transparent p-4">
            <div className="mb-3 flex items-center gap-2">
               <Sparkles className="text-primary h-4 w-4" />
               <p className="text-foreground text-sm font-semibold">
                  Próximos passos
               </p>
            </div>

            <ul className="space-y-2">
               {[
                  'Os convidados receberão uma notificação para entrar na sala',
                  'Você poderá selecionar histórias e iniciar a votação',
                  'Todos os participantes poderão votar simultaneamente',
               ].map((texto, index) => (
                  <li
                     key={index}
                     className="flex items-start gap-2"
                  >
                     <span className="text-primary mt-0.5 text-xs">•</span>
                     <span className="text-muted-foreground text-xs leading-relaxed">
                        {texto}
                     </span>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   );
}
