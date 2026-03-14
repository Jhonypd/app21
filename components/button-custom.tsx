import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import { LoaderIcon } from 'lucide-react';

type BaseVariant =
   | 'default'
   | 'destructive'
   | 'outline'
   | 'secondary'
   | 'ghost'
   | 'link'
   | 'hero'
   | 'admin'
   | 'warning';
type CustomVariant = BaseVariant | 'disabled';
type CustomSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const sizeClasses: Record<CustomSize, string> = {
   xs: 'h-8 rounded-lg px-2.5 text-xs',
   sm: 'h-9 rounded-md px-3',
   md: 'h-10 px-4 text-sm',
   lg: 'h-11 rounded-md px-8 text-base',
   xl: 'h-14 rounded-2xl px-10 text-lg',
   icon: 'h-10 w-10 rounded-xl p-0',
};

const mapSizeToBase = (size: CustomSize): 'default' | 'sm' | 'lg' | 'icon' => {
   if (size === 'sm') return 'sm';
   if (size === 'lg' || size === 'xl') return 'lg';
   if (size === 'icon') return 'icon';
   return 'default';
};

export interface CustomButtonProps
   extends ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: CustomVariant;
   size?: CustomSize;
   fullWidth?: boolean;
   loading?: boolean;
   children?: ReactNode;
}

export const ButtonCustom = forwardRef<HTMLButtonElement, CustomButtonProps>(
   (
      {
         disabled = false,
         loading = false,
         fullWidth = false,
         children,
         className,
         variant = 'default',
         size = 'md',
         ...props
      },
      ref,
   ) => {
      const visualVariant: BaseVariant =
         variant === 'disabled' ? 'default' : variant;
      const isDisabledStyle = variant === 'disabled';

      const renderContent = () => {
         if (!children && !loading) return null;

         if (loading) return <LoaderIcon className="size-4 animate-spin" />;

         return children;
      };

      return (
         <Button
            ref={ref}
            className={cn(
               buttonVariants({
                  variant: visualVariant,
                  size: mapSizeToBase(size),
               }),
               sizeClasses[size],
               'focus-visible:ring-ring focus-visible:ring-offset-background relative font-semibold tracking-[0.01em] duration-200 ease-out select-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:opacity-55 disabled:shadow-none disabled:saturate-50',
               isDisabledStyle &&
                  'bg-muted text-muted-foreground cursor-not-allowed',
               fullWidth && 'w-full',
               className,
            )}
            disabled={disabled || loading || isDisabledStyle}
            {...props}
         >
            {renderContent()}
         </Button>
      );
   },
);

ButtonCustom.displayName = 'ButtonCustom';
