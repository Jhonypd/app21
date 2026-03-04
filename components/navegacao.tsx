import React from 'react';
import { MdBarChart } from 'react-icons/md';
import {
   BsFillHouseHeartFill,
   BsHousesFill,
   BsFillPersonFill,
} from 'react-icons/bs';
import Link from 'next/link';

interface NavegacaoProps {
   abaAtiva: string;
   aoMudarAba: (aba: string) => void;
}

export function Navegacao({ abaAtiva, aoMudarAba }: NavegacaoProps) {
   const abas = [
      { id: '/', label: 'Início', icone: BsFillHouseHeartFill, link: '/' },
      { id: 'salas', label: 'Salas', icone: BsHousesFill, link: '/salas' },
      // {
      //    id: 'buscar',
      //    label: 'Buscar',
      //    icone: MdSearch,
      //    link: '/buscar',
      // },
      {
         id: 'estatisticas',
         label: 'Estatísticas',
         icone: MdBarChart,
         link: '/dashboard',
      },
      {
         id: 'perfil',
         label: 'Perfil',
         icone: BsFillPersonFill,
         link: '/perfil',
      },
   ];

   return (
      <nav className="fixed right-4 bottom-4 left-4 z-50 max-w-screen rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-2xl">
         <ul className="grid grid-cols-4 gap-1 p-2">
            {abas.map((aba) => {
               const Icone = aba.icone;

               const ativa = abaAtiva === aba.id;

               return (
                  <li key={aba.id}>
                     <Link
                        href={aba.link}
                        onClick={() => aoMudarAba(aba.id)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 transition-all ${
                           ativa
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                              : 'text-gray-400 active:bg-white/5'
                        }`}
                     >
                        <Icone className="h-5 w-5" />
                        <span className="text-xs">{aba.label}</span>
                     </Link>
                  </li>
               );
            })}
         </ul>
      </nav>
   );
}
