import React, { useState } from 'react';
import FormularioBase from './forms/formulario-base';
import { FormularioSala } from '@/modules/salas/components/formulario-sala';
import { useCriarSalaMutation } from '@/services/api/salas-api';
import { SalaForm } from '@/modules/salas/types';
import { toastError, toastSuccess } from './custom-toast';
import { getApiErrorMessage } from '@/utils/api-error';

interface CriarSalaProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function CriarSala({
  aberto,
  aoFechar,
}: CriarSalaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [formData, setFormData] = useState<SalaForm | null>(
    null,
  );

  const [criarSala] = useCriarSalaMutation();

  const handleCriar = async (data: SalaForm) => {
    setIsLoading(true);
    try {
      const novaSala = await criarSala({
        titulo: data.titulo,
        salaPrivada: data.salaPrivada,
        senha:
          data.senha.length > 0 ? data.senha : undefined,
      }).unwrap();

      if (!novaSala.Sucesso) {
        toastError({
          title: `${novaSala.Mensagem}`,
          description: `${novaSala.Detalhe}`,
        });
        return;
      } else {
        toastSuccess({
          description: 'Sala criada com sucesso!',
        });
        aoFechar();
      }
    } catch (error) {
      console.table(error);
      const { Mensagem, Detalhe } =
        getApiErrorMessage(error);

      toastError({
        title: Mensagem,
        description: Detalhe,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormularioBase
      className="border-slate-700 bg-slate-900 text-white"
      title="Criar Nova Sala"
      open={aberto}
      onOpenChange={aoFechar}
      isLoading={isLoading}
      isValid={isValidated}
      onSubmit={() => {
        if (formData) {
          handleCriar(formData);
        }
      }}
    >
      <FormularioSala
        isLoading={isLoading}
        isValidated={(valid) => setIsValidated(valid)}
        onDataChange={(data) => setFormData(data.values)}
      />
    </FormularioBase>
  );
}
