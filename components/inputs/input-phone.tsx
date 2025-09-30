import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

interface PhoneInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: boolean;
}

const formatPhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  // Corrigido: Retorna string vazia se não houver dígitos
  if (!digits) return "";

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const usePhoneInput = (initialValue: string = "") => {
  const [phone, setPhone] = useState(initialValue);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPhone(e.target.value);
    },
    [],
  );

  const resetPhone = useCallback(() => {
    setPhone("");
  }, []);

  return {
    phone,
    setPhone,
    handlePhoneChange,
    resetPhone,
  };
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = "phone",
  name = "phone",
  placeholder,
  value,
  onChange,
  disabled = false,
  className = "",
  label,
  error = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { setPhone } = usePhoneInput(value.toString());
  const [rawValue, setRawValue] = useState(value.toString());

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatPhoneInput(rawValue);
      setRawValue(rawValue);
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
        },
      };

      onChange(syntheticEvent);
      setPhone(formattedValue);
    },
    [onChange, setPhone],
  );

  const displayValue = rawValue ? formatPhoneInput(rawValue) : "";
  const shouldLabelBeOnTop = displayValue.length > 0 || isFocused;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full">
        <Input
          id={id}
          name={name}
          type="text"
          placeholder={shouldLabelBeOnTop ? placeholder : ""}
          value={displayValue}
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
          <Phone className="h-5 w-5 text-gray-400" />
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
