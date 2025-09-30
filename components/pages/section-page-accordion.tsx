import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import React, { useState } from "react";
import Icon from "../icon";

interface Props {
  children: React.ReactNode;
  onSubmit?: () => Promise<void> | void;
  title: string;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  isOpen?: boolean; // controle externo
  defaultOpen?: boolean; // estado inicial aberto, se desejado
  disableToggle?: boolean; // desabilita o clique manual
  icon: keyof typeof LucideIcons;
  btnAction?: string;
  disabled?: boolean;
}

const SectionPageAccordion = ({
  children,
  className = "",
  title,
  onOpenChange,
  isOpen,
  defaultOpen = false,
  disableToggle = false,
  icon,
  onSubmit,
  btnAction = "Salvar",
  disabled,
}: Props) => {
  const isControlled = typeof isOpen === "boolean";
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    defaultOpen ? "filter" : undefined,
  );

  // Se for controlado externamente, usamos o valor de isOpen; caso contrário, usamos o estado interno
  const value = isControlled ? (isOpen ? "filter" : undefined) : accordionValue;

  // Alteração de valor respeitando o disableToggle
  const handleValueChange = (value: string) => {
    if (disableToggle) return; // se toggle está desabilitado, não faz nada

    if (!isControlled) {
      setAccordionValue(value);
    }
    onOpenChange?.(value === "filter");
  };

  const handleSubmit = async () => {
    await onSubmit?.();
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={handleValueChange}
      className="w-full max-w-full overflow-hidden rounded-lg border-2 px-4"
    >
      <AccordionItem value="filter" className="w-full border-b-0">
        <AccordionTrigger
          className="w-full cursor-pointer border-none text-primary hover:no-underline"
          aria-label={`Toggle ${title}`}
          onClick={(e) => {
            // Previne o toggle se disableToggle estiver ativo
            if (disableToggle) {
              e.preventDefault();
            }
          }}
        >
          <span className="text-bold flex gap-2 uppercase">
            <Icon iconName={icon} size={28} />
            <span className="truncate text-ellipsis text-nowrap">{title}</span>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div
            className={`flex h-full w-full flex-col justify-between gap-2 py-3 ${className}`}
          >
            <div className="flex-1">{children}</div>
            {onSubmit && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="cursor-pointer uppercase"
                  disabled={disabled}
                >
                  {btnAction}
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SectionPageAccordion;
