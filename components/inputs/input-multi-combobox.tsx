import { useCallback, useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';
import { IconType } from 'react-icons';
import { Check, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { IoMdClose } from 'react-icons/io';
import { HiSquares2X2 } from 'react-icons/hi2';

export interface ComboBoxItemMulti {
  id: string;
  nome: string;
  active?: boolean;
}

export const useMultiComboBoxInput = (
  initialValues: string[] = [],
) => {
  const [selectedIds, setSelectedIds] =
    useState<string[]>(initialValues);

  const handleMultiChange = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  }, []);

  const setAll = useCallback((all: string[]) => {
    setSelectedIds(all);
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    handleMultiChange,
    setAll,
    clear,
  };
};

interface MultiComboBoxInputProps {
  id?: string;
  nome?: string;
  placeholder?: string;
  value: string[];
  icone?: IconType;
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  options: ComboBoxItemMulti[];
  maxVisibleTags?: number;
  selectAllPosition?: 'top' | 'middle';
}

export const formaValueLabel = (value: string) => {
  const parts = value.trim().split(/\s+/);
  return parts.length > 2
    ? parts.slice(0, 2).join(' ') + '...'
    : parts.join(' ');
};

export const MultiComboBoxInput: React.FC<
  MultiComboBoxInputProps
> = ({
  id = 'multi-combo',
  nome = 'multi-combo',
  icone = HiSquares2X2, // Corrigido: componente, não string
  placeholder = 'Selecione...',
  value,
  onChange,
  disabled = false,
  className = '',
  label,
  error = false,
  options,
  maxVisibleTags = 2,
  selectAllPosition = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const IconComponent = icone;

  const selectedLabels = options
    .filter((opt) => value.includes(opt.id))
    .map((opt) => opt.nome);

  const isAllSelected = value.length === options.length;
  const isPartial = value.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.id));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault(); // Adicionar preventDefault também
    e.stopPropagation(); // Já tinha este
    onChange([]);
  };

  const handleOptionClick = (
    id: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Apenas stopPropagation
    const newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const renderSelectAllButton = () => {
    let icon = null;
    if (isAllSelected)
      icon = (
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 bg-slate-200">
          <Check
            size={16}
            className="text-primary"
          />
        </div>
      );
    else if (isPartial)
      icon = (
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 bg-slate-200">
          <Minus
            size={16}
            className="text-primary"
          />
        </div>
      );
    else
      icon = (
        <div className="h-5 w-5 rounded-sm border border-gray-400" />
      );

    return (
      <Button
        type="button"
        variant={'ghost'}
        size="icon"
        onClick={(e) => {
          e.stopPropagation(); // Apenas stopPropagation
          toggleSelectAll();
        }}
        className={`absolute ${
          selectAllPosition === 'middle'
            ? 'top-1/2 -translate-y-1/2'
            : 'top-2'
        } hover:bg-primary/20 dark:hover:bg-primary/10 right-0 z-20 flex items-center justify-center rounded-full bg-transparent`}
      >
        {icon}
      </Button>
    );
  };

  const shouldLabelBeOnTop = value.length > 0 || isOpen;

  const renderOptions = () => {
    return options.map(renderOptionItem);
  };

  const renderOptionItem = ({
    id,
    nome,
    active,
  }: ComboBoxItemMulti) => (
    <div
      key={id}
      onClick={(e) => handleOptionClick(id, e)}
      className={`${value.includes(id) ? 'hover:bg-primary/5' : 'hover:bg-muted/50'} cursor-pointer rounded-sm px-2 py-1.5 ${
        value.includes(id)
          ? 'bg-primary/10 dark:bg-muted/50 font-medium text-gray-400'
          : 'bg-muted'
      }`}
    >
      <span className={`${!active && 'text-orange-500'}`}>
        {nome}
      </span>
    </div>
  );

  return (
    <div className="flex w-full items-center justify-center">
      <div className="relative w-full">
        {selectedLabels.length > 0 && (
          <Button
            type="button"
            variant={'outline'}
            onClick={handleClear}
            onMouseDown={(e) => {
              // Prevenir no onMouseDown também para ser mais eficaz
              e.preventDefault();
              e.stopPropagation();
            }}
            className={
              'hover:bg-primary/10 absolute top-3 right-10 z-50 flex h-5 w-5 items-center justify-center rounded-full border-none text-gray-400 [&>svg]:size-5'
            }
          >
            <IoMdClose />
          </Button>
        )}
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          disabled={disabled}
          value=""
          onValueChange={() => {}}
        >
          <SelectTrigger
            id={id}
            name={nome}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            className={`peer h-auto min-h-[46px] w-full rounded-md bg-inherit py-3 pr-4 pl-11 text-left transition-colors duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-gray-300 focus-visible:outline-none dark:bg-none [&>svg]:size-5 ${
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200'
            } ${disabled ? 'bg-background cursor-not-allowed' : 'bg-background'} ${className}`}
          >
            <div className="relative flex w-full flex-wrap gap-1">
              {selectedLabels.length === 0 &&
              shouldLabelBeOnTop ? (
                <span className="text-gray-500">
                  {placeholder}
                </span>
              ) : selectedLabels.length <=
                maxVisibleTags ? (
                selectedLabels.map((label, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase"
                  >
                    {formaValueLabel(label)}
                  </span>
                ))
              ) : (
                <>
                  {selectedLabels
                    .slice(0, maxVisibleTags)
                    .map((label, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2 py-1 text-xs font-medium uppercase"
                      >
                        {formaValueLabel(label)}
                      </span>
                    ))}
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +
                    {selectedLabels.length - maxVisibleTags}
                  </span>
                </>
              )}
            </div>
          </SelectTrigger>

          <SelectContent
            className="relative max-h-60 min-h-16 overflow-auto"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="p-1 text-xs text-gray-400">
              {renderOptions()}
            </div>
            {options.length > 0 && renderSelectAllButton()}
          </SelectContent>
        </Select>

        <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
          <IconComponent className="h-5 w-5 text-gray-400" />
        </div>

        {label && (
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-10 transition-all duration-200 ${
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
        )}
      </div>
    </div>
  );
};
