"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatRub } from "@/lib/format";
import { cn } from "@/lib/utils";

export type FinanceColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: FinanceColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  rowClassName?: (row: T) => string | undefined;
  emptyMessage?: string;
};

export function FinanceTable<T>({
  columns,
  rows,
  getRowKey,
  rowClassName,
  emptyMessage = "Нет данных",
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={getRowKey(row, index)} className={rowClassName?.(row)}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === "right" && "text-right tabular-nums",
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function rubCell(value: number | null | undefined) {
  return formatRub(value ?? null);
}

export function pctCell(value: number | null | undefined) {
  return formatPercent(value);
}
