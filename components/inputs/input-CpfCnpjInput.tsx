import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { IdCard } from "lucide-react";

interface CpfCnpjInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
  type: "cpf" | "cnpj";
}

const formatCpf = (digits: string) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const formatCnpj = (digits: string) => {
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(
    8,
    12,
  )}-${digits.slice(12, 14)}`;
};

const formatCpfCnpj = (digits: string, type: "cpf" | "cnpj") => {
  return type === "cpf" ? formatCpf(digits) : formatCnpj(digits);
};

export const CpfCnpjInput: React.FC<CpfCnpjInputProps> = ({
  id = "cpfCnpj",
  name = "cpfCnpj",
  placeholder,
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
  type,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [rawValue, setRawValue] = useState(value.toString());

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const onlyDigits = raw.replace(/\D/g, "");

      // Limite de dígitos por tipo
      const limitedDigits = onlyDigits.slice(0, type === "cpf" ? 11 : 14);
      const formatted = formatCpfCnpj(limitedDigits, type);
      setRawValue(formatted);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: limitedDigits, // <-- valor limpo enviado
        },
      };
      onChange(syntheticEvent);
    },
    [onChange, type],
  );

  const onlyDigits = rawValue.replace(/\D/g, "");
  const formattedValue = formatCpfCnpj(onlyDigits, type);
  const shouldLabelBeOnTop = formattedValue.length > 0 || isFocused;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Input
          id={id}
          name={name}
          type="text"
          placeholder={shouldLabelBeOnTop ? placeholder : ""}
          value={formattedValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className={`peer h-auto rounded-md bg-inherit py-3 pl-11 pr-4 transition-colors duration-200 focus:outline-none focus:ring-0 focus-visible:ring-gray-300 focus-visible:ring-ring dark:bg-none ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus-visible:border-gray-300 focus-visible:ring-gray-200"
          } ${disabled ? "cursor-not-allowed bg-background" : "bg-background"} ${className}`}
        />

        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
          <IdCard className="h-5 w-5 text-gray-400" />
        </div>

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
      </div>
    </div>
  );
};
