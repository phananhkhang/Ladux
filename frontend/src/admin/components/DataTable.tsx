import { useMemo, useState, type ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
  searchValue?: (row: T) => string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  emptyLabel?: string;
  toolbarRight?: ReactNode;
  /** unique html id used for test-id prefixes */
  testId: string;
}

export function DataTable<T extends { id: string | number }>({
  rows,
  columns,
  searchPlaceholder = "Tìm kiếm…",
  emptyLabel = "Chưa có dữ liệu",
  toolbarRight,
  testId,
}: DataTableProps<T>) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.trim().toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const v = col.searchValue?.(row);
        return v && v.toLowerCase().includes(needle);
      })
    );
  }, [rows, columns, q]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pl-10 text-sm"
            data-testid={`${testId}-search`}
          />
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-300 transition-all hover:border-neon/40 hover:text-neon"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        {toolbarRight}
      </div>

      <Table data-testid={`${testId}-table`}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={cn(col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-sm text-zinc-500"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row) => (
              <TableRow key={row.id} data-testid={`${testId}-row-${row.id}`}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(col.className)}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3 text-xs text-zinc-500">
        <span>
          Hiển thị <span className="text-zinc-300">{filtered.length}</span> / {rows.length} bản ghi
        </span>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:border-neon/40 hover:text-neon">
            ← Trước
          </button>
          <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:border-neon/40 hover:text-neon">
            Sau →
          </button>
        </div>
      </div>
    </Card>
  );
}
