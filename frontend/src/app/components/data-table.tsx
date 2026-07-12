import { useMemo, useState, ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Inbox } from "lucide-react";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchable = true,
  searchKeys,
  loading = false,
  toolbar,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string | number;
  searchable?: boolean;
  searchKeys?: (row: T) => string;
  loading?: boolean;
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const processed = useMemo(() => {
    let list = rows;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      list = list.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        list = [...list].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return list;
  }, [rows, query, sortKey, sortDir, columns, searchKeys]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-9" />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">{toolbar}</div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.sortable ? (
                    <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(c.key)}>
                      {c.header}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                      ) : <ArrowUpDown size={12} className="opacity-40" />}
                    </button>
                  ) : c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : processed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <Inbox size={32} className="text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No records found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processed.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>{c.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
