import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ListFilterIcon } from 'lucide-react';
import React from 'react';

interface Props {
  children: React.ReactNode;
  onSubmit?: () => Promise<void> | void;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  isOpen?: boolean;
}

const FilterPage = ({
  children,
  className = '',
  onSubmit,
  onOpenChange,
  isOpen = false,
}: Props) => {
  const handleSubmit = async () => {
    await onSubmit?.();
  };

  const accordionValue = isOpen ? 'filter' : undefined;

  const handleValueChange = (value: string) => {
    if (onOpenChange) {
      onOpenChange(value === 'filter');
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={handleValueChange}
      className="w-full max-w-full overflow-hidden rounded-lg border-2 px-4"
    >
      <AccordionItem
        value="filter"
        className="w-full border-b-0"
      >
        <AccordionTrigger
          type="button"
          className="text-primary w-full cursor-pointer border-none hover:no-underline"
        >
          <span className="text-bold flex gap-2 uppercase">
            <ListFilterIcon /> Filtros
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div
            className={`flex h-full w-full flex-col justify-between gap-2 py-3 ${className}`}
          >
            <div className="flex-1">{children}</div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="cursor-pointer uppercase"
            >
              Filtrar
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FilterPage;
