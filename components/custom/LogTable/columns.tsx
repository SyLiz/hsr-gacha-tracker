"use client";

import { Log } from "@/models/GachaLog";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Log>[] = [
  {
    header: "Roll#",
    id: "roll",
    cell: ({ row, table }) => {
      const sortList = table.getCoreRowModel()?.flatRows;
      let index = sortList?.findIndex((flatRow) => flatRow.id === row.id) || 0;
      return sortList.length - index;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "rank_type",
    header: "Rarity",
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "item_type",
    header: "Type",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
];
