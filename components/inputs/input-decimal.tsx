import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { DecimalsArrowRight } from 'lucide-react';

interface DecimalsInputProps {
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

const formatNumberInput = (
  value: string,
  typeNumber: 'decimal',
  maxValue?: number,
): string => {
  const onlyNumbers = value.replace(/\D/g, '');

  if (!onlyNumbers) return '0,00';

  let number = parseFloat(onlyNumbers) / 100;

  if (maxValue !== undefined && number > maxValue) {
    number = maxValue;
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const useDecimalInput = (
  initialValue: string = '',
) => {
  const [decimal, setDecimal] = useState(initialValue);

  const handleDecimalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDecimal(e.target.value);
    },
    [],
  );

  const resetDecimal = useCallback(() => {
    setDecimal('');
  }, []);

  return {
    decimal,
    setDecimal,
    handleDecimalChange,
    resetDecimal,
  };
};

export const DecimalInput: React.FC<DecimalsInputProps> = ({
  id = 'decimal',
  name = 'decimal',
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatNumberInput(
        rawValue,
        'decimal',
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
    },
    [onChange, maxValue],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const shouldLabelBeOnTop =
    value.toString().length > 0 || isFocused;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Input
          id={id}
          name={name}
          type="text"
          placeholder={
            shouldLabelBeOnTop ? placeholder : ''
          }
          value={value.toString()}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
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
          <DecimalsArrowRight className="h-5 w-5 text-gray-400" />
        </div>

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
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
};
