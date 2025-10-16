'use client';
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
} from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { TextInput } from '@/components/inputs/input-text';
import { Option } from '@/components/inputs/input-multi-command';
import {
  convertCurrentDataToForm,
  convertFormToCreateData,
  convertFormToEditData,
  CurrentProjetoData,
  ProjetoFormDataChange,
  ProjetoFormSchema,
  ProjetoFormValues,
} from '@/modules/projetos/meus-projetos/schema';
import { ComboBoxInput } from '@/components/inputs/input-combobox';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { RiAdminFill } from 'react-icons/ri';
export interface ProjetoFormRef {
  reset: () => void;
  submit: () => void;
}

interface ProjetoFormProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: ProjetoFormDataChange) => void;
  initialData?: CurrentProjetoData;
  onSubmit?: (data: ProjetoFormValues) => void;
  equipes: Option[];
  pessoas: Option[];
  onEquipeChange: (equipeId: string) => void;
}

const ProjetoForm = forwardRef<
  ProjetoFormRef,
  ProjetoFormProps
>(
  (
    {
      isLoading,
      isValidated,
      onDataChange,
      initialData,
      onSubmit,
      equipes,
      pessoas,
      onEquipeChange,
    },
    ref,
  ) => {
    const isEditMode = !!initialData;

    // Usar useRef para manter uma referência estável dos dados iniciais
    const initialDataRef = useRef<
      CurrentProjetoData | undefined
    >(initialData);

    const form = useForm<ProjetoFormValues>({
      resolver: zodResolver(ProjetoFormSchema) as any,
      defaultValues: {
        nome: '',
        inativo: false,
        equipeId: '',
        gerenteId: '',
      },
      mode: 'onChange',
    });

    // Atualizar as referências e valores iniciais quando initialData mudar
    useEffect(() => {
      if (initialData) {
        initialDataRef.current = initialData;
        // Define os valores do formulário com os dados iniciais
        form.reset({
          nome: initialData.nome,
          inativo: initialData.inativo,
          equipeId: initialData.equipeId,
          gerenteId: initialData.gerenteId,
        });
      }
    }, [initialData, form]);

    // Função para atualizar os dados no pai
    const atualizarDadosNoPai = useCallback(() => {
      const formValues = form.getValues();
      const result =
        ProjetoFormSchema.safeParse(formValues);

      if (!result.success) {
        isValidated(false);
        onDataChange({ values: formValues });
        return;
      }

      isValidated(true);
      const validatedValues = result.data;

      if (isEditMode && initialDataRef.current) {
        const payload: ProjetoFormDataChange = {
          values: validatedValues,
          editData: convertFormToEditData(
            validatedValues,
            initialDataRef.current.id,
          ),
        };

        onDataChange(payload);
      } else {
        const payload: ProjetoFormDataChange = {
          values: validatedValues,
          createData:
            convertFormToCreateData(validatedValues),
        };

        onDataChange(payload);
      }
    }, [form, isEditMode, isValidated, onDataChange]);

    // Converter dados da tabela para valores do formulário
    useEffect(() => {
      if (initialData) {
        const formValues =
          convertCurrentDataToForm(initialData);

        form.reset(formValues);
        isValidated(true);

        // Atualizar referências
        initialDataRef.current = initialData;
      }
    }, [initialData, form, isValidated]);

    // Atualizar validação e dados ao mudar o formulário
    useEffect(() => {
      const subscription = form.watch(() => {
        atualizarDadosNoPai();
      });

      return () => subscription.unsubscribe();
    }, [form, atualizarDadosNoPai]);

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset({
          nome: '',
          inativo: false,
          equipeId: '',
          gerenteId: '',
        });
        initialDataRef.current = undefined;
      },
      submit: () => {
        form.handleSubmit((data) => {
          onSubmit?.(data);
        })();
      },
    }));

    // Submit handler
    const handleSubmit = (data: ProjetoFormValues) => {
      onSubmit?.(data);
    };

    return (
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="h-full w-full"
        >
          <div className="grid w-full grid-cols-[150px_1fr_150px] gap-4">
            {/* Nome - ocupa linha inteira */}
            <div className="col-span-full">
              <FormField
                control={form.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <TextInput
                        label="Nome"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                        name={field.name}
                        placeholder="Digite o nome do projeto"
                        error={
                          fieldState.error ? true : false
                        }
                        autoFocus={false}
                      />
                    </FormControl>
                    <FormMessage className="text-wrap" />
                  </FormItem>
                )}
              />
            </div>

            {/* Equipe - ocupa linha inteira */}
            <div className="col-span-full">
              <FormField
                control={form.control}
                name="equipeId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBoxInput
                        name="equipeId"
                        label="Equipe"
                        placeholder="Selecione a equipe"
                        options={equipes}
                        value={
                          initialData?.equipeId
                            ? initialData.equipeId
                            : field.value
                        }
                        onChange={(value) => {
                          // Garante que o valor seja '' quando o campo for limpo
                          const newValue = value || '';
                          field.onChange(newValue);
                          console.log(
                            initialData?.equipeId,
                          );
                          console.log(field.value);
                          // Só chama onEquipeChange se houver um valor válido
                          if (
                            newValue !== '' &&
                            newValue !==
                              initialData?.equipeId
                          ) {
                            onEquipeChange(newValue);
                          }
                        }}
                        icone={HiOutlineUserGroup}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gerente - ocupa linha inteira */}
            <div className="col-span-full">
              <FormField
                control={form.control}
                name="gerenteId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ComboBoxInput
                        name="gerenteId"
                        label="Gerente do Projeto"
                        placeholder="Selecione o gerente"
                        options={pessoas}
                        value={
                          initialData?.gerenteId
                            ? initialData.gerenteId
                            : field.value
                        }
                        onChange={(value) =>
                          field.onChange(value)
                        }
                        icone={RiAdminFill}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status - ocupa meia linha no final */}
            {isEditMode && (
              <div className="col-span-1 col-start-1">
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
                            id="inativo"
                          />
                          <label
                            htmlFor="inativo"
                            className="text-sm font-medium"
                          >
                            Inativo
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    );
  },
);

ProjetoForm.displayName = 'ProjetoForm';
export { ProjetoForm };
