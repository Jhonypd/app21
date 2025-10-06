'use client';

import React, {
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { IconType } from 'react-icons';
import { FaUserPlus } from 'react-icons/fa';
import Loading from '../loading';
import { X } from 'lucide-react';

export interface Option {
  id: string;
  nome: string;
  inativo?: boolean;
}

interface MultiSelectCommandProps {
  value: Option[];
  onChange: (value: Option[]) => void;
  placeholder?: string;
  label?: string;
  icone?: IconType;
  error?: boolean;
  disabled?: boolean;
  onSearch?: (
    term: string,
    excludeIds?: string[],
  ) => Promise<Option[]>;
}

export const MultiSelectCommand: React.FC<
  MultiSelectCommandProps
> = ({
  value,
  onChange,
  placeholder = 'Digite para buscar...',
  label,
  onSearch,
  disabled,
  icone = FaUserPlus,
  error = false,
}) => {
  const IconComponent = icone;
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [remoteOptions, setRemoteOptions] = useState<
    Option[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  // Filtra remotes que não estão já selecionados
  const filteredOptions = useMemo(() => {
    return remoteOptions.filter(
      (ro) => !value.some((v) => v.id === ro.id),
    );
  }, [remoteOptions, value]);

  // Debounce para a busca
  const debouncedSearch = useCallback(
    debounce(
      async (term: string, excludeIds: string[] = []) => {
        // ↓↓↓ VALIDAÇÃO DE MÍNIMO 3 CARACTERES ↓↓↓
        if (onSearch && term.trim().length >= 3) {
          setLoading(true);
          try {
            const results = await onSearch(
              term,
              excludeIds,
            );
            setRemoteOptions(results);
          } catch (error) {
            console.error('Erro na busca:', error);
            setRemoteOptions([]);
          } finally {
            setLoading(false);
          }
        } else {
          setRemoteOptions([]);
          setLoading(false);
        }
      },
      500,
    ),
    [onSearch],
  );

  // Busca remota com validação
  const handleSearch = (term: string) => {
    setSearch(term);
    setIsOpen(true);

    // ↓↓↓ SÓ ABRE DROPDOWN SE TIVER PELO MENOS 3 CARACTERES ↓↓↓
    if (!term || term.trim().length < 3) {
      setRemoteOptions([]);
      setIsOpen(false);
      return;
    }

    // Extrai IDs dos já selecionados para excluir da busca
    const idsParaExcluir = value.map((item) => item.id);
    debouncedSearch(term, idsParaExcluir);
  };

  const handleSelect = (opt: Option) => {
    onChange([...value, opt]);
    setSearch('');
    setRemoteOptions([]);
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v.id !== id));
  };

  // Função debounce (mantém igual)
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  return (
    <div
      className={`w-full rounded-md border border-gray-300 p-2 ${
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200'
      } ${disabled ? 'bg-background cursor-not-allowed' : 'bg-background'}`}
    >
      {/* Input externo estilizado */}
      <div className="relative">
        <div className="peer bg-background h-auto max-h-[46px] w-full rounded-md border border-gray-300 py-3 pr-4 pl-11 text-gray-600 focus-within:ring-2 focus-within:ring-gray-300">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() =>
              search.length >= 3 && setIsOpen(true)
            }
            placeholder={placeholder}
            className="w-full bg-transparent outline-none"
            disabled={disabled}
          />
        </div>

        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <IconComponent className="h-5 w-5 text-gray-400" />
        </div>

        {label && (
          <label
            className={`bg-background absolute -top-2 left-10 z-10 px-1 text-xs text-gray-500 ${
              error && 'text-red-500'
            }`}
          >
            {label}
          </label>
        )}

        {isOpen && search.length >= 3 && (
          <Command className="absolute top-0 right-0 left-0 z-20 mt-12 min-h-28 rounded-md border bg-white shadow-md">
            <CommandList>
              {loading && (
                <div className="pointer-events-auto flex min-h-full items-center justify-center bg-black/60 p-4">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4"></div>
                  </div>
                </div>
              )}
              {!loading && (
                <>
                  <CommandEmpty>
                    {filteredOptions.length === 0
                      ? 'Nenhum resultado encontrado.'
                      : ''}
                  </CommandEmpty>
                  {filteredOptions.length > 0 && (
                    <CommandGroup heading="Usuários localizados">
                      {filteredOptions.map((opt) => (
                        <CommandItem
                          key={opt.id}
                          onSelect={() => handleSelect(opt)}
                          className="cursor-pointer"
                        >
                          <span
                            className={
                              opt.inativo
                                ? 'text-orange-500'
                                : 'text-gray-800'
                            }
                          >
                            {opt.nome}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        )}
      </div>

      {/* Mensagem informativa quando há menos de 3 caracteres */}
      {search.length > 0 && search.length < 3 && (
        <div className="mt-2 text-xs text-gray-500">
          Digite pelo menos 3 caracteres para buscar
        </div>
      )}

      {/* Selecionados */}
      {value.length > 0 && (
        <div className="mt-3 gap-2">
          <p className="text-sm text-gray-400">
            Usuários selecionados:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {value.map((opt) => (
              <span
                key={opt.id}
                onClick={() => handleRemove(opt.id)}
                className="bg-primary/10 text-primary hover:bg-primary/20 flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition"
              >
                {opt.nome}
                <X className="h-3 w-3" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
