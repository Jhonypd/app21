'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TextInput } from '@/components/inputs/input-text';
import { TextAreaInput } from '@/components/inputs/input-textArea';
import { ModalBase } from './modal-base';
import { toastError, toastSuccess } from '../custom-toast';

interface DialogAdicionarHistoriaProps {
  salaId: string;
  onAdicionarHistoria: (dados: {
    titulo: string;
    descricao?: string;
  }) => Promise<void>;
  mostrarBotao?: boolean;
}

export function DialogAdicionarHistoria({
  onAdicionarHistoria,
  mostrarBotao = true,
}: DialogAdicionarHistoriaProps) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      toastError({ description: 'O título é obrigatório' });
      return;
    }

    setCarregando(true);
    try {
      await onAdicionarHistoria({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
      });

      toastSuccess({
        description: 'História adicionada com sucesso!',
      });
      setTitulo('');
      setDescricao('');
      setOpen(false);
    } catch (erro: unknown) {
      const errorMessage = erro as {
        data?: { Mensagem?: string };
      };
      toastError({
        description:
          errorMessage?.data?.Mensagem ||
          'Erro ao adicionar história',
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !carregando) {
      setTitulo('');
      setDescricao('');
    }
    setOpen(newOpen);
  };

  if (!mostrarBotao) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Adicionar História
      </Button>

      <ModalBase
        open={open}
        onOpenChange={handleOpenChange}
        titulo="Adicionar História"
        maxWidth="lg"
        botoes={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={carregando}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={carregando}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {carregando ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </>
        }
      >
        <TextInput
          id="titulo"
          name="titulo"
          label="Título"
          placeholder="Ex: Implementar login com Google"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={carregando}
          error={!titulo.trim() && titulo.length > 0}
          autoFocus
        />

        <TextAreaInput
          id="descricao"
          name="descricao"
          label="Descrição (opcional)"
          placeholder="Detalhes sobre a história..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={carregando}
          maxLines={4}
        />
      </ModalBase>
    </>
  );
}
