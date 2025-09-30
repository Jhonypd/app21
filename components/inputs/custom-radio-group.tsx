import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type Option = {
  key: string;
  label: string;
  colorClass?: string;
};

type SelectableGroupProps = {
  name: string;
  options: Option[];
  label: string;
  direction?: "row" | "column";
  value: string | string[];
  onChange: (val: string | string[]) => void;
  mode?: "single" | "multiple";
  className?: string;
};

export function CustomRadioGroup({
  name,
  options,
  label,
  direction = "row",
  value,
  onChange,
  mode = "single",
  className,
}: SelectableGroupProps) {
  const isSelected = (key: string) =>
    mode === "multiple"
      ? Array.isArray(value) && value.includes(key)
      : value === key;

  const handleCheckboxChange = (key: string) => {
    if (!Array.isArray(value)) return;
    const newValue = value.includes(key)
      ? value.filter((v) => v !== key)
      : [...value, key];
    onChange(newValue);
  };

  return (
    <div className={cn("relative", className)}>
      <Label
        className="absolute -top-2 left-2 bg-white px-1 text-xs text-muted-foreground"
        htmlFor={name}
      >
        {label}
      </Label>

      <div
        className={cn(
          "rounded-md border border-input bg-background px-3 py-2",
          direction === "row"
            ? "flex flex-row flex-nowrap gap-4"
            : "flex flex-col gap-2",
        )}
      >
        {mode === "single" ? (
          <RadioGroup
            id={name}
            value={value as string}
            onValueChange={(val) => onChange(val)}
          >
            {options.map((option) => (
              <div key={option.key} className="flex items-center gap-2">
                <RadioGroupItem
                  value={option.key}
                  id={`${name}-${option.key}`}
                  className={cn(option.colorClass)}
                />
                <Label htmlFor={`${name}-${option.key}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          options.map((option) => (
            <div
              key={option.key}
              className="flex w-full flex-col items-center gap-2 py-2"
            >
              <Label htmlFor={`${name}-${option.key}`}>{option.label}</Label>
              <Checkbox
                id={`${name}-${option.key}`}
                checked={isSelected(option.key)}
                onCheckedChange={() => handleCheckboxChange(option.key)}
                className={cn(option.colorClass)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
