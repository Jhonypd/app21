import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PlanningPokerCardProps {
  value: string | React.ReactElement;
  isSelected?: boolean;
  isRevealed?: boolean;
  isAnimatedMode?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PlanningPokerCard = ({
  value,
  isSelected = false,
  isRevealed = false,
  isAnimatedMode = false,
  onClick,
  className,
}: PlanningPokerCardProps) => {
  return (
    <Card
      className={cn(
        'relative h-28 w-20 cursor-pointer transition-all duration-300 sm:h-32 sm:w-24',
        'bg-gradient-card shadow-soft hover:shadow-card border-2',
        'group flex items-center justify-center',
        isSelected &&
          'border-primary bg-gradient-primary shadow-glow scale-105',
        !isSelected &&
          'border-border hover:border-primary/50 hover:scale-105',
        isRevealed && 'animate-pulse',
        isAnimatedMode &&
          'hover:shadow-glow hover:animate-bounce',
        isAnimatedMode &&
          isSelected &&
          'animate-scale-in shadow-glow',
        className,
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'text-2xl font-bold transition-colors duration-300 sm:text-3xl',
          isSelected
            ? 'text-primary-foreground'
            : 'text-foreground',
          'transition-transform duration-300 group-hover:scale-110',
          isAnimatedMode && 'group-hover:animate-pulse',
        )}
      >
        {value}
      </div>

      {/* Subtle background pattern */}
      <div
        className={cn(
          'from-primary to-accent absolute inset-0 rounded-lg bg-gradient-to-br opacity-5',
          isSelected && 'opacity-20',
        )}
      />

      {/* Selection indicator */}
      {isSelected && (
        <div
          className={cn(
            'bg-secondary border-background absolute -top-2 -right-2 h-4 w-4 rounded-full border-2',
            isAnimatedMode
              ? 'animate-bounce'
              : 'animate-pulse',
          )}
        />
      )}
    </Card>
  );
};
