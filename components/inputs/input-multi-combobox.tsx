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
import { Check, Minus } from "lucide-react";
import { Button } from "../ui/button";

export interface ComboBoxItemMulti {
  id: string;
  name: string;
  active?: boolean;
}

export const useMultiComboBoxInput = (initialValues: string[] = []) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialValues);

  const handleMultiChange = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
  name?: string;
  placeholder?: string;
  value: string[];
  icone?: keyof typeof LucideIcons;
  onChange: (value: string[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  options: ComboBoxItemMulti[];
  maxVisibleTags?: number;
  selectAllPosition?: "top" | "middle";
}

export const formaValueLabel = (value: string) => {
  const parts = value.trim().split(/\s+/);
  return parts.length > 2
    ? parts.slice(0, 2).join(" ") + "..."
    : parts.join(" ");
};

export const MultiComboBoxInput: React.FC<MultiComboBoxInputProps> = ({
  id = "multi-combo",
  name = "multi-combo",
  icone = "Group",
  placeholder = "Selecione...",
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
  options,
  maxVisibleTags = 2,
  selectAllPosition = "top",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const selectedLabels = options
    .filter((opt) => value.includes(opt.id))
    .map((opt) => opt.name);

  const isAllSelected = value.length === options.length;
  const isPartial = value.length > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.id));
    }
  };

  const renderSelectAllButton = () => {
    let icon = null;
    if (isAllSelected)
      icon = (
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 bg-slate-200">
          <Check size={16} className="text-primary" />
        </div>
      );
    else if (isPartial)
      icon = (
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-400 bg-slate-200">
          <Minus size={16} className="text-primary" />
        </div>
      );
    else icon = <div className="h-5 w-5 rounded-sm border border-gray-400" />;

    return (
      <Button
        type="button"
        variant={"ghost"}
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleSelectAll();
        }}
        className={`absolute ${
          selectAllPosition === "middle" ? "top-1/2 -translate-y-1/2" : "top-2"
        } right-0 z-20 flex items-center justify-center rounded-full bg-transparent shadow-sm hover:bg-primary/20 dark:hover:bg-primary/10`}
      >
        {icon}
      </Button>
    );
  };

  const shouldLabelBeOnTop = value.length > 0 || isOpen;

  const renderOptions = () => {
    return options.map(renderOptionItem);
  };

  const renderOptionItem = ({ id, name, active }: ComboBoxItemMulti) => (
    <div
      key={id}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const newValue = value.includes(id)
          ? value.filter((v) => v !== id)
          : [...value, id];
        onChange(newValue);
      }}
      className={`cursor-pointer rounded-sm px-2 py-1.5 hover:bg-accent ${
        value.includes(id) ? "bg-muted text-foreground dark:bg-muted/50" : ""
      }`}
    >
      <span className={`${!active && "text-orange-500"}`}>{name}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Select
          open={isOpen}
          onOpenChange={setIsOpen}
          disabled={disabled}
          value=""
          onValueChange={() => {}}
        >
          <SelectTrigger
            id={id}
            name={name}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            className={`peer h-auto min-h-[46px] rounded-md bg-inherit py-3 pl-11 pr-4 text-left transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gray-300 dark:bg-none ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200"
            } ${disabled ? "cursor-not-allowed bg-background" : "bg-background"} ${className}`}
          >
            <div className="relative flex w-full flex-wrap gap-1">
              {selectedLabels.length > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onChange([]);
                  }}
                  className={
                    "absolute right-3 top-1 z-50 h-4 w-4 rounded-full border-none hover:bg-slate-600/20"
                  }
                >
                  <LucideIcons.X size={16} />
                </div>
              )}
              {selectedLabels.length === 0 && shouldLabelBeOnTop ? (
                <span className="text-gray-500">{placeholder}</span>
              ) : selectedLabels.length <= maxVisibleTags ? (
                selectedLabels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium uppercase text-primary"
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
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium uppercase text-primary"
                      >
                        {formaValueLabel(label)}
                      </span>
                    ))}
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    +{selectedLabels.length - maxVisibleTags}
                  </span>
                </>
              )}
            </div>
          </SelectTrigger>

          <SelectContent
            className="relative max-h-60 overflow-auto"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="p-1 text-xs uppercase">{renderOptions()}</div>
            {options.length > 0 && renderSelectAllButton()}
          </SelectContent>
        </Select>

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <Icon iconName={icone} size={20} className="h-5 w-5 text-gray-400" />
        </div>

        {label && (
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-10 transition-all duration-200 ${
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
