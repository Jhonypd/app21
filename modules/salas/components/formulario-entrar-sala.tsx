'use client';
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
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

import { TextInput } from '@/components/inputs/input-text';
import { PasswordInput } from '@/components/inputs/input-password';
import { DoorClosedLocked } from 'lucide-react';

import { SalaEntrarSchema } from '@/modules/salas/schema';

import { FormularioEntrarSalaData } from '../interfaces';
import { SalaEntrarForm } from '../types';

export interface FormularioEntrarSalaRef {
  reset: () => void;
  submit: () => void;
}

interface FormularioEntrarSalaProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: FormularioEntrarSalaData) => void;
  onSubmit?: (data: SalaEntrarForm) => void;

  codigo: string; // setado pelo pai e adicionado diretamente ao campo codigo do formulario e desabilitado
  salaPrivada: boolean; // setado pelo pai e adicionado diretamente ao campo salaPrivada do formulario
  proprietario: boolean; // se o usuario é o proprietario da sala a senha não deve ser exigida
}
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
export const FormularioEntrarSala = forwardRef<
  FormularioEntrarSalaRef,
  FormularioEntrarSalaProps
>(
  (
    {
      isLoading,
      isValidated,
      onDataChange,
      onSubmit,
      codigo,
      salaPrivada,
      proprietario,
    },
    ref,
  ) => {
    const form = useForm<SalaEntrarForm>({
      resolver: zodResolver(SalaEntrarSchema),
      mode: 'onChange',
      defaultValues: {
        codigo: '',
        salaPrivada: false,
        senha: '',
        proprietario: false,
      },
    });

    /** -----------------------------------------
     * 2) Envia dados para o pai ao alterar
     ------------------------------------------ */
    const enviarParaOPai = useCallback(
      (values: SalaEntrarForm) => {
        const valid = SalaEntrarSchema.safeParse(values);

        if (!valid.success) {
          isValidated(false);
          onDataChange({
            salaPrivada: values.salaPrivada,
            codigo: values.codigo,
            senha: values.senha,
          });
          return;
        }

        isValidated(true);

        onDataChange({
          salaPrivada: values.salaPrivada,
          codigo: values.codigo,
          senha: values.senha,
        });
      },
      [isValidated, onDataChange],
    );

    /** -----------------------------------------
     * 1) Recebe valores do pai e injeta no form
     ------------------------------------------ */
    useEffect(() => {
      const valoresReset = {
        codigo: codigo ?? '',
        salaPrivada: salaPrivada ?? false,
        senha: '',
        proprietario: proprietario ?? false,
      };

      form.reset(valoresReset);

      const valoresAposReset = form.getValues();

      // Se for proprietário e código estiver preenchido, validar imediatamente
      if (
        proprietario &&
        codigo &&
        codigo.trim().length > 0
      ) {
        // Validar imediatamente com os valores após reset
        enviarParaOPai(valoresAposReset);
      } else {
        // Mesmo assim, validar para atualizar o estado
        enviarParaOPai(valoresAposReset);
      }
    }, [
      codigo,
      salaPrivada,
      proprietario,
      form,
      enviarParaOPai,
    ]);

    const debouncedEnviarRef = useRef(
      debounce((values: SalaEntrarForm) => {
        enviarParaOPai(values);
      }, 300),
    );

    useEffect(() => {
      debouncedEnviarRef.current = debounce(
        (values: SalaEntrarForm) => {
          enviarParaOPai(values);
        },
        300,
      );
    }, [enviarParaOPai]);

    const debouncedEnviar = useCallback(
      (values: SalaEntrarForm) => {
        // Se for proprietário e código estiver preenchido, validar imediatamente
        if (
          values.proprietario &&
          values.codigo.trim().length > 0
        ) {
          enviarParaOPai(values);
        } else {
          debouncedEnviarRef.current(values);
        }
      },
      [enviarParaOPai],
    );

    useEffect(() => {
      const sub = form.watch((values) => {
        debouncedEnviar(values as SalaEntrarForm);
      });
      return () => sub.unsubscribe();
    }, [form, debouncedEnviar]);

    // Validação adicional quando proprietario ou codigo mudam
    useEffect(() => {
      const valores = form.getValues();

      if (
        proprietario &&
        codigo &&
        codigo.trim().length > 0
      ) {
        enviarParaOPai(valores);
      }
    }, [proprietario, codigo, form, enviarParaOPai]);

    /** -----------------------------------------
     * 3) Métodos expostos ao pai
     ------------------------------------------ */
    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset({
          codigo: codigo ?? '',
          salaPrivada: salaPrivada ?? false,
          proprietario: proprietario ?? false,
          senha: '',
        });
      },
      submit: () => {
        form.handleSubmit((data) => onSubmit?.(data))();
      },
    }));

    /** -----------------------------------------
     * 4) Render 
     ------------------------------------------ */
    const renderTitulo = ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<
        SalaEntrarForm,
        'codigo'
      >;
      fieldState: ControllerFieldState;
    }) => (
      <FormItem>
        <FormControl>
          <TextInput
            label="Código da Sala"
            value={field.value}
            onChange={field.onChange}
            disabled={field.value.length > 0 && true}
            placeholder="Informe um código da sala"
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
      field: ControllerRenderProps<SalaEntrarForm, 'senha'>;
      fieldState: ControllerFieldState;
    }) => (
      <FormItem>
        <FormControl>
          <PasswordInput
            value={field.value ?? ''}
            onChange={field.onChange}
            name={field.name}
            disabled={isLoading}
            placeholder="Senha da sala"
            error={!!fieldState.error}
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
              <FormField
                control={form.control}
                name="codigo"
                render={renderTitulo}
              />
            </div>

            <div className="col-span-full">
              {form.watch('salaPrivada') &&
                !proprietario && (
                  <FormField
                    control={form.control}
                    name="senha"
                    render={renderSenha}
                  />
                )}
            </div>
          </div>
        </form>
      </FormProvider>
    );
  },
);

FormularioEntrarSala.displayName = 'FormularioEntrarSala';
