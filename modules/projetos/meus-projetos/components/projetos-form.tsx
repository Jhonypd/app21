'use client';
import React, {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
  useMemo,
  memo,
  useState,
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

const ProjetoForm = memo(
  forwardRef<ProjetoFormRef, ProjetoFormProps>(
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
      const [isInitialized, setIsInitialized] =
        useState(false);
      const [isWatching, setIsWatching] = useState(false);

      // Usar useRef para manter referências estáveis
      const initialDataRef = useRef<
        CurrentProjetoData | undefined
      >(initialData);
      const isValidatedRef = useRef(isValidated);
      const onDataChangeRef = useRef(onDataChange);
      const onSubmitRef = useRef(onSubmit);
      const onEquipeChangeRef = useRef(onEquipeChange);

      useEffect(() => {
        isValidatedRef.current = isValidated;
      }, [isValidated]);

      useEffect(() => {
        onDataChangeRef.current = onDataChange;
      }, [onDataChange]);

      useEffect(() => {
        onSubmitRef.current = onSubmit;
      }, [onSubmit]);

      useEffect(() => {
        onEquipeChangeRef.current = onEquipeChange;
      }, [onEquipeChange]);

      const defaultValues = useMemo(
        (): ProjetoFormValues => ({
          nome: '',
          inativo: false,
          equipeId: '',
          gerenteId: '',
        }),
        [],
      );

      const form = useForm<ProjetoFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(ProjetoFormSchema) as any,
        defaultValues,
        mode: 'onChange',
      });

      // Efeito ÚNICO para inicialização - executado apenas uma vez
      useEffect(() => {
        if (initialData && !isInitialized) {
          console.log(
            'Preenchendo formulário com:',
            initialData,
          );

          setIsWatching(false);

          const formValues = {
            nome: initialData.nome,
            inativo: initialData.inativo,
            equipeId: initialData.equipeId,
            gerenteId: initialData.gerenteId,
          };

          // Usar setTimeout para garantir que o reset aconteça após a renderização atual
          setTimeout(() => {
            form.reset(formValues);
            initialDataRef.current = initialData;
            setIsInitialized(true);

            // Reativar o watch após um delay maior
            setTimeout(() => {
              setIsWatching(true);
              // Disparar validação inicial após preenchimento
              atualizarDadosNoPai();
            }, 300);
          }, 0);
        } // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [initialData, isInitialized, form]);

      // Resetar flag de inicialização quando initialData mudar para undefined (modo criação)
      useEffect(() => {
        if (!initialData) {
          setIsInitialized(false);
        }
      }, [initialData]);

      // Função memoizada para atualizar dados no pai
      const atualizarDadosNoPai = useCallback(() => {
        const formValues = form.getValues();
        const result =
          ProjetoFormSchema.safeParse(formValues);

        if (!result.success) {
          isValidatedRef.current(false);
          onDataChangeRef.current({ values: formValues });
          return;
        }

        isValidatedRef.current(true);
        const validatedValues = result.data;

        if (isEditMode && initialDataRef.current) {
          const payload: ProjetoFormDataChange = {
            values: validatedValues,
            editData: convertFormToEditData(
              validatedValues,
              initialDataRef.current.id,
            ),
          };
          onDataChangeRef.current(payload);
        } else {
          const payload: ProjetoFormDataChange = {
            values: validatedValues,
            createData:
              convertFormToCreateData(validatedValues),
          };
          onDataChangeRef.current(payload);
        }
      }, [form, isEditMode]);

      // Debounced watch para evitar muitas atualizações - CORREÇÃO FINAL
      useEffect(() => {
        if (!isInitialized || !isWatching) return;

        let timeoutId: NodeJS.Timeout;
        let isUpdating = false;

        const subscription = form.watch(() => {
          // Só atualizar se o watch estiver ativo e não estiver em processo de atualização
          if (!isWatching || isUpdating) return;

          // Clear previous timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
          }

          // Debounce para agrupar mudanças rápidas
          timeoutId = setTimeout(() => {
            isUpdating = true;
            atualizarDadosNoPai();
            // Resetar flag após um pequeno delay
            setTimeout(() => {
              isUpdating = false;
            }, 50);
          }, 250);
        });

        return () => {
          subscription.unsubscribe();
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      }, [
        form,
        atualizarDadosNoPai,
        isInitialized,
        isWatching,
      ]);

      // Expor métodos via ref
      useImperativeHandle(
        ref,
        () => ({
          reset: () => {
            setIsWatching(false);
            form.reset(defaultValues);
            initialDataRef.current = undefined;
            setIsInitialized(false);
            setTimeout(() => setIsWatching(true), 200);
          },
          submit: () => {
            form.handleSubmit((data) => {
              onSubmitRef.current?.(data);
            })();
          },
        }),
        [form, defaultValues],
      );

      // Submit handler memoizado
      const handleSubmit = useCallback(
        (data: ProjetoFormValues) => {
          onSubmitRef.current?.(data);
        },
        [],
      );

      const handleEquipeChange = useCallback(
        (value: string) => {
          form.setValue('equipeId', value || '', {
            shouldValidate: true,
          });

          // Se estamos limpando o campo (value vazio), também limpar o gerente
          if (!value || value === '') {
            form.setValue('gerenteId', '', {
              shouldValidate: true,
            });
          } else {
            // Chamar onEquipeChange para buscar membros da equipe
            onEquipeChangeRef.current(value);
          }

          setTimeout(() => {
            form.trigger(['equipeId', 'gerenteId']);
          }, 100);
        },
        [form],
      );

      const handleGerenteChange = useCallback(
        (value: string) => {
          const currentValue = form.getValues('gerenteId');
          // Só atualizar se o valor realmente mudou
          if (currentValue !== value) {
            form.setValue('gerenteId', value || '', {
              shouldValidate: true,
            });
          }
        },
        [form],
      );

      const renderNomeField = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ field, fieldState }: any) => (
          <FormItem>
            <FormControl>
              <TextInput
                label="Nome"
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                name={field.name}
                placeholder="Digite o nome do projeto"
                error={fieldState.error ? true : false}
                autoFocus={false}
              />
            </FormControl>
            <FormMessage className="text-wrap" />
          </FormItem>
        ),
        [isLoading],
      );

      const renderEquipeField = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ field, fieldState }: any) => (
          <FormItem>
            <FormControl>
              <ComboBoxInput
                name="equipeId"
                label="Equipe"
                placeholder="Selecione a equipe"
                options={equipes}
                value={field.value}
                onChange={handleEquipeChange}
                icone={HiOutlineUserGroup}
                error={fieldState.error ? true : false}
              />
            </FormControl>
            <FormMessage className="text-wrap" />
          </FormItem>
        ),
        [equipes, handleEquipeChange],
      );

      const renderGerenteField = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ field }: any) => (
          <FormItem>
            <FormControl>
              <ComboBoxInput
                name="gerenteId"
                label="Gerente do Projeto"
                placeholder="Selecione o gerente"
                options={pessoas}
                value={field.value}
                onChange={handleGerenteChange}
                icone={RiAdminFill}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        ),
        [pessoas, handleGerenteChange],
      );

      const renderStatusField = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ field }: any) => (
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
        ),
        [],
      );

      return (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="h-full w-full"
          >
            <div className="grid w-full grid-cols-[150px_1fr_150px] gap-4">
              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="nome"
                  render={renderNomeField}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="equipeId"
                  render={renderEquipeField}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="gerenteId"
                  render={renderGerenteField}
                />
              </div>

              {isEditMode && (
                <div className="col-span-1 col-start-1">
                  <FormField
                    control={form.control}
                    name="inativo"
                    render={renderStatusField}
                  />
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      );
    },
  ),
);

ProjetoForm.displayName = 'ProjetoForm';
export { ProjetoForm };
