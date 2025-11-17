import React, { useState, useCallback } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, UserLock, EyeOff } from 'lucide-react';

interface PasswordInputProps {
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
  icon?: React.ReactNode;
}

export const usePasswordValidation = (
  initialValue: string = '',
) => {
  const [password, setPassword] = useState(initialValue);

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    [],
  );

  const resetPassword = useCallback(() => {
    setPassword('');
  }, []);

  return {
    password,
    setPassword,
    handlePasswordChange,
    resetPassword,
  };
};

export const PasswordInput: React.FC<
  PasswordInputProps
> = ({
  id = 'password',
  name = 'password',
  placeholder = '******',
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Senha',
  error = false,
  icon = <UserLock className="h-5 w-5 text-gray-400" />,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] =
    useState<boolean>(false);

  const togglePassword = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e);
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
          type={isPasswordVisible ? 'text' : 'password'}
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
          autoComplete="off"
          spellCheck={false}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
          }}
          className={`peer h-auto rounded-md bg-transparent py-3 pr-4 pl-11 text-gray-600 transition-colors duration-200 focus:ring-0 focus:outline-none dark:bg-none [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden ${
            error
              ? 'border-red-500 focus:border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/80'
              : 'border-gray-300 focus:border-blue-500 focus-visible:border-gray-300 focus-visible:ring-gray-200'
          } ${disabled && 'cursor-not-allowed'} ${className}`.trim()}
        />

        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePassword}
            className="hover:text-primary absolute top-1/2 right-1 -translate-y-1/2 transform cursor-pointer rounded-full opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {isPasswordVisible ? (
              <EyeOff
                size={18}
                className="hover:text-primary"
              />
            ) : (
              <Eye
                size={18}
                className="hover:text-primary"
              />
            )}
          </Button>
        )}

        {/* Ícone de email */}
        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          {icon}
        </div>

        {/* Label flutuante */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-10 cursor-text transition-all duration-200 ${
            shouldLabelBeOnTop
              ? '-top-2 z-10 bg-slate-900 px-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm font-medium'
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
