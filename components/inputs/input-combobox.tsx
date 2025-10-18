import {
  useCallback,
  useState,
  memo,
  useMemo,
} from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { IconType } from 'react-icons';
import { VscSymbolEnumMember } from 'react-icons/vsc';
import { IoMdClose } from 'react-icons/io';

export interface ComboBoxItem {
  id: string;
  nome: string;
  inativo?: boolean;
}

interface ComboBoxInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  icone?: IconType;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  options: ComboBoxItem[];
  onReset?: () => void;
}

// Componente memoizado para evitar re-renderizações desnecessárias
const ComboBoxInput: React.FC<ComboBoxInputProps> = memo(
  ({
    id = 'combo',
    name = 'combo',
    icone = VscSymbolEnumMember,
    placeholder = 'Selecione...',
    value,
    onChange,
    disabled = false,
    className = '',
    label,
    error = false,
    options,
    onReset,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const IconComponent = icone;

    // Memoizar cálculos derivados
    const shouldLabelBeOnTop = useMemo(
      () => (value?.length ?? 0) > 0 || isOpen,
      [value, isOpen],
    );

    const selectedOption = useMemo(
      () => options.find((item) => item.id === value),
      [options, value],
    );

    const selectValue = useMemo(() => {
      return value || 'empty';
    }, [value]);

    const handleSelectChange = useCallback(
      (newValue: string) => {
        if (newValue === 'empty') {
          onChange('');
        } else {
          onChange(newValue);
        }
      },
      [onChange],
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onReset) {
          onReset();
        } else {
          onChange('');
        }
      },
      [onReset, onChange],
    );

    const selectTriggerStyle = useMemo(
      () => ({
        paddingRight: value && !disabled ? '40px' : '32px',
      }),
      [value, disabled],
    );

    // Memoizar o conteúdo das opções
    const optionsContent = useMemo(
      () => (
        <SelectGroup>
          <SelectItem
            value="empty"
            className="text-gray-400 italic"
          >
            Nenhum(a)
          </SelectItem>
          {options.map(({ id, nome, inativo }) => (
            <SelectItem
              key={id}
              value={id}
              className={`${selectedOption?.id === id && 'bg-primary/10'}`}
            >
              <span
                className={`${!inativo && 'text-orange-500'}`}
              >
                {nome}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      ),
      [options, selectedOption?.id],
    );

    const displayValue = useMemo(() => {
      if (!selectedOption) return null;

      return (
        <span
          className={`${!selectedOption.inativo && 'text-orange-500'} uppercase`}
        >
          {selectedOption.nome
            .split(' ')
            .slice(0, 2)
            .join(' ')}
        </span>
      );
    }, [selectedOption]);

    const labelClassNames = useMemo(() => {
      const baseClasses =
        'pointer-events-none absolute left-10 cursor-text transition-all duration-200';
      const positionClass = shouldLabelBeOnTop
        ? 'bg-background -top-2 z-10 px-1 text-xs'
        : 'top-1/2 -translate-y-1/2 text-sm';

      let colorClass = 'text-gray-600';
      if (error && shouldLabelBeOnTop) {
        colorClass = 'text-red-500';
      } else if (shouldLabelBeOnTop) {
        colorClass = 'text-gray-500';
      }

      return `${baseClasses} ${positionClass} ${colorClass}`;
    }, [shouldLabelBeOnTop, error]);

    const selectTriggerClassNames = useMemo(() => {
      const baseClasses = `peer h-auto min-h-[46px] w-full rounded-md bg-inherit py-3 pl-11 text-left text-gray-500 transition-colors duration-200 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-gray-300 focus-visible:outline-none dark:bg-none ${className}`;

      const borderClass = error
        ? 'border-red-500 focus:border-red-500'
        : 'border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200';

      const disabledClass = disabled
        ? 'bg-background cursor-not-allowed'
        : 'bg-background';

      return `${baseClasses} ${borderClass} ${disabledClass}`;
    }, [error, disabled, className]);

    return (
      <div className="flex w-full items-center justify-center">
        <div className="relative w-full">
          <Select
            value={selectValue}
            onValueChange={handleSelectChange}
            disabled={disabled}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger
              id={id}
              name={name}
              className={selectTriggerClassNames}
              style={selectTriggerStyle}
            >
              <div className="relative flex w-full items-center">
                <SelectValue
                  className="text-gray-900 uppercase dark:text-white"
                  placeholder={
                    value === '' && shouldLabelBeOnTop
                      ? placeholder
                      : undefined
                  }
                >
                  {displayValue}
                </SelectValue>
              </div>
            </SelectTrigger>

            <SelectContent className="max-h-44 text-gray-500 uppercase">
              {optionsContent}
            </SelectContent>
          </Select>

          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 focus:outline-none"
            >
              <IoMdClose
                size={16}
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          )}

          <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
            <IconComponent
              size={20}
              className="h-5 w-5 text-gray-400"
            />
          </div>

          {label && (
            <label
              htmlFor={id}
              className={labelClassNames}
            >
              {label}
            </label>
          )}
        </div>
      </div>
    );
  },
);

ComboBoxInput.displayName = 'ComboBoxInput';

export { ComboBoxInput };
