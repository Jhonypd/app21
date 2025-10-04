'use client';
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { FaUserShield } from 'react-icons/fa6';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  equipeFormSchema,
  EquipeFormValues,
  CurrentEquipeData,
  convertFormToCreateData,
  convertFormToEditData,
  convertCurrentDataToForm,
  EquipeFormDataChange,
} from './schema';
import { TextInput } from '@/components/inputs/input-text';
import {
  MultiSelectCommand,
  Option,
} from '@/components/inputs/input-multi-command';
import { MultiComboBoxInput } from '@/components/inputs/input-multi-combobox';

export interface EquipeFormRef {
  reset: () => void;
  submit: () => void;
}

interface EquipeFormProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: EquipeFormDataChange) => void;
  initialData?: CurrentEquipeData;
  onSubmit?: (data: EquipeFormValues) => void;
  campoPesquisaUsuario?: (
    texto: string,
  ) => Promise<Option[]>;
}

// Função para calcular diferenças entre arrays
const calcularDiferencas = (
  atual: Option[],
  novo: Option[],
): { adicionar: string[]; remover: string[] } => {
  const idsAtual = atual.map((item) => item.id || item.id);
  const idsNovo = novo.map((item) => item.id || item.id);

  const adicionar = idsNovo.filter(
    (id) => !idsAtual.includes(id),
  );
  const remover = idsAtual.filter(
    (id) => !idsNovo.includes(id),
  );

  return { adicionar, remover };
};

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
      campoPesquisaUsuario,
    },
    ref,
  ) => {
    const isEditMode = !!initialData;
    const [selecionados, setSelecionados] = useState<
      Option[]
    >([]);

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
        setSelecionados(initialData.membrosEquipe || []);
        form.reset(formValues);
        isValidated(true);
      }
    }, [initialData, form, isValidated]);

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

        if (isEditMode && initialData) {
          // Calcular diferenças para projetos

          // Calcular diferenças para membros
          const {
            adicionar: membrosAdicionar,
            remover: membrosRemover,
          } = calcularDiferencas(
            initialData.membrosEquipe || [],
            selecionados,
          );

          const payload: EquipeFormDataChange = {
            values: formValues,
            editData: convertFormToEditData(
              formValues,
              initialData.id,
              membrosAdicionar,
              membrosRemover,
            ),
          };

          onDataChange(payload);
        } else {
          // Modo criação
          const payload: EquipeFormDataChange = {
            values: formValues,
            createData: convertFormToCreateData(
              formValues,
              selecionados.map((m) => m.id),
            ),
          };

          onDataChange(payload);
        }
      });

      return () => subscription.unsubscribe();
    }, [
      form,
      isValidated,
      onDataChange,
      isEditMode,
      initialData,
      selecionados,
    ]);

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset({
          nome: '',
          inativo: false,
        });
        setSelecionados([]);
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

    const admAtual = initialData?.membrosEquipe.filter(
      (membro) => membro.administrador === true,
    );

    return (
      <div className="h-full px-2">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-4 py-2"
          >
            {/* Nome da Equipe */}
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
                      placeholder="Digite o nome da equipe"
                      error={
                        fieldState.error ? true : false
                      }
                      autoFocus={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Projetos */}
            <FormItem>
              <FormControl>
                <MultiComboBoxInput
                  value={[]}
                  onChange={() => {}}
                  options={
                    initialData?.membrosEquipe &&
                    initialData.membrosEquipe.length > 0
                      ? initialData.membrosEquipe.map(
                          (p) => ({
                            id: p.id,
                            nome: p.nome,
                            active: !p.inativo,
                          }),
                        )
                      : []
                  }
                  label="Integrantes atuais"
                  placeholder="Integrantes atuais"
                  icone={FaUserShield}
                  disabled={isLoading}
                  error={!!form.formState.errors}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Membros da Equipe */}
            <FormItem>
              <FormControl>
                <MultiSelectCommand
                  value={selecionados}
                  onChange={setSelecionados}
                  onSearch={campoPesquisaUsuario}
                  placeholder="Pesquisar usuário"
                  label="Integrantes da equipe"
                />
              </FormControl>
            </FormItem>

            {isEditMode && (
              <FormField
                control={form.control}
                name="inativo"
                render={({ field }) => (
                  <FormItem className="col-span-full sm:col-span-1">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="inativo"
                        />
                        <label htmlFor="inativo">
                          Inativo
                        </label>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Informações de contexto */}
            <div className="bg-muted/50 grid rounded-lg p-4">
              <h4 className="mb-2 text-sm font-medium">
                Informações
              </h4>
              <div className="text-muted-foreground w-full space-y-1 text-sm text-wrap">
                <p className="w-full text-wrap">
                  • Equipes inativas não aparecerão para
                  novos projetos
                </p>
                <p className="w-full text-wrap">
                  • Membros podem ser adicionados após a
                  criação
                </p>
                <p className="w-full text-wrap">
                  • O nome da equipe deve ser único
                </p>
                <p className="w-full text-wrap">
                  • A equipe pode ser transferida apenas
                  para usuários previamente integrados
                </p>
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
