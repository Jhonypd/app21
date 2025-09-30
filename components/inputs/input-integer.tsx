import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowUp10 } from 'lucide-react';

interface IntegerInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  maxValue?: number;
}

const formatIntegerInput = (
  value: string,
  maxValue?: number,
): string => {
  let number = value.replace(/\D/g, '');
  if (maxValue !== undefined && Number(number) > maxValue) {
    number = maxValue.toString();
  }
  return number;
};

export const useIntegerInput = (
  initialValue: string = '',
) => {
  const [integer, setInteger] = useState(initialValue);

  const handleIntegerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInteger(e.target.value);
    },
    [],
  );

  const resetInteger = useCallback(() => {
    setInteger('');
  }, []);

  return {
    integer,
    setInteger,
    handleIntegerChange,
    resetInteger,
  };
};

export const IntegerInput: React.FC<IntegerInputProps> = ({
  id = 'integer',
  name = 'integer',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  label,
  error = false,
  maxValue,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { setInteger } = useIntegerInput(value.toString());

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatIntegerInput(
        rawValue,
        maxValue,
      );

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
        },
      };

      onChange(syntheticEvent);
      setInteger(formattedValue);
    },
    [onChange, maxValue, setInteger],
  );

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Input
          id={id}
          name={name}
          type="text"
          placeholder={
            value.toString().length > 0 || isFocused
              ? placeholder
              : ''
          }
          value={value.toString()}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className={`peer h-auto rounded-md bg-inherit py-3 pr-4 pl-11 transition-colors duration-200 focus:ring-0 focus:outline-none focus-visible:ring-gray-300 dark:bg-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200'
          } ${disabled ? 'bg-background cursor-not-allowed' : 'bg-background'} ${className}`}
        />

        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <ArrowUp10 className="h-5 w-5 text-gray-400" />
        </div>

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-10 cursor-text transition-all duration-200 ${
            value.toString().length > 0 || isFocused
              ? 'bg-background -top-2 z-10 px-1 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
          } ${
            error &&
            (value.toString().length > 0 || isFocused)
              ? 'text-red-500'
              : value.toString().length > 0 || isFocused
                ? 'text-gray-500'
                : 'text-gray-600'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
};
