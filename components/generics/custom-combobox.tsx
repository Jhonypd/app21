import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string | boolean;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  value: string | boolean;
  onValueChange: (value: string | boolean) => void;
  placeholder?: React.ReactNode;

  onOpenSheetEdit: () => void;
  onOpenAlertDialog: () => void;
}

export function DynamicCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  onOpenSheetEdit,
  onOpenAlertDialog,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    const selectedOption = options.find(
      (option) => option.value.toString() === selectedValue,
    );

    if (selectedOption) {
      onValueChange(selectedOption.value);

      if (selectedOption.value === "editar") {
        onOpenSheetEdit();
      } else if (selectedOption.value === "cancelar") {
        onOpenAlertDialog();
      } 
    } else {
      onValueChange("");
    }

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="!h-fit !w-fit p-0">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="!h-fit !w-fit justify-between p-0"
        >
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="!h-fit !w-fit p-0">
        <Command className="!w-fit">
          <CommandList className="!w-fit">
            <CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
            <CommandGroup className="!w-fit">
              {options.map((option) => (
                <CommandItem
                  key={option.value.toString()}
                  value={option.value.toString()}
                  onSelect={handleSelect}
                  className="mt-1"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
