'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import DataTableCell from '@/components/table/row-cell';
import { HeaderTable } from '@/components/table/data-header-table';
import CheckboxHeader from '@/components/table/checkbox-header';
import DataTableEditCell from '@/components/table/row-cell-edit';
import {
  ColumnsIntegrantesProjetos,
  ColumnsProjetos,
} from '../types';

interface ProjetosColumnsProps {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  data: ColumnsProjetos[];
  onEdit: (id: string) => void;
}

interface IntegrantesProjetosColumnsProps {
  data: ColumnsIntegrantesProjetos[];
}

export const projetosColumns = ({
  selectedIds,
  setSelectedIds,
  data,
  onEdit,
}: ProjetosColumnsProps): ColumnDef<ColumnsProjetos>[] => [
  {
    accessorKey: 'selected',
    header: () => {
      // console.log({ data });
      const allRowIds = data.map((row) => row.id);
      const isAllSelected =
        selectedIds.length === allRowIds.length;
      const isIndeterminate =
        selectedIds.length > 0 &&
        selectedIds.length < allRowIds.length;
      return (
        <CheckboxHeader
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onToggleAll={(checked) => {
            setSelectedIds(checked ? allRowIds : []);
          }}
        />
      );
    },

    cell: ({ row }) => {
      const equipeId = row.original.id;
      return (
        <div className="inline-flex h-7 items-center justify-center">
          <Checkbox
            checked={selectedIds.includes(equipeId)}
            onCheckedChange={(value) => {
              setSelectedIds((prev) =>
                value
                  ? [...prev, equipeId]
                  : prev.filter((id) => id !== equipeId),
              );
            }}
            aria-label="Selecionar linha"
            className="h-[18px] w-[18px] rounded-xs border-slate-400"
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'editar',
    header: ({ column }) => {
      return (
        <HeaderTable
          label="Editar"
          column={column}
          sortable={false}
        />
      );
    },
    cell: ({ row }) => (
      <DataTableEditCell
        id={row.original.id}
        onEdit={(id) => {
          onEdit(id);
        }}
      />
    ),
  },
  {
    accessorKey: 'nome',
    header: ({ column }) => {
      return (
        <HeaderTable
          label="Nome"
          column={column}
        />
      );
    },
    cell: (cell) => (
      <DataTableCell
        className="text-nowrap"
        cell={cell}
      />
    ),
    filterFn: 'includesString',
  },
  {
    accessorKey: 'gerente',
    header: ({ column }) => {
      return (
        <HeaderTable
          label="Gerente"
          column={column}
        />
      );
    },
    cell: (cell) => <DataTableCell cell={cell} />,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'inativo',
    header: ({ column }) => {
      return (
        <HeaderTable
          label="Status"
          column={column}
        />
      );
    },
    cell: (cell) => <DataTableCell cell={cell} />,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'integrantes',
    header: ({ column }) => {
      return (
        <HeaderTable
          label="Integrantes"
          column={column}
          sortable={false}
        />
      );
    },
    cell: (cell) => <DataTableCell cell={cell} />,
    filterFn: 'includesString',
  },
];

export const IntegrantesProjetosColumns =
  ({}: IntegrantesProjetosColumnsProps): ColumnDef<ColumnsIntegrantesProjetos>[] => [
    {
      accessorKey: 'nome',
      header: ({ column }) => {
        return (
          <HeaderTable
            label="Nome"
            column={column}
          />
        );
      },
      cell: (cell) => (
        <DataTableCell
          className="text-nowrap"
          cell={cell}
        />
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'cargo',
      header: ({ column }) => {
        return (
          <HeaderTable
            label="Cargo"
            column={column}
          />
        );
      },
      cell: (cell) => <DataTableCell cell={cell} />,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'inativo',
      header: ({ column }) => {
        return (
          <HeaderTable
            label="Status"
            column={column}
          />
        );
      },
      cell: (cell) => <DataTableCell cell={cell} />,
      filterFn: 'includesString',
    },
  ];
