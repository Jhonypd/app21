import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formaValueLabel } from "./input-multi-combobox";
import * as LucideIcons from "lucide-react";
import Icon from "../icon";
import { Skeleton } from "../ui/skeleton";

interface SelectableBadgeProps<T> {
  items: { label: string; value: T }[];
  onSelect: (value: T | undefined) => void;
  selectedValue?: T;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  disabled?: boolean;
  label?: string;
  id: string;
  name?: string;
  icone?: keyof typeof LucideIcons;
  error?: boolean;
  loading?: boolean;
}

export function SelectableBadge<T>({
  items,
  onSelect,
  selectedValue,
  variant = "outline",
  className = "",
  disabled = false,
  label = "selectable",
  id,
  name,
  icone = "Hourglass",
  error = false,
  loading = false,
}: SelectableBadgeProps<T>) {
  const handleItemClick = (value: T) => {
    if (disabled) return;

    // Se o item já está selecionado, desseleciona
    if (selectedValue === value) {
      onSelect(undefined);
    } else {
      onSelect(value);
    }
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {/* Label e ícone */}
      <div className="relative ml-1 flex items-center gap-2">
        <label
          htmlFor={id}
          className={`absolute -top-1 left-8 z-10 bg-white px-1 text-xs font-medium dark:bg-background ${
            error ? "text-red-500" : "text-gray-500"
          }`}
        >
          {label}
        </label>
      </div>

      {/* Container principal com borda e scroll invisível */}
      <div className="relative flex w-full items-center rounded-md border pl-12">
        {/* Container de scroll */}
        <div
          className={cn(
            "flex w-full items-center overflow-x-auto scroll-smooth p-3 scrollbar-none focus:border-gray-300 focus-visible:border-gray-300",
            className,
            error ? "border-red-500" : "border-gray-300",
            disabled ? "cursor-not-allowed bg-background" : "bg-background",
          )}
          tabIndex={0}
        >
          {/* Container flex para os badges */}
          <div className="flex flex-nowrap gap-2 focus-visible:border-gray-300">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="rounded-full">
                  <Badge className="rounded-full bg-stone-300 bg-gradient-to-t py-2">
                    <span className="flex flex-nowrap opacity-0">00:00</span>
                  </Badge>
                </Skeleton>
              ))}
            {items.map((item) => (
              <Badge
                key={String(item.value)}
                variant={variant}
                onClick={() => handleItemClick(item.value)}
                className={cn(
                  "flex-shrink-0 cursor-pointer select-none whitespace-nowrap py-2 uppercase transition-all",
                  selectedValue === item.value &&
                    "border-primary bg-primary text-white",
                  disabled && "pointer-events-none uppercase text-gray-400",
                  disabled &&
                    selectedValue === item.value &&
                    "!bg-primary/70 !text-white",
                )}
              >
                {formaValueLabel(item.label)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <Icon iconName={icone} size={20} className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
