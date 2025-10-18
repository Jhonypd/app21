'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Limit } from './data-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: Limit;
  totalCount: number;
  isLoading: boolean;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: Limit) => void;
}

// Componente memoizado para o seletor de itens por página
const PageSizeSelector = memo(
  ({
    pageSize,
    isLoading,
    onPageSizeChange,
  }: {
    pageSize: Limit;
    isLoading: boolean;
    onPageSizeChange?: (pageSize: Limit) => void;
  }) => {
    const handlePageSizeChange = useCallback(
      (value: string) => {
        const newSize = parseInt(value, 10) as Limit;
        onPageSizeChange?.(newSize);
      },
      [onPageSizeChange],
    );

    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-[#3f4053] sm:text-sm">
          Itens por página
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="h-8 w-fit cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-[60px] cursor-pointer">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
);

PageSizeSelector.displayName = 'PageSizeSelector';

// Componente memoizado para o botão de navegação
const PaginationButton = memo(
  ({
    direction,
    onClick,
    disabled,
    isLoading,
  }: {
    direction: 'previous' | 'next';
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
  }) => {
    const isPrevious = direction === 'previous';

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={disabled || isLoading}
        className="cursor-pointer"
      >
        {isPrevious ? (
          <>
            <ChevronLeft className="h-4 w-4 cursor-pointer sm:ml-2" />
            <span className="hidden uppercase sm:block">
              Anterior
            </span>
          </>
        ) : (
          <>
            <span className="hidden uppercase sm:block">
              Próximo
            </span>
            <ChevronRight className="h-4 w-4 cursor-pointer sm:ml-2" />
          </>
        )}
      </Button>
    );
  },
);

PaginationButton.displayName = 'PaginationButton';

// Componente memoizado para o indicador de página
const PageIndicator = memo(
  ({
    pageIndex,
    pageSize,
    totalCount,
  }: {
    pageIndex: number;
    pageSize: Limit;
    totalCount: number;
  }) => {
    const pageInfo = useMemo(() => {
      const start = pageIndex * pageSize + 1;
      const end = Math.min(
        (pageIndex + 1) * pageSize,
        totalCount,
      );
      return `${start}-${end} de ${totalCount}`;
    }, [pageIndex, pageSize, totalCount]);

    return (
      <div className="text-xs text-[#3f4053] sm:text-sm">
        {pageInfo}
      </div>
    );
  },
);

PageIndicator.displayName = 'PageIndicator';

export const PaginationControls = memo(
  function PaginationControls({
    pageIndex,
    pageSize,
    totalCount,
    isLoading,
    onPageChange,
    onPageSizeChange,
  }: PaginationControlsProps) {
    // Calcular estados de desabilitação memoizados
    const { isPreviousDisabled, isNextDisabled } = useMemo(
      () => ({
        isPreviousDisabled: pageIndex === 0,
        isNextDisabled:
          pageIndex >= Math.ceil(totalCount / pageSize) - 1,
      }),
      [pageIndex, totalCount, pageSize],
    );

    // Handlers memoizados para navegação
    const handlePreviousPage = useCallback(() => {
      onPageChange?.(pageIndex - 1);
    }, [onPageChange, pageIndex]);

    const handleNextPage = useCallback(() => {
      onPageChange?.(pageIndex + 1);
    }, [onPageChange, pageIndex]);

    return (
      <div className="mt-2 flex h-20 items-center justify-between border-t py-4">
        <PageSizeSelector
          pageSize={pageSize}
          isLoading={isLoading}
          onPageSizeChange={onPageSizeChange}
        />

        <div className="flex flex-nowrap items-center space-x-2 text-[#3f4053]">
          <PaginationButton
            direction="previous"
            onClick={handlePreviousPage}
            disabled={isPreviousDisabled}
            isLoading={isLoading}
          />

          <PageIndicator
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalCount={totalCount}
          />

          <PaginationButton
            direction="next"
            onClick={handleNextPage}
            disabled={isNextDisabled}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  },
);

PaginationControls.displayName = 'PaginationControls';
