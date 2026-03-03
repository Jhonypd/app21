'use client';

import React, { useState } from 'react';
import { Plus, Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { ModalBase } from './modal-base';
import { ButtonCustom } from '../button-custom';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface Historia {
   id: string;
   titulo: string;
   descricao: string;
}

interface ModalAdicionarHistoriasProps {
   aberto: boolean;
   aoFechar: () => void;
   aoSalvar: (
      historias: Historia[],
   ) => Promise<void | boolean | { Sucesso?: boolean }>;
   loading?: boolean;
}

export function ModalAdicionarHistorias({
   aberto,
   aoFechar,
   aoSalvar,
   loading = false,
}: ModalAdicionarHistoriasProps) {
   const [modoAdicao, setModoAdicao] = useState(false);
   const [historias, setHistorias] = useState<Historia[]>([]);
   const [novaHistoria, setNovaHistoria] = useState({
      titulo: '',
      descricao: '',
   });
   const [salvando, setSalvando] = useState(false);

   const handleAdicionar = () => {
      if (!novaHistoria.titulo.trim()) return;

      const historia: Historia = {
         id: Date.now().toString(),
         titulo: novaHistoria.titulo,
         descricao: novaHistoria.descricao,
      };

      setHistorias([...historias, historia]);
      setNovaHistoria({ titulo: '', descricao: '' });
      setModoAdicao(false);
   };

   const handleRemover = (id: string) => {
      setHistorias(historias.filter((h) => h.id !== id));
   };

   const handleImportarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const text = event.target?.result as string;
         const linhas = text.split('\n').filter((l) => l.trim());

         // Pular cabeçalho se existir
         const dados = linhas.slice(1);

         const historiasImportadas: Historia[] = dados.map((linha, index) => {
            const [titulo, descricao] = linha.split(',').map((s) => s.trim());
            return {
               id: `imported-${Date.now()}-${index}`,
               titulo: titulo || `História ${index + 1}`,
               descricao: descricao || '',
            };
         });

         setHistorias([...historias, ...historiasImportadas]);
      };
      reader.readAsText(file);

      // Limpar input
      e.target.value = '';
   };

   const handleSalvar = async () => {
      if (historias.length === 0) return;

      setSalvando(true);
      try {
         const resultado = await aoSalvar(historias);

         const sucessoExplicito =
            typeof resultado === 'boolean'
               ? resultado
               : typeof resultado === 'object' && resultado !== null
                 ? resultado.Sucesso !== false
                 : true;

         if (!sucessoExplicito) {
            return;
         }

         // Limpar histórias e fechar após salvar com sucesso
         setHistorias([]);
         setNovaHistoria({ titulo: '', descricao: '' });
         setModoAdicao(false);
         aoFechar();
      } catch {
         // Erro será tratado pelo componente pai
      } finally {
         setSalvando(false);
      }
   };

   const handleCancelar = () => {
      setHistorias([]);
      setNovaHistoria({ titulo: '', descricao: '' });
      setModoAdicao(false);
      aoFechar();
   };

   return (
      <ModalBase
         open={aberto}
         onOpenChange={(open) => {
            if (!open && !salvando) {
               handleCancelar();
            }
         }}
         titulo={
            <div className="flex items-center gap-2">
               <FileText className="text-muted-foreground h-5 w-5" />
               Adicionar Histórias
            </div>
         }
         maxWidth="lg"
         botoesAcoes={
            <>
               <ButtonCustom
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={salvando || loading}
                  className="uppercase"
               >
                  Cancelar
               </ButtonCustom>
               <ButtonCustom
                  onClick={handleSalvar}
                  disabled={historias.length === 0 || salvando || loading}
                  className="uppercase"
                  icon={
                     salvando ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     ) : undefined
                  }
               >
                  {salvando ? 'Salvando...' : 'Salvar'}
               </ButtonCustom>
            </>
         }
      >
         <div className="w-full space-y-4 px-3">
            <p className="text-muted-foreground text-sm">
               Crie histórias manualmente ou importe de um arquivo CSV
            </p>

            {/* Botões de ação */}
            <div className="flex gap-2">
               <ButtonCustom
                  onClick={() => setModoAdicao(true)}
                  disabled={modoAdicao || salvando || loading}
                  variant="outline"
                  className="flex flex-1 items-center justify-center gap-2"
                  icon={<Plus className="h-4 w-4" />}
               >
                  Nova História
               </ButtonCustom>

               <label
                  className={`hover:bg-accent flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all ${
                     salvando || loading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
               >
                  <Upload className="h-4 w-4" />
                  Importar CSV
                  <input
                     type="file"
                     accept=".csv"
                     onChange={handleImportarCSV}
                     disabled={salvando || loading}
                     className="hidden"
                  />
               </label>
            </div>

            {/* Formulário de nova história */}
            {modoAdicao && (
               <div className="border-primary/30 bg-primary/10 space-y-3 rounded-lg border p-4">
                  <Input
                     type="text"
                     value={novaHistoria.titulo}
                     onChange={(e) =>
                        setNovaHistoria({
                           ...novaHistoria,
                           titulo: e.target.value,
                        })
                     }
                     placeholder="Título da história *"
                     disabled={salvando || loading}
                     className="bg-background"
                  />
                  <Textarea
                     value={novaHistoria.descricao}
                     onChange={(e) =>
                        setNovaHistoria({
                           ...novaHistoria,
                           descricao: e.target.value,
                        })
                     }
                     placeholder="Descrição (opcional)"
                     rows={3}
                     disabled={salvando || loading}
                     className="bg-background resize-none"
                  />
                  <div className="flex gap-2">
                     <ButtonCustom
                        onClick={handleAdicionar}
                        disabled={
                           !novaHistoria.titulo.trim() || salvando || loading
                        }
                        className="flex-1"
                     >
                        Adicionar
                     </ButtonCustom>
                     <ButtonCustom
                        variant="outline"
                        onClick={() => {
                           setModoAdicao(false);
                           setNovaHistoria({
                              titulo: '',
                              descricao: '',
                           });
                        }}
                        disabled={salvando || loading}
                     >
                        Cancelar
                     </ButtonCustom>
                  </div>
               </div>
            )}

            {/* Lista de histórias */}
            {historias.length > 0 ? (
               <div>
                  <p className="text-muted-foreground mb-3 text-sm">
                     {historias.length} história
                     {historias.length > 1 ? 's' : ''} adicionada
                     {historias.length > 1 ? 's' : ''}
                  </p>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto px-2">
                     {historias.map((historia) => (
                        <div
                           key={historia.id}
                           className="bg-accent group rounded-lg border p-3 transition-all"
                        >
                           <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                 <p className="mb-1 text-sm font-medium">
                                    {historia.titulo}
                                 </p>
                                 {historia.descricao && (
                                    <p className="text-muted-foreground text-xs">
                                       {historia.descricao}
                                    </p>
                                 )}
                              </div>
                              <ButtonCustom
                                 onClick={() => handleRemover(historia.id)}
                                 disabled={salvando || loading}
                                 variant="ghost"
                                 size="sm"
                                 className="hover:bg-destructive/20 h-8 w-8 flex-shrink-0 p-0 text-red-400 opacity-0 transition-all group-hover:opacity-100"
                                 icon={<Trash2 className="h-4 w-4" />}
                              />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="rounded-lg border border-dashed p-8 text-center">
                  <FileText className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                     Nenhuma história adicionada ainda
                  </p>
                  <p className="text-muted-foreground text-xs">
                     Adicione histórias manualmente ou importe um CSV
                  </p>
               </div>
            )}

            {/* Dica sobre formato CSV */}
            {historias.length === 0 && (
               <div className="rounded-lg border border-blue-500/30 bg-blue-600/10 p-3">
                  <p className="mb-1 text-xs text-blue-300">
                     💡 Formato do CSV
                  </p>
                  <p className="text-muted-foreground text-xs">
                     Cada linha deve conter:{' '}
                     <code className="text-blue-300">titulo,descricao</code>
                  </p>
                  <p className="text-muted-foreground text-xs">
                     Exemplo:{' '}
                     <code>
                        Implementar login,Criar tela de login com autenticação
                     </code>
                  </p>
               </div>
            )}
         </div>
      </ModalBase>
   );
}
