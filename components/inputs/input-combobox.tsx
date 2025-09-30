import { useCallback, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import Icon from "../icon";
import * as LucideIcons from "lucide-react";

export interface ComboBoxItem {
  id: string;
  name: string;
  active?: boolean;
}

export const useComboBoxInput = (initialValue: string = "") => {
  const [selectedId, setSelectedId] = useState(initialValue);

  const handleComboboxChange = useCallback((val: string) => {
    setSelectedId(val);
  }, []);

  const reset = useCallback(() => {
    setSelectedId("");
  }, []);

  return {
    selectedId,
    setSelectedId,
    handleComboboxChange,
    reset,
  };
};

interface ComboBoxInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  icone?: keyof typeof LucideIcons;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  options: ComboBoxItem[];
  onReset?: () => void;
}

export const ComboBoxInput: React.FC<ComboBoxInputProps> = ({
  id = "combo",
  name = "combo",
  icone = "Group",
  placeholder = "Selecione...",
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
  options,
  onReset,
}) => {
  const { reset } = useComboBoxInput();
  const [isOpen, setIsOpen] = useState(false);

  const shouldLabelBeOnTop = value.length > 0 || isOpen;

  const selectedOption = options.find((item) => item.id === value);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onReset) {
      onReset();
    } else {
      onChange("");
    }
  };

  const handleSelectChange = (newValue: string) => {
    // Se o valor selecionado for "empty", limpa a seleção
    if (newValue === "empty") {
      onChange("");
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Select
          value={value || "empty"}
          onValueChange={handleSelectChange}
          disabled={disabled}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger
            id={id}
            name={name}
            className={`peer h-auto min-h-[46px] rounded-md bg-inherit py-3 pl-11 text-left text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gray-300 dark:bg-none ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200"
            } ${disabled ? "cursor-not-allowed bg-background" : "bg-background"} ${className}`}
            style={{ paddingRight: value && !disabled ? "40px" : "32px" }}
          >
            <div className="relative flex w-full items-center">
              <SelectValue
                className="uppercase text-gray-900 dark:text-white"
                placeholder={
                  value === "" && shouldLabelBeOnTop ? placeholder : undefined
                }
              >
                {selectedOption ? (
                  <span
                    className={`${!selectedOption.active && "text-orange-500"} uppercase`}
                  >
                    {selectedOption.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                ) : null}
              </SelectValue>
            </div>
          </SelectTrigger>

          <SelectContent className="max-h-44 uppercase text-gray-500">
            <SelectGroup>
              {/* Opção vazia para permitir desseleção */}
              <SelectItem value="empty" className="italic text-gray-400">
                Nenhum(a)
              </SelectItem>
              {options.map(({ id, name, active }) => (
                <SelectItem
                  key={id}
                  value={id}
                  className={`${selectedOption?.id === id && "bg-primary/10"}`}
                >
                  <span className={`${!active && "text-orange-500"}`}>
                    {name}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Botão de limpar posicionado corretamente */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 focus:outline-none"
          >
            <Icon
              iconName="X"
              size={16}
              className="text-gray-400 hover:text-gray-600"
            />
          </button>
        )}

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <Icon iconName={icone} size={20} className="h-5 w-5 text-gray-400" />
        </div>

        {label && (
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-10 cursor-text transition-all duration-200 ${
              shouldLabelBeOnTop
                ? "-top-2 z-10 bg-background px-1 text-xs"
                : "top-1/2 -translate-y-1/2 text-sm"
            } ${
              error && shouldLabelBeOnTop
                ? "text-red-500"
                : shouldLabelBeOnTop
                  ? "text-gray-500"
                  : "text-gray-600"
            }`}
          >
            {label}
          </label>
        )}
      </div>
    </div>
  );
};
