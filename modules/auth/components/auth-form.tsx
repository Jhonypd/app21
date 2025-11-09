'use client';

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
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

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

  const isDevelopment =
    process.env.NODE_ENV === 'development';

  const defaultValues = useMemo<AuthFormValues>(
    () => ({
      nome: '',
      email: isDevelopment ? 'jhony-16@live.com' : '',
      senha: isDevelopment ? '123456' : '',
      confirmarSenha: '',
    }),
    [isDevelopment],
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
        className="mt-2 space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {authType === 'cadastro' && (
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TextInput
                      id="nome"
                      label="Nome"
                      placeholder="Seu nome"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <EmailInput
                    id="email"
                    placeholder="seu@email.com"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    id="senha"
                    placeholder="Sua senha"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {authType === 'cadastro' && (
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="confirmarSenha"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      id="confirmarSenha"
                      placeholder="Confirme sua senha"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
