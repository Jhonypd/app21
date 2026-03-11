'use client';

import { useEffect, useState } from 'react';
import { MdOutlinePersonAddAlt } from 'react-icons/md';
import { BsArrowClockwise } from 'react-icons/bs';
import { SearchInput } from '@/components/inputs/input-search';
import { ModalBase } from '../modal-base';
import { ButtonCustom } from '../button-custom';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '../ui/checkbox';

interface Pessoa {
   id: string;
   nome: string;
   email: string;
}

interface ModalAdicionarVisitanteProps {
   titulo: string;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   termoBusca: string;
   onBuscar: (termo: string) => void;
   pessoas: Pessoa[];
   loading: boolean;
   onAdicionar: (pessoaId: string) => Promise<void>;
}

export function ModalAdicionarParticipanteOuVisitante({
   open,
   onOpenChange,
   termoBusca,
   onBuscar,
   pessoas,
   loading,
   onAdicionar,
   titulo,
}: ModalAdicionarVisitanteProps) {
   const [pessoaSelecionadaId, setPessoaSelecionadaId] = useState('');
   const [termoBuscaLocal, setTermoBuscaLocal] = useState(termoBusca);
   const { usuario } = useAuth();

   useEffect(() => {
      setTermoBuscaLocal(termoBusca);
   }, [termoBusca]);

   const handleClose = () => {
      setPessoaSelecionadaId('');
      setTermoBuscaLocal('');
      onOpenChange(false);
   };

   const handleAdicionar = async () => {
      if (!pessoaSelecionadaId) return;
      await onAdicionar(pessoaSelecionadaId);
      setPessoaSelecionadaId('');
   };

   const handleBuscarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onBuscar(termoBuscaLocal);
   };

   return (
      <ModalBase
         open={open}
         onOpenChange={handleClose}
         titulo={titulo}
         maxWidth="lg"
         botoesAcoes={
            <>
               <ButtonCustom
                  onClick={handleClose}
                  className="rounded-lg bg-slate-700 px-4 py-2 uppercase transition-all hover:bg-slate-600"
               >
                  Cancelar
               </ButtonCustom>
               <ButtonCustom
                  onClick={handleAdicionar}
                  disabled={!pessoaSelecionadaId || loading}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  <p className="flex items-center justify-center gap-2 uppercase">
                     <MdOutlinePersonAddAlt className="h-5 w-5" />
                     Adicionar
                  </p>
               </ButtonCustom>
            </>
         }
      >
         {/* Campo de busca */}
         <form onSubmit={handleBuscarSubmit}>
            <SearchInput
               placeholder="Buscar por nome ou email..."
               value={termoBuscaLocal}
               onChange={(e) => setTermoBuscaLocal(e.target.value)}
               disabled={loading}
               className="border-slate-700 bg-slate-800 text-white"
            />
         </form>

         {/* Lista de resultados */}
         {loading && (
            <p className="text-center text-sm text-gray-400">
               <BsArrowClockwise className="mx-auto h-5 w-5 animate-spin" />
            </p>
         )}

         {pessoas && pessoas.length > 0 && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
               {pessoas
                  .filter((pessoa) => pessoa.id !== usuario?.id)
                  .map((pessoa) => (
                     <div
                        key={pessoa.id}
                        className={`relative h-16 w-full rounded-lg border p-3 text-left transition-all ${
                           pessoaSelecionadaId === pessoa.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                        }`}
                     >
                        <Checkbox
                           checked={pessoaSelecionadaId === pessoa.id}
                           onCheckedChange={() =>
                              setPessoaSelecionadaId(
                                 pessoa.id === pessoaSelecionadaId
                                    ? ''
                                    : pessoa.id,
                              )
                           }
                           className="absolute right-4 h-5 w-5 translate-y-1/2 border-2 border-slate-400"
                        />
                        <p className="font-medium">{pessoa.nome}</p>
                        <p className="text-sm text-gray-400">{pessoa.email}</p>
                     </div>
                  ))}
            </div>
         )}

         {!loading && pessoas.length === 0 && termoBusca.length >= 2 && (
            <p className="text-center text-sm text-gray-400">
               Nenhuma pessoa encontrada
            </p>
         )}
      </ModalBase>
   );
}
