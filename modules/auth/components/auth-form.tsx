import { Button } from '@/components/ui/button';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  AuthFormDataChange,
  LoginFormSchema,
  LoginFormValues,
  CadastroFormSchema,
  CadastroFormValues,
} from '../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordInput } from '@/components/inputs/input-password';
import { EmailInput } from '@/components/inputs/input-email';
import { TextInput } from '@/components/inputs/input-text';

interface LoginFormProps {
  isLoading: boolean;
  isValidated: (valid: boolean) => void;
  onDataChange: (data: AuthFormDataChange) => void;
  onSubmit?: (
    data: LoginFormValues | CadastroFormValues,
  ) => void;
  authType?: 'login' | 'cadastro';
}

const AuthForm = ({
  isLoading,
  isValidated,
  onDataChange,
  authType = 'login',
  onSubmit,
}: LoginFormProps) => {
  const onSubmitRef = useRef(onSubmit);

  type AuthFormValues = {
    nome?: string;
    email: string;
    senha: string;
    confirmarSenha?: string;
  };

  const defaultValues = useMemo<AuthFormValues>(
    () => ({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    }),
    [],
  );

  const form = useForm<AuthFormValues>({
    // escolhe o resolver conforme o tipo de formulário
    resolver: zodResolver(
      authType === 'cadastro'
        ? CadastroFormSchema
        : LoginFormSchema,
    ),
    defaultValues,
    mode: 'onChange',
  });

  const handleSubmit = useCallback(
    (data: AuthFormValues) => {
      onSubmitRef.current?.(data as LoginFormValues);
    },
    [],
  );

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // reset quando trocar entre login/cadastro
  useEffect(() => {
    form.reset(defaultValues);
  }, [authType, form, defaultValues]);

  // envia os valores atuais para o pai sempre que mudarem
  useEffect(() => {
    const subscription = form.watch((valores) => {
      if (authType === 'cadastro') {
        onDataChange({
          cadastro: {
            nome: valores.nome ?? '',
            email: valores.email ?? '',
            senha: valores.senha ?? '',
            confirmarSenha: valores.confirmarSenha ?? '',
          },
        });
      } else {
        onDataChange({
          login: {
            email: valores.email ?? '',
            senha: valores.senha ?? '',
          },
        });
      }
    });

    return () => {
      // watch pode retornar função de unsubscribe ou um objeto com unsubscribe
      if (!subscription) return;
      // subscription pode ser função
      const sub: unknown = subscription;
      if (typeof sub === 'function') (sub as () => void)();
      if (
        sub &&
        typeof (sub as { unsubscribe?: unknown })
          .unsubscribe === 'function'
      ) {
        (sub as { unsubscribe: () => void }).unsubscribe();
      }
    };
  }, [form, authType, onDataChange]);

  // comunica validade para o pai
  useEffect(() => {
    isValidated(form.formState.isValid);
  }, [form.formState.isValid, isValidated]);

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {authType === 'cadastro' && (
          <div className="space-y-2">
            <TextInput
              id="nome"
              name="nome"
              placeholder="Seu nome"
              label="Nome"
              value={form.watch('nome') ?? ''}
              onChange={(e) =>
                form.setValue('nome', e.target.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <EmailInput
            id="email"
            name="email"
            placeholder="seu@email.com"
            label="Email"
            value={form.watch('email') ?? ''}
            onChange={(e) =>
              form.setValue('email', e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <PasswordInput
            id="senha"
            name="senha"
            placeholder="Sua senha"
            label="Senha"
            value={form.watch('senha') ?? ''}
            onChange={(e) =>
              form.setValue('senha', e.target.value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </div>

        {authType === 'cadastro' && (
          <div className="space-y-2">
            <PasswordInput
              id="confirmarSenha"
              name="confirmarSenha"
              placeholder="Confirme sua senha"
              label="Confirmar Senha"
              value={form.watch('confirmarSenha') ?? ''}
              onChange={(e) =>
                form.setValue(
                  'confirmarSenha',
                  e.target.value,
                  {
                    shouldValidate: true,
                    shouldDirty: true,
                  },
                )
              }
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !form.formState.isValid}
          className="w-full"
        >
          {authType === 'cadastro'
            ? 'Criar conta'
            : 'Entrar'}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AuthForm;
