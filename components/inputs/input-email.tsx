import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
}

export const useEmailValidation = (
  initialValue: string = '',
) => {
  const [email, setEmail] = useState(initialValue);

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [],
  );

  const resetEmail = useCallback(() => {
    setEmail('');
  }, []);

  return {
    email,
    setEmail,
    handleEmailChange,
    resetEmail,
  };
};

export const EmailInput: React.FC<EmailInputProps> = ({
  id = 'email',
  name = 'email',
  placeholder = 'email@email.com',
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Email',
  error = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Processa o input removendo espaços e convertendo para lowercase
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove todos os espaços
      inputValue = inputValue.replace(/\s/g, '');

      // Converte para lowercase para padronizar
      inputValue = inputValue.toLowerCase();

      // Cria evento sintético com o valor processado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: inputValue,
        },
      };

      // Chama o onChange original
      onChange(syntheticEvent);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Determina se o label deve estar no topo
  const shouldLabelBeOnTop = value.length > 0 || isFocused;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        {/* Input */}
        <Input
          id={id}
          name={name}
          type="email"
          placeholder={
            shouldLabelBeOnTop ? placeholder : ''
          }
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="email"
          spellCheck={false}
          className={`peer h-auto rounded-md bg-transparent py-3 pr-4 pl-11 text-gray-600 transition-colors duration-200 focus:ring-0 focus:outline-none dark:bg-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200'
          } ${disabled && 'cursor-not-allowed'} ${className}`.trim()}
        />

        {/* Ícone de email */}
        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <Mail className={`h-5 w-5 text-gray-400`} />
        </div>

        {/* Label flutuante */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-10 cursor-text transition-all duration-200 ${
            shouldLabelBeOnTop
              ? 'bg-background -top-2 z-10 px-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
          } ${
            error && shouldLabelBeOnTop
              ? 'text-red-500'
              : shouldLabelBeOnTop
                ? 'text-gray-500'
                : 'text-gray-600'
          }`.trim()}
        >
          {label}
        </label>
      </div>
    </div>
  );
};
