'use client';
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
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
import {
  equipeFormSchema,
  EquipeFormValues,
  CurrentEquipeData,
  convertFormToCreateData,
  convertFormToEditData,
  convertCurrentDataToForm,
  EquipeFormDataChange,
} from '../../modules/equipes/minha-equipes/schema';
import { TextInput } from '@/components/inputs/input-text';
import {
  MultiSelectCommand,
  Option,
} from '@/components/inputs/input-multi-command';

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
  const idsAtual = atual.map((item) => item.id);
  const idsNovo = novo.map((item) => item.id);

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

    // Usar useRef para manter uma referência estável dos dados iniciais
    const initialDataRef = useRef<
      CurrentEquipeData | undefined
    >(initialData);
    const membrosIniciaisRef = useRef<Option[]>([]);

    const form = useForm<EquipeFormValues>({
      resolver: zodResolver(equipeFormSchema) as any,
      defaultValues: {
        nome: '',
        inativo: false,
      },
      mode: 'onChange',
    });

    // Atualizar as referências quando initialData mudar
    useEffect(() => {
      if (initialData) {
        initialDataRef.current = initialData;
        membrosIniciaisRef.current =
          initialData.membrosEquipe || [];
      }
    }, [initialData]);

    // Função para atualizar os dados no pai
    const atualizarDadosNoPai = useCallback(() => {
      const formValues = form.getValues();
      const result = equipeFormSchema.safeParse(formValues);

      if (!result.success) {
        isValidated(false);
        onDataChange({ values: formValues });
        return;
      }

      isValidated(true);
      const validatedValues = result.data;

      if (isEditMode && initialDataRef.current) {
        // Usar a referência estável dos membros iniciais
        const membrosIniciais = membrosIniciaisRef.current;

        // Calcular diferenças para membros
        const {
          adicionar: membrosAdicionar,
          remover: membrosRemover,
        } = calcularDiferencas(
          membrosIniciais,
          selecionados,
        );

        const payload: EquipeFormDataChange = {
          values: validatedValues,
          editData: convertFormToEditData(
            validatedValues,
            initialDataRef.current.id,
            membrosAdicionar,
            membrosRemover,
          ),
        };

        onDataChange(payload);
      } else {
        // Modo criação
        const payload: EquipeFormDataChange = {
          values: validatedValues,
          createData: convertFormToCreateData(
            validatedValues,
            selecionados.map((m) => m.id),
          ),
        };

        onDataChange(payload);
      }
    }, [
      form,
      isEditMode,
      selecionados,
      isValidated,
      onDataChange,
    ]);

    // Handler para mudança de membros
    const handleMembrosChange = useCallback(
      (novosSelecionados: Option[]) => {
        setSelecionados(novosSelecionados);
      },
      [],
    );

    // Converter dados da tabela para valores do formulário
    useEffect(() => {
      if (initialData) {
        const formValues =
          convertCurrentDataToForm(initialData);
        const membrosIniciais =
          initialData.membrosEquipe || [];

        setSelecionados(membrosIniciais);
        form.reset(formValues);
        isValidated(true);

        // Atualizar referências
        initialDataRef.current = initialData;
        membrosIniciaisRef.current = membrosIniciais;
      }
    }, [initialData, form, isValidated]);

    // Atualizar dados no pai quando selecionados mudarem
    useEffect(() => {
      atualizarDadosNoPai();
    }, [selecionados, atualizarDadosNoPai]);

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
        });
        setSelecionados([]);
        initialDataRef.current = undefined;
        membrosIniciaisRef.current = [];
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

            {/* Membros da Equipe */}
            <FormItem>
              <FormControl>
                <MultiSelectCommand
                  value={selecionados}
                  onChange={handleMembrosChange}
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
                  • Apenas o administrador da equipe pode
                  realizar alterações
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
