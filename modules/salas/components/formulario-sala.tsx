'use client';
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from 'react';
import {
  useForm,
  FormProvider,
  ControllerRenderProps,
  ControllerFieldState,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

import { Switch } from '@/components/ui/switch';
import { TextInput } from '@/components/inputs/input-text';
import { PasswordInput } from '@/components/inputs/input-password';
import { DoorClosedLocked } from 'lucide-react';

import {
  SalaSchema,
  converteFormParaCriacaoData,
  converteFormParaEditarData,
} from '@/modules/salas/schema';

import {
  SalaAtualData,
  SalaFormularioDataChange,
} from '../interfaces';
import { SalaForm } from '../types';

export interface FormularioSalaRef {
  reset: () => void;
  submit: () => void;
}

interface FormularioSalaProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: SalaFormularioDataChange) => void;
  initialData?: SalaAtualData;
  onSubmit?: (data: SalaForm) => void;
}

export const FormularioSala = forwardRef<
  FormularioSalaRef,
  FormularioSalaProps
>(
  (
    {
      isLoading,
      isValidated,
      onDataChange,
      initialData,
      onSubmit,
    },
    ref,
  ) => {
    const isEditMode = !!initialData;

    const form = useForm<SalaForm>({
      resolver: zodResolver(SalaSchema),
      mode: 'onChange',
      defaultValues: {
        titulo: '',
        salaPrivada: false,
        senha: '',
        inativo: false,
      },
    });

    const salaPrivada = form.watch('salaPrivada');

    useEffect(() => {
      if (!salaPrivada) {
        form.setValue('senha', '');
      }
    }, [salaPrivada, form]);

    // ---------------------------------------------------------
    // 1) Inicializar quando houver dados de edição
    // ---------------------------------------------------------
    useEffect(() => {
      if (initialData) {
        form.reset({
          titulo: initialData.titulo,
          salaPrivada: !!initialData.senha,
          senha: initialData.senha ?? '',
          inativo: initialData.inativo ?? false,
        });
      } else {
        form.reset({
          titulo: '',
          salaPrivada: false,
          senha: '',
          inativo: false,
        });
      }
    }, [initialData, form]);

    // ---------------------------------------------------------
    // 2) Função que envia payload para o pai
    // ---------------------------------------------------------
    const enviarParaOPai = useCallback(
      (values: SalaForm) => {
        const valid = SalaSchema.safeParse(values);

        if (!valid.success) {
          isValidated(false);
          onDataChange({ values });
          return;
        }

        isValidated(true);

        if (isEditMode && initialData) {
          onDataChange({
            values: valid.data,
            editarData: converteFormParaEditarData(
              valid.data,
              initialData.id,
            ),
          });
        } else {
          onDataChange({
            values: valid.data,
            criarData: converteFormParaCriacaoData(
              valid.data,
            ),
          });
        }
      },
      [isEditMode, initialData, isValidated, onDataChange],
    );

    const debouncedEnviarParaOPai = useCallback(
      debounce((values: SalaForm) => {
        enviarParaOPai(values);
      }, 300),
      [enviarParaOPai],
    );

    useEffect(() => {
      const subscription = form.watch((values) => {
        debouncedEnviarParaOPai(values as SalaForm);
      });
      return () => subscription.unsubscribe();
    }, [form, debouncedEnviarParaOPai]);

    // Debounce utilitário
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function debounce<T extends (...args: any[]) => void>(
      fn: T,
      ms = 300,
    ) {
      let timer: ReturnType<typeof setTimeout>;
      return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
      };
    }

    // ---------------------------------------------------------
    // 4) Métodos expostos para o pai
    // ---------------------------------------------------------
    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset({
          titulo: '',
          salaPrivada: false,
          senha: '',
          inativo: false,
        });
      },
      submit: () => {
        form.handleSubmit((data) => onSubmit?.(data))();
      },
    }));

    // ---------------------------------------------------------
    // 5) Render dos campos
    // ---------------------------------------------------------
    const renderTitulo = ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<SalaForm, 'titulo'>;
      fieldState: ControllerFieldState;
    }) => (
      <FormItem>
        <FormControl>
          <TextInput
            label="Título"
            value={field.value}
            onChange={field.onChange}
            disabled={isLoading}
            placeholder="Informe um título"
            error={!!fieldState.error}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );

    const renderSenha = ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<SalaForm, 'senha'>;
      fieldState: ControllerFieldState;
    }) => (
      <FormItem>
        <FormControl>
          <PasswordInput
            value={field.value}
            onChange={field.onChange}
            name={field.name}
            disabled={isLoading}
            placeholder="Senha da sala"
            error={fieldState.error ? true : false}
            icon={
              <DoorClosedLocked className="h-5 w-5 text-gray-400" />
            }
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );

    return (
      <FormProvider {...form}>
        <form className="h-full w-full">
          <div className="grid w-full grid-cols-[150px_1fr_150px] gap-4">
            <div className="col-span-full">
              {!isEditMode && (
                <FormField
                  control={form.control}
                  name="salaPrivada"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex h-[42px] items-center gap-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm font-medium">
                            Sala Privada
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <div className="col-span-full">
              <FormField
                control={form.control}
                name="titulo"
                render={renderTitulo}
              />
            </div>
            <div className="col-span-full">
              {salaPrivada && (
                <FormField
                  control={form.control}
                  name="senha"
                  render={renderSenha}
                />
              )}
            </div>
            <div className="col-span-full">
              {isEditMode && (
                <FormField
                  control={form.control}
                  name="inativo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex h-[42px] items-center gap-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm font-medium">
                            Inativo
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    );
  },
);

FormularioSala.displayName = 'FormularioSala';
