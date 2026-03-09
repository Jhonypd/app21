'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { ModalBase } from './modal-base';

export interface WizardStep {
   id: string;
   titulo: string;
   descricao?: string;
   conteudo: ReactNode;
   validar?: () => boolean;
   obrigatorio?: boolean;
}

interface WizardBaseProps<TData = unknown> {
   aberto: boolean;
   aoFechar: () => void;
   aoConfirmar: (dados?: TData) => void;
   titulo: string;
   // descricao?: string;
   steps: WizardStep[];
   textoBotaoFinal?: string;
   permitirPularSteps?: boolean;
   dados?: TData;
   // aoMudarDados?: (dados: any) => void; // Callback quando dados mudam
}

export function WizardBase<TData = unknown>({
   aberto,
   aoFechar,
   aoConfirmar,
   titulo,
   // descricao,
   steps,
   textoBotaoFinal = 'Confirmar',
   permitirPularSteps = false,
   dados,
   // aoMudarDados,
}: WizardBaseProps<TData>) {
   const [stepAtualIndex, setStepAtualIndex] = useState(0);
   const stepAtual = steps[stepAtualIndex];

   // Verificar se pode avançar
   const podeAvancar = () => {
      if (!stepAtual) return false;

      // Se não é obrigatório e permite pular, pode avançar
      if (!stepAtual.obrigatorio && permitirPularSteps) return true;

      // Se tem validação, usar ela
      if (stepAtual.validar) {
         return stepAtual.validar();
      }

      // Por padrão, pode avançar
      return true;
   };

   const handleProximo = () => {
      if (stepAtualIndex < steps.length - 1) {
         setStepAtualIndex(stepAtualIndex + 1);
      } else {
         // Último step - confirmar
         aoConfirmar(dados);
      }
   };

   const handleVoltar = () => {
      if (stepAtualIndex > 0) {
         setStepAtualIndex(stepAtualIndex - 1);
      }
   };

   const handleFechar = () => {
      setStepAtualIndex(0);
      aoFechar();
   };

   // Verificar se step foi completado
   const stepCompleto = (index: number) => {
      if (index > stepAtualIndex) return false;
      if (index === stepAtualIndex) return false;
      return true;
   };

   return (
      <ModalBase
         open={aberto}
         titulo={titulo}
         onOpenChange={(open) => !open && handleFechar()}
         botoesAcoes={
            <div className="flex justify-end gap-4">
               <button
                  onClick={handleVoltar}
                  disabled={stepAtualIndex === 0}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
               </button>
               <button
                  onClick={handleProximo}
                  disabled={!podeAvancar()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {stepAtualIndex === steps.length - 1
                     ? textoBotaoFinal
                     : 'Próximo'}
                  <ChevronRight className="h-4 w-4" />
               </button>
            </div>
         }
      >
         <div className="border-b border-white/10 p-6">
            {/* Steps Indicator */}
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
               {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                     <div className="flex flex-shrink-0 items-center gap-2">
                        <div
                           className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all ${
                              stepCompleto(index)
                                 ? 'bg-green-600 text-white'
                                 : stepAtualIndex === index
                                   ? 'bg-purple-600 text-white'
                                   : 'bg-white/10 text-gray-400'
                           }`}
                        >
                           {stepCompleto(index) ? (
                              <Check className="h-4 w-4" />
                           ) : (
                              index + 1
                           )}
                        </div>
                        <span
                           className={`text-sm whitespace-nowrap ${
                              stepAtualIndex === index
                                 ? 'text-white'
                                 : 'text-gray-400'
                           }`}
                        >
                           {step.titulo}
                        </span>
                     </div>
                     {index < steps.length - 1 && (
                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600" />
                     )}
                  </React.Fragment>
               ))}
            </div>

            {/* Descrição do step atual */}
            {stepAtual?.descricao && (
               <p className="mt-3 text-sm text-gray-400">
                  {stepAtual.descricao}
               </p>
            )}
         </div>

         {/* Content */}
         <div className="max-h-[50vh] overflow-y-auto p-6">
            {stepAtual?.conteudo}
         </div>
      </ModalBase>
   );
}
