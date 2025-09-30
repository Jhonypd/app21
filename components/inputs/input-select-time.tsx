import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer } from "lucide-react";

type TimeFormat = "minutes" | "hh:mm";

interface TimeSelectInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  step?: number;
  format?: TimeFormat;
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
}

export const TimeSelectInput: React.FC<TimeSelectInputProps> = ({
  id = "time",
  name = "time",
  placeholder = "Selecione o tempo",
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
  step = 10,
  format = "minutes",
  startTime = "00:00",
  endTime = "23:59",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const shouldLabelBeOnTop = value.length > 0 || isOpen;

  // Validação do step (1-60)
  const validatedStep = Math.min(60, Math.max(1, step));

  // Gerar opções baseadas no formato
  const generateOptions = () => {
    if (format === "hh:mm") {
      // Converter HH:mm para minutos totais
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      const options = [];
      for (
        let minutes = startTotal;
        minutes <= endTotal;
        minutes += validatedStep
      ) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        options.push({
          value: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
          label: `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`,
        });
      }
      return options;
    } else {
      // Modo minutos (comportamento original)
      const maxMinutes =
        parseInt(value) > 0 ? Math.max(parseInt(value), 240) : 240;
      return Array.from(
        { length: Math.ceil(maxMinutes / validatedStep) },
        (_, i) => {
          const minutes = (i + 1) * validatedStep;
          return {
            value: minutes.toString(),
            label: `${minutes} min`,
          };
        },
      );
    }
  };

  const options = generateOptions();

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger
            id={id}
            name={name}
            className={`peer h-auto min-h-[46px] rounded-md bg-inherit py-3 pl-11 pr-4 text-left text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gray-300 dark:bg-none ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200"
            } ${disabled ? "cursor-not-allowed bg-background" : "bg-background"} ${className}`}
          >
            <SelectValue
              placeholder={
                value === "" && shouldLabelBeOnTop ? placeholder : undefined
              }
            >
              {value ? (format === "hh:mm" ? value : `${value} min`) : null}
            </SelectValue>
          </SelectTrigger>

          <SelectContent className="max-h-44 overflow-y-auto text-gray-500">
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <Timer className="h-5 w-5 text-gray-400" />
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
