import React from 'react';
import { Filter } from 'lucide-react';
import { ButtonCustom } from './button-custom';

interface BotaoFiltroProps {
   ativo: boolean;
   aoClicar: () => void;
   badge?: number;
}

export function BotaoFiltro({ ativo, aoClicar, badge }: BotaoFiltroProps) {
   return (
      <ButtonCustom
         size={'sm'}
         onClick={aoClicar}
         className={`relative flex items-center justify-center rounded-xl transition-all active:scale-95 ${
            ativo ? 'bg-purple-600' : 'bg-white/5 hover:bg-white/10'
         }`}
      >
         <Filter className="h-5 w-5" />
         {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-xs">
               {badge}
            </span>
         )}
      </ButtonCustom>
   );
}
