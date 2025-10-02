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

interface PaginationControlsProps {
  pageIndex: number;
  pageSize: Limit;
  totalCount: number;
  isLoading: boolean;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: Limit) => void;
}

export function PaginationControls({
  pageIndex,
  pageSize,
  totalCount,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  return (
    <div className="mt-2 flex h-20 items-center justify-between border-t py-4">
      <div className="flex items-center space-x-2">
        <span className="text-xs text-[#3f4053] sm:text-sm">
          Itens por página
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            const newSize = parseInt(value, 10) as Limit;
            onPageSizeChange?.(newSize);
          }}
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

      <div className="flex flex-nowrap items-center space-x-2 text-[#3f4053]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(pageIndex - 1)}
          disabled={isLoading || pageIndex === 0}
          className="cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 cursor-pointer sm:ml-2" />
          <span className="hidden uppercase sm:block">
            Anterior
          </span>
        </Button>
        <div className="text-xs text-[#3f4053] sm:text-sm">
          {`${pageIndex * pageSize + 1}-${Math.min((pageIndex + 1) * pageSize, totalCount)} de ${totalCount}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(pageIndex + 1)}
          disabled={
            isLoading ||
            pageIndex >=
              Math.ceil(totalCount / pageSize) - 1
          }
          className="cursor-pointer"
        >
          <span className="hidden uppercase sm:block">
            Próximo
          </span>
          <ChevronRight className="h-4 w-4 cursor-pointer sm:ml-2" />
        </Button>
      </div>
    </div>
  );
}
