'use client';

import { useEffect, useState } from 'react';
import { GiCoffeeCup } from 'react-icons/gi';
import clsx from 'clsx';
import '../app/globals.css';

type LoadingType =
  | 'default'
  | 'page-transition'
  | 'transaction';

interface LoadingPageProps {
  active: boolean;
  type?: LoadingType;
  className?: string;
}

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

const ANIMATIONS = [
  'animate-flip-right',
  'animate-flip-left',
  'animate-flip-up',
  'animate-flip-down',
];

const Loading = ({
  active,
  type = 'default',
  className = '',
}: LoadingPageProps) => {
  const isOverlay =
    type === 'page-transition' || type === 'transaction';

  const [currentValue, setCurrentValue] = useState(
    FIBONACCI_VALUES[0],
  );
  const [animation, setAnimation] = useState(
    'animate-flip-right',
  );

  useEffect(() => {
    if (active && type === 'default') {
      const interval = setInterval(() => {
        // sorteia novo valor diferente
        let nextValue = currentValue;
        while (nextValue === currentValue) {
          nextValue =
            FIBONACCI_VALUES[
              Math.floor(
                Math.random() * FIBONACCI_VALUES.length,
              )
            ];
        }
        setCurrentValue(nextValue);

        // sorteia animação
        const randomAnim =
          ANIMATIONS[
            Math.floor(Math.random() * ANIMATIONS.length)
          ];
        setAnimation(randomAnim);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [active, type, currentValue]);

  // Impede scroll da página enquanto ativo
  useEffect(() => {
    if (active && isOverlay) {
      document.body.classList.add('overflow-hidden');
      return () => {
        document.body.classList.remove('overflow-hidden');
      };
    }
    if (!active) {
      document.body.classList.remove('overflow-hidden');
    }
  }, [active, isOverlay]);

  if (!active) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[9999999999] flex items-center justify-center',
        isOverlay ? 'pointer-events-auto bg-black/60' : '',
        className,
      )}
    >
      {type === 'default' && (
        <div className="relative h-24 w-24 [perspective:1000px]">
          <div
            key={String(currentValue) + animation}
            className={clsx(
              'absolute inset-0 flex items-center justify-center text-4xl font-bold text-white',
              'bg-primary rounded-lg shadow-lg',
              animation,
            )}
          >
            {currentValue}
          </div>
        </div>
      )}

      {type === 'page-transition' && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {type === 'transaction' && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;
