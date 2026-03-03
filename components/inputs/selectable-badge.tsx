import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formaValueLabel } from './input-multi-combobox';
import * as LucideIcons from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface SelectableBadgeProps<T> {
   items: { label: string; value: T }[];
   onSelect: (value: T | undefined) => void;
   selectedValue?: T;
   variant?: 'default' | 'secondary' | 'destructive' | 'outline';
   className?: string;
   disabled?: boolean;
   label?: string;
   id: string;
   icone?: keyof typeof LucideIcons;
   error?: boolean;
   loading?: boolean;
}

export function SelectableBadge<T>({
   items,
   onSelect,
   selectedValue,
   variant = 'outline',
   className = '',
   disabled = false,
   label = 'selectable',
   id,
   icone = 'Hourglass',
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
      <div className="relative w-full">
         {/* Ícone */}
         <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2">
            {(() => {
               const IconComponent = LucideIcons[icone] as
                  | React.ElementType
                  | undefined;
               return IconComponent ? (
                  <IconComponent className="h-5 w-5 text-gray-400" />
               ) : null;
            })()}
         </div>

         {/* Label flutuante */}
         {label && (
            <label
               htmlFor={id}
               className={`bg-background absolute -top-2 left-10 z-10 px-1 text-xs text-gray-500 ${
                  error ? 'text-red-500' : ''
               }`}
            >
               {label}
            </label>
         )}

         {/* Container de scroll com borda */}
         <div
            id={id}
            className={cn(
               'scrollbar-none flex w-full items-center overflow-x-auto scroll-smooth rounded-md border py-3 pr-4 pl-11',
               error ? 'border-red-500' : 'border-gray-300',
               disabled
                  ? 'bg-background cursor-not-allowed opacity-60'
                  : 'bg-background',
               className,
            )}
            tabIndex={disabled ? -1 : 0}
         >
            <div className="flex flex-nowrap gap-2">
               {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                     <Skeleton
                        key={i}
                        className="rounded-full"
                     >
                        <Badge className="rounded-full bg-stone-300 bg-gradient-to-t py-2">
                           <span className="flex flex-nowrap opacity-0">
                              00:00
                           </span>
                        </Badge>
                     </Skeleton>
                  ))}
               {items.map((item) => (
                  <Badge
                     key={String(item.value)}
                     variant={variant}
                     onClick={() => handleItemClick(item.value)}
                     className={cn(
                        'flex-shrink-0 cursor-pointer py-2 whitespace-nowrap uppercase transition-all select-none',
                        selectedValue === item.value &&
                           'border-primary bg-primary text-white',
                        disabled && 'pointer-events-none text-gray-400',
                        disabled &&
                           selectedValue === item.value &&
                           '!bg-primary/70 !text-white',
                     )}
                  >
                     {formaValueLabel(item.label)}
                  </Badge>
               ))}
            </div>
         </div>
      </div>
   );
}
