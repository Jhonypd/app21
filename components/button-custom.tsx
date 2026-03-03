import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderIcon } from 'lucide-react';

const buttonVariants = cva(
   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
   {
      variants: {
         variant: {
            default:
               'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-card transition-all duration-300',
            destructive:
               'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft',
            outline:
               'border border-border bg-background hover:bg-primary/5 hover:border-primary/50 transition-all duration-300',
            secondary:
               'bg-gradient-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft hover:shadow-card transition-all duration-300',
            ghost: 'hover:bg-accent hover:text-accent-foreground transition-all duration-300',
            link: 'text-primary underline-offset-4 hover:underline',
            hero: 'bg-gradient-hero text-primary-foreground hover:scale-105 shadow-glow transition-all duration-300 font-semibold',
            admin: 'bg-gradient-accent text-accent-foreground hover:bg-accent/90 shadow-soft hover:shadow-card transition-all duration-300',
            warning:
               'bg-warning text-warning-foreground hover:bg-warning/90 shadow-soft transition-all duration-300',
            disabled: 'bg-muted text-muted-foreground cursor-not-allowed',
         },
         size: {
            xs: 'px-2 py-1 text-xs min-h-[24px]',
            sm: 'px-3 py-1.5 text-sm min-h-[32px]',
            md: 'px-4 py-2 text-base min-h-[40px]',
            lg: 'px-6 py-3 text-lg min-h-[48px]',
            xl: 'px-8 py-4 text-xl min-h-[56px]',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'md',
      },
   },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface CustomButtonProps
   extends ButtonHTMLAttributes<HTMLButtonElement>,
      ButtonVariantProps {
   icon?: ReactNode;
   text?: string;
   fullWidth?: boolean;
   loading?: boolean;
   iconPosition?: 'left' | 'right';
   rounded?: boolean; // mantive pra não quebrar, mas não apliquei pq vc pediu sem mudar classes
   children?: ReactNode;
}

export const ButtonCustom = forwardRef<HTMLButtonElement, CustomButtonProps>(
   (
      {
         icon,
         text,
         disabled = false,
         loading = false,
         fullWidth = false,
         iconPosition = 'left',
         children,
         className,
         variant,
         size,
         ...props
      },
      ref,
   ) => {
      const renderIcon = () => {
         if (!icon) return null;
         return (
            <span className="my-auto flex shrink-0 items-center">{icon}</span>
         );
      };

      const renderContent = () => {
         const content = text || children;

         if (!content && !icon && !loading) return null;

         if (iconPosition === 'right') {
            return (
               <>
                  {loading ? (
                     <LoaderIcon className="animate-spin" />
                  ) : (
                     <>
                        {content && (
                           <span className="w-full truncate">{content}</span>
                        )}
                        {renderIcon()}
                     </>
                  )}
               </>
            );
         }

         return (
            <>
               {loading ? (
                  <LoaderIcon className="animate-spin" />
               ) : (
                  <>
                     {renderIcon()}
                     {content && (
                        <span className="w-full truncate">{content}</span>
                     )}
                  </>
               )}
            </>
         );
      };

      return (
         <Button
            ref={ref}
            className={cn(
               buttonVariants({ variant, size }),
               fullWidth && 'w-full',
               className,
            )}
            disabled={disabled || loading}
            {...props}
         >
            {renderContent()}
         </Button>
      );
   },
);

ButtonCustom.displayName = 'ButtonCustom';
