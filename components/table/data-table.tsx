'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';

import { PaginationControls } from './pagination-controls';
import { ButtonTentarNovamente } from '../button-tentar-novamente';

export type Limit = 10 | 20 | 50 | 100;
interface PaginationConfig {
  pageIndex: number;
  pageSize: Limit;
  totalCount: number;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: Limit) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationConfig;
  isLoading?: boolean;
  error?: boolean;
  errorDescription?: string;
  refreshFetch: () => Promise<void>;
  selectedIds: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading = false,
  refreshFetch,
  error,
  selectedIds,
  errorDescription,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: !!pagination,
    ...(pagination
      ? {
          state: {
            pagination: {
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            },
            sorting,
          },
          pageCount: Math.ceil(
            pagination.totalCount / pagination.pageSize,
          ),
        }
      : {}),
  });

  return (
    <div className="flex min-h-[500px] max-w-full flex-col">
      <div className="max-w-full grow overflow-hidden rounded-md border">
        {error ? (
          <ButtonTentarNovamente
            descriptionErro={
              errorDescription ? errorDescription : ''
            }
            refreshFunction={refreshFetch}
          />
        ) : (
          <Table className="relative h-full min-h-fit flex-1 overflow-auto">
            <TableHeader className="bg-accent sticky top-0 items-center !uppercase">
              {table
                .getHeaderGroups()
                .map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="hover:bg-slate-500/10"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef
                                .header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody className="min-h-96 w-full overflow-y-auto">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={
                      row.getIsSelected() && 'selected'
                    }
                    className={
                      row.getIsSelected()
                        ? 'bg-primary/30 hover:bg-primary/20 items-center'
                        : 'items-center'
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const renderedCell = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      );

                      return (
                        <TableCell
                          key={cell.id}
                          className="h-full w-fit items-start text-base font-normal text-slate-600"
                        >
                          {renderedCell}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-96 text-center"
                  >
                    Sem resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      {pagination && (
        <PaginationControls
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          isLoading={isLoading}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
