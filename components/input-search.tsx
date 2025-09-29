import { Input } from '@/components/ui/input';
import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';

export const useSearchInput = (
  initialValue: string = '',
) => {
  const [search, setSearch] = useState(initialValue);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  const resetSearch = useCallback(() => {
    setSearch('');
  }, []);

  return {
    search,
    setSearch,
    handleSearchChange,
    resetSearch,
  };
};

interface SearchInputProps {
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
  maxLength?: number;
  minLength?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  id = 'search',
  name = 'search',
  placeholder = 'Pesquisar...',
  value,
  onChange,
  disabled = false,
  className = '',
  label,
  error = false,
  maxLength,
  minLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

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

  const shouldLabelBeOnTop = value.length > 0 || isFocused;

  return (
    <div className="relative w-full">
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={shouldLabelBeOnTop ? placeholder : ''}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        maxLength={maxLength}
        minLength={minLength}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
        }}
        className={`peer h-auto rounded-md bg-inherit py-3 pr-4 pl-11 text-gray-600 transition-colors duration-200 focus:ring-0 focus:outline-none dark:bg-none [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-strong-password-auto-fill-button]:hidden ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 focus:border-blue-500 focus-visible:border-gray-300 focus-visible:ring-gray-200'
        } ${disabled ? 'bg-background cursor-not-allowed' : 'bg-background'} ${className}`.trim()}
      />

      <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      {label && (
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
      )}
    </div>
  );
};
