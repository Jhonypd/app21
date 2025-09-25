import { GiCoffeeCup } from 'react-icons/gi';
import { PlanningPokerCard } from './PlanningPokerCard';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React from 'react';

interface VotingDeckProps {
  selectedValue?: string | React.ReactElement;
  onVoteSelect: (
    value: string | React.ReactElement,
  ) => void;
  isDisabled?: boolean;
  isAnimatedMode?: boolean;
}

// Fibonacci sequence commonly used in Planning Poker
const COFFEE_CUP = <GiCoffeeCup key="coffee-cup" />;
const FIBONACCI_VALUES: (string | React.ReactElement)[] = [
  '0',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '21',
  '34',
  '55',
  '89',
  '?',
  COFFEE_CUP,
];

export const VotingDeck = ({
  selectedValue,
  onVoteSelect,
  isDisabled = false,
  isAnimatedMode = false,
}: VotingDeckProps) => {
  return (
    <Card className="bg-gradient-card border-border shadow-card p-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-lg">
          Escolha sua estimativa
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Clique em um card para votar. Use{' '}
          <span className="font-bold">&quot;?&quot;</span>
          se não souber estimar.
        </p>
      </CardHeader>

      <CardContent className="p-3">
        <div className="flex flex-wrap justify-center gap-1 sm:gap-3">
          {FIBONACCI_VALUES.map((value, idx) => (
            <PlanningPokerCard
              key={
                typeof value === 'string'
                  ? value
                  : `special-${idx}`
              }
              value={value}
              isSelected={selectedValue === value}
              isAnimatedMode={isAnimatedMode}
              onClick={() =>
                !isDisabled && onVoteSelect(value)
              }
              className={
                isDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : ''
              }
            />
          ))}
        </div>

        {selectedValue && (
          <div className="bg-primary/5 border-primary/20 mt-6 rounded-lg border p-4 text-center">
            <p className="text-muted-foreground mb-1 text-sm">
              Seu voto:
            </p>
            <p className="text-primary text-2xl font-bold">
              {selectedValue}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
