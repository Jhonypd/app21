import React, { useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckedState } from '@radix-ui/react-checkbox';

interface CheckboxHeaderProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: (checked: boolean) => void;
}

const CheckboxHeader = ({
  isAllSelected,
  isIndeterminate,
  onToggleAll,
}: CheckboxHeaderProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const input = ref.current?.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    if (input) {
      input.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="inline-flex h-full items-center justify-center">
      <Checkbox
        ref={ref}
        checked={isAllSelected}
        onCheckedChange={(value: CheckedState) => {
          onToggleAll(Boolean(value));
        }}
        aria-label="Selecionar todos"
        className="h-[18px] w-[18px] rounded-xs"
      />
    </div>
  );
};

export default CheckboxHeader;
