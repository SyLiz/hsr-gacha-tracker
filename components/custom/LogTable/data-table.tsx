"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { RiArrowLeftDoubleLine } from "react-icons/ri";
import { RiArrowRightDoubleLine } from "react-icons/ri";
import { RiArrowLeftSLine } from "react-icons/ri";
import { RiArrowRightSLine } from "react-icons/ri";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface RaritynFilters {
  "5-star": boolean;
  "4-star": boolean;
  "3-star": boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rarityFilters, setRarityFilters] = React.useState<RaritynFilters>({
    "5-star": true,
    "4-star": true,
    "3-star": false,
  });

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  React.useEffect(() => {
    var showRarityFilters = [];
    if (rarityFilters["3-star"]) showRarityFilters.push("3");
    if (rarityFilters["4-star"]) showRarityFilters.push("4");
    if (rarityFilters["5-star"]) showRarityFilters.push("5");
    if (showRarityFilters.length === 0) showRarityFilters = ["-99"];
    table.getColumn("rank_type")?.setFilterValue(showRarityFilters);
  }, [rarityFilters, table]);

  const handle5StarRarity = (value: boolean) => {
    setRarityFilters((state) => ({
      ...state,
      "5-star": value,
    }));
  };

  const handle4StarRarity = (value: boolean) => {
    setRarityFilters((state) => ({
      ...state,
      "4-star": value,
    }));
  };

  const handle3StarRarity = (value: boolean) => {
    setRarityFilters((state) => ({
      ...state,
      "3-star": value,
    }));
  };

  return (
    <div>
      <div className="flex items-center py-4 px-[16px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"outline"}>Rarity</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            <DropdownMenuItem
              onClick={() => handle5StarRarity(!rarityFilters["5-star"])}
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="5-star"
                  checked={rarityFilters["5-star"]}
                  onClick={() => handle5StarRarity(!rarityFilters["5-star"])}
                />
                <label>5-Star</label>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handle4StarRarity(!rarityFilters["4-star"])}
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="4-star"
                  checked={rarityFilters["4-star"]}
                  onClick={() => handle4StarRarity(!rarityFilters["4-star"])}
                />
                <label>4-Star</label>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handle3StarRarity(!rarityFilters["3-star"])}
              onSelect={(event) => event.preventDefault()}
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="3-star"
                  checked={rarityFilters["3-star"]}
                  onClick={() => handle3StarRarity(!rarityFilters["3-star"])}
                />
                <label>3-Star</label>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border h-full mx-[16px]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => {
                let rankType = row.getValue("rank_type");
                var textColor = "";
                switch (rankType) {
                  case "5":
                    textColor = "text-orange-400";
                    break;
                  case "4":
                    textColor = "text-purple-500";
                    break;
                }
                return (
                  <TableRow
                    className={`${textColor}`}
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 pr-[16px]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <RiArrowLeftDoubleLine />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <RiArrowLeftSLine />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <RiArrowRightSLine />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          <RiArrowRightDoubleLine />
        </Button>
      </div>
    </div>
  );
}
