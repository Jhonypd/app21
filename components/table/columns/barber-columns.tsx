"use client";

import { columnsServiceTable } from "@/@types/service/service-columns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDownIcon, ClockIcon } from "lucide-react";

export const barberColumns = (
  selectedIds: string[],
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
  data: columnsServiceTable[],
): ColumnDef<columnsServiceTable>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => {
      const allRowIds = data.map((row) => row.id);
      return (
        <Checkbox
          checked={selectedIds.length === allRowIds.length}
          onCheckedChange={(value) => {
            setSelectedIds(value ? allRowIds : []);
          }}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      const serviceId = row.original.id;
      return (
        <Checkbox
          checked={selectedIds.includes(serviceId)}
          onCheckedChange={(value) => {
            setSelectedIds((prev) =>
              value
                ? [...prev, serviceId]
                : prev.filter((id) => id !== serviceId),
            );
          }}
          aria-label="Select row"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Serviço <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.getValue("name"),
    filterFn: "includesString",
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        R$ <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("price"),
    filterFn: "includesString",
  },
  {
    accessorKey: "basePrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Base <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("basePrice"),
    filterFn: "includesString",
  },
  {
    accessorKey: "timeService",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <ClockIcon className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("timeService"),
    filterFn: "includesString",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => row.getValue("isActive"),
    filterFn: "includesString",
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => <>{row.original.actions}</>,
  },
];
