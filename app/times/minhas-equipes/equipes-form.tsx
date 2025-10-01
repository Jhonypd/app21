'use client';
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  equipeFormSchema,
  EquipeFormValues,
  CurrentEquipeData,
  CreateEquipeData,
  EditEquipeData,
  convertFormToCreateData,
  convertFormToEditData,
  convertCurrentDataToForm,
} from './schema';

export interface EquipeFormRef {
  reset: () => void;
  submit: () => void;
}

interface EquipeFormProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: {
    values: EquipeFormValues;
    createData?: CreateEquipeData;
    editData?: EditEquipeData;
  }) => void;
  initialData?: CurrentEquipeData;
  onSubmit?: (data: EquipeFormValues) => void;
}

const EquipeForm = forwardRef<
  EquipeFormRef,
  EquipeFormProps
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

    const form = useForm<EquipeFormValues>({
      resolver: zodResolver(equipeFormSchema) as any,
      defaultValues: {
        nome: '',
        inativo: false,
      },
      mode: 'onChange',
    });

    // Converter dados da tabela para valores do formulário
    useEffect(() => {
      if (initialData) {
        const formValues =
          convertCurrentDataToForm(initialData);
        form.reset(formValues);
      }
    }, [initialData, form]);

    // Atualizar validação e dados ao mudar o formulário
    useEffect(() => {
      const subscription = form.watch((values) => {
        const result = equipeFormSchema.safeParse(values);

        if (!result.success) {
          isValidated(false);
          const currentValues = form.getValues();
          onDataChange({ values: currentValues });
          return;
        }

        isValidated(true);

        const formValues = result.data;

        const payload =
          isEditMode && initialData
            ? {
                values: formValues,
                editData: convertFormToEditData(
                  formValues,
                  initialData.id,
                ),
              }
            : {
                values: formValues,
                createData:
                  convertFormToCreateData(formValues),
              };

        onDataChange(payload);
      });

      return () => subscription.unsubscribe();
    }, [
      form,
      isValidated,
      onDataChange,
      isEditMode,
      initialData,
    ]);

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset({
          nome: '',
          inativo: false,
        });
      },
      submit: () => {
        form.handleSubmit((data) => {
          onSubmit?.(data);
        })();
      },
    }));

    // Submit handler
    const handleSubmit = (data: EquipeFormValues) => {
      onSubmit?.(data);
    };

    return (
      <div className="h-full px-2">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-6 py-2"
          >
            {/* Nome da Equipe */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da equipe"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      disabled={isLoading}
                      className={
                        fieldState.error
                          ? 'border-destructive'
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status (Inativo) */}

            {initialData?.id && (
              <FormField
                control={form.control}
                name="inativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Status
                      </FormLabel>
                      <div className="text-muted-foreground text-sm">
                        {field.value
                          ? 'Equipe inativa'
                          : 'Equipe ativa'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Informações de contexto */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-2 text-sm font-medium">
                Informações
              </h4>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>
                  • Equipes inativas não aparecerão para
                  novos projetos
                </p>
                <p>
                  • Membros podem ser adicionados após a
                  criação
                </p>
                <p>• O nome da equipe deve ser único</p>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    );
  },
);

EquipeForm.displayName = 'EquipeForm';
export { EquipeForm };
