'use client';

import React, { useState } from 'react';
import { Plus, Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { ModalBase } from './modal-base';
import { ButtonCustom } from '../button-custom';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import CardHistoria from './card-historia';
import {
   DndContext,
   closestCenter,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
   DragEndEvent,
} from '@dnd-kit/core';
import {
   arrayMove,
   SortableContext,
   verticalListSortingStrategy,
   sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { toastSuccess, toastWarning } from '../custom-toast';
import {
   importarHistoriasCSV,
   validarArquivoCSV,
} from '@/utils/importar-csv-historias';
import Loading from '../loading';

interface Historia {
   id: string;
   titulo: string;
   descricao: string;
}

interface ModalAdicionarHistoriasProps {
   aberto: boolean;
   proximaOrdemInicial: number;
   aoFechar: () => void;
   aoSalvar: (
      historias: Array<{ titulo: string; descricao?: string; ordem: number }>,
   ) => Promise<void | boolean | { Sucesso?: boolean }>;
   loading?: boolean;
}

export function ModalAdicionarHistorias({
   aberto,
   proximaOrdemInicial,
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

   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
         coordinateGetter: sortableKeyboardCoordinates,
      }),
   );

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
         setHistorias((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
         });
      }
   };

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

   const handleImportarCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar arquivo
      const validacao = validarArquivoCSV(file);
      if (!validacao.valido) {
         toastWarning({
            title: 'Arquivo inválido',
            description: validacao.erro || 'Erro desconhecido',
         });
         e.target.value = '';
         return;
      }

      try {
         const { historias: historiasImportadas, avisos } =
            await importarHistoriasCSV(file);

         // Exibir avisos se houver problemas de formato
         if (avisos.length > 0) {
            toastWarning({
               title: 'Histórias importadas com ajustes',
               description: avisos[0], // Mostra o aviso geral
            });
         } else {
            toastSuccess({
               title: 'Histórias importadas com sucesso!',
               description: `${historiasImportadas.length} história${historiasImportadas.length > 1 ? 's' : ''} adicionada${historiasImportadas.length > 1 ? 's' : ''}`,
            });
         }

         setHistorias([...historias, ...historiasImportadas]);
      } catch (error) {
         toastWarning({
            title: 'Erro ao importar',
            description:
               error instanceof Error ? error.message : 'Erro desconhecido',
         });
      } finally {
         // Limpar input
         e.target.value = '';
      }
   };

   const handleSalvar = async () => {
      if (historias.length === 0) return;

      const historiasComOrdem = historias.map((historia, index) => ({
         titulo: historia.titulo,
         descricao: historia.descricao,
         ordem: proximaOrdemInicial + index,
      }));

      setSalvando(true);
      try {
         const resultado = await aoSalvar(historiasComOrdem);

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
      <>
         {loading ||
            (salvando && (
               <Loading
                  active
                  type="transaction"
               />
            ))}
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
               <div className="flex justify-end gap-4">
                  <ButtonCustom
                     variant="outline"
                     size={'sm'}
                     onClick={handleCancelar}
                     disabled={salvando || loading}
                     className="uppercase"
                  >
                     Cancelar
                  </ButtonCustom>
                  <ButtonCustom
                     className="uppercase"
                     size={'sm'}
                     text="Limpar"
                     onClick={() => setHistorias([])}
                     disabled={historias.length === 0 || salvando || loading}
                  />
                  <ButtonCustom
                     size={'sm'}
                     onClick={handleSalvar}
                     disabled={historias.length === 0 || salvando || loading}
                     className="uppercase"
                     icon={
                        salvando ? (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : undefined
                     }
                  >
                     salvar
                  </ButtonCustom>
               </div>
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
                        salvando || loading
                           ? 'cursor-not-allowed opacity-50'
                           : ''
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
                        {historias.length > 1 ? 's' : ''} - Arraste para
                        reordenar
                     </p>
                     <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                     >
                        <SortableContext
                           items={historias.map((h) => h.id)}
                           strategy={verticalListSortingStrategy}
                        >
                           <div className="no-scrollbar max-h-[200px] space-y-2 overflow-y-auto rounded-lg border border-slate-400/10 p-3">
                              {historias.map((historia) => (
                                 <div
                                    key={historia.id}
                                    className="flex items-center gap-2"
                                 >
                                    <div className="min-w-0 flex-1">
                                       <CardHistoria
                                          historia={{
                                             id: historia.id,
                                             titulo: historia.titulo,
                                             descricao: historia.descricao,
                                             voto: [],
                                             jaFoiVotada: false,
                                          }}
                                          draggable={
                                             loading || salvando ? false : true
                                          }
                                       />
                                    </div>

                                    <ButtonCustom
                                       variant="ghost"
                                       size="sm"
                                       className="hover:bg-destructive/20 h-9 w-9 p-0 text-red-400"
                                       icon={<Trash2 className="h-4 w-4" />}
                                       title="Remover história"
                                       onClick={() =>
                                          handleRemover(historia.id)
                                       }
                                    />
                                 </div>
                              ))}
                           </div>
                        </SortableContext>
                     </DndContext>
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
                  </div>
               )}
            </div>
         </ModalBase>
      </>
   );
}
