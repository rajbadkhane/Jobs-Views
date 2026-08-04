"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Columns3, GripVertical, Rows3, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Badge, Button, EmptyState } from "@career-os/ui";
import { cn } from "@career-os/utils";

export type AdminColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | boolean | undefined;
  width?: number;
  hideable?: boolean;
};

type BulkAction = { label: string; intent?: "default" | "danger"; onClick: () => void; disabled?: boolean };

export function AdminDataTable<T>({
  label,
  rows,
  columns,
  rowKey,
  onOpen,
  selected,
  onSelectedChange,
  bulkActions = [],
  emptyTitle,
  emptyDescription,
  search,
  onSearch,
  filters
}: {
  label: string;
  rows: T[];
  columns: AdminColumn<T>[];
  rowKey: (row: T) => string;
  onOpen?: (row: T) => void;
  selected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  bulkActions?: BulkAction[];
  emptyTitle: string;
  emptyDescription: string;
  search?: string;
  onSearch?: (value: string) => void;
  filters?: React.ReactNode;
}) {
  const [sort, setSort] = useState<{ id: string; direction: "asc" | "desc" } | null>(null);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(columns.map((column) => [column.id, column.width ?? 180])));
  const [scrollTop, setScrollTop] = useState(0);
  const visibleColumns = columns.filter((column) => !hidden.has(column.id));
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return rows;
    return [...rows].sort((a, b) => compare(column.sortValue?.(a), column.sortValue?.(b)) * (sort.direction === "asc" ? 1 : -1));
  }, [columns, rows, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const allPageSelected = Boolean(pageRows.length) && pageRows.every((row) => selected?.has(rowKey(row)));
  const rowHeight = density === "compact" ? 45 : 57;
  const virtual = pageRows.length > 50;
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 4) : 0;
  const virtualCount = virtual ? Math.ceil(620 / rowHeight) + 8 : pageRows.length;
  const renderedRows = virtual ? pageRows.slice(virtualStart, virtualStart + virtualCount) : pageRows;
  const topSpacer = virtualStart * rowHeight;
  const bottomSpacer = virtual ? Math.max(0, (pageRows.length - virtualStart - renderedRows.length) * rowHeight) : 0;
  const tableRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setScrollTop(0); if (tableRef.current) tableRef.current.scrollTop = 0; }, [density, pageSize, safePage]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!columnsRef.current?.contains(event.target as Node)) setColumnsOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setColumnsOpen(false); };
    document.addEventListener("pointerdown", outside);
    window.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("keydown", escape); };
  }, []);

  const toggleAll = () => {
    if (!selected || !onSelectedChange) return;
    const next = new Set(selected);
    pageRows.forEach((row) => allPageSelected ? next.delete(rowKey(row)) : next.add(rowKey(row)));
    onSelectedChange(next);
  };
  const toggleRow = (id: string) => {
    if (!selected || !onSelectedChange) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectedChange(next);
  };
  const resize = (id: string, event: React.PointerEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = widths[id] ?? 180;
    const move = (pointer: PointerEvent) => setWidths((current) => ({ ...current, [id]: Math.max(120, startWidth + pointer.clientX - startX) }));
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };
  const rowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, index: number, row: T) => {
    if (event.key === "Enter" && onOpen) onOpen(row);
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next = index + (event.key === "ArrowDown" ? 1 : -1);
    tableRef.current?.querySelector<HTMLElement>(`[data-admin-row="${next}"]`)?.focus();
  };

  return (
    <section aria-label={label} className="overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] shadow-career-sm">
      <div className="flex flex-col gap-3 border-b border-[var(--cos-outline-variant)] p-3 lg:flex-row lg:items-center">
        {onSearch ? <label className="relative min-w-0 flex-1"><span className="sr-only">Search {label}</span><Search size={16} className="pointer-events-none absolute left-3 top-3 text-[var(--cos-on-surface-variant)]" /><input value={search ?? ""} onChange={(event) => { onSearch(event.target.value); setPage(1); }} className="h-10 w-full rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] pl-9 pr-3 text-sm outline-none focus:border-[var(--cos-primary)] focus:ring-2 focus:ring-[var(--cos-focus-ring)]" placeholder={`Search ${label.toLowerCase()}`} /></label> : null}
        {filters}
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor={`${label}-density`}>Table density</label>
          <select id={`${label}-density`} value={density} onChange={(event) => setDensity(event.target.value as typeof density)} className="h-10 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 text-sm"><option value="compact">Compact</option><option value="comfortable">Comfortable</option></select>
          <div className="relative" ref={columnsRef}><button type="button" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] px-3 text-sm font-semibold"><Columns3 size={16} /> Columns <ChevronDown size={14} className={cn("transition", columnsOpen && "rotate-180")} /></button>{columnsOpen ? <div className="absolute right-0 z-30 mt-2 w-56 rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] p-2 shadow-career-floating">{columns.filter((column) => column.hideable !== false).map((column) => <label key={column.id} className="flex min-h-10 items-center gap-2 rounded px-2 text-sm hover:bg-[var(--cos-surface-container-low)]"><input type="checkbox" checked={!hidden.has(column.id)} onChange={() => { setHidden((current) => { const next = new Set(current); next.has(column.id) ? next.delete(column.id) : next.add(column.id); return next; }); setColumnsOpen(false); }} />{column.header}</label>)}</div> : null}</div>
        </div>
      </div>
      {selected && selected.size > 0 ? <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] px-4 py-2" role="toolbar" aria-label="Bulk actions"><Badge tone="info">{selected.size} selected</Badge>{bulkActions.map((action) => <Button key={action.label} size="sm" variant={action.intent === "danger" ? "danger" : "secondary"} disabled={action.disabled} onClick={action.onClick}>{action.label}</Button>)}<Button size="sm" variant="ghost" onClick={() => onSelectedChange?.(new Set())}>Clear</Button></div> : null}
      {!rows.length ? <div className="p-5"><EmptyState title={emptyTitle} description={emptyDescription} icon={<Rows3 size={18} />} /></div> : (<>
        <div className="grid gap-3 p-3 md:hidden" role="list" aria-label={`${label} records`}>
          {pageRows.map((row) => { const id = rowKey(row); return <article key={id} role="listitem" className="rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)] p-3">
            <div className="flex min-h-12 items-center gap-3">
              {selected ? <input type="checkbox" aria-label={`Select row ${id}`} checked={selected.has(id)} onChange={() => toggleRow(id)} className="h-5 w-5 shrink-0" /> : null}
              <button type="button" disabled={!onOpen} onClick={() => onOpen?.(row)} className="min-w-0 flex-1 text-left font-semibold disabled:cursor-default">{visibleColumns[0]?.cell(row)}</button>
              {onOpen ? <ChevronRight size={17} className="shrink-0 text-[var(--cos-on-surface-variant)]" aria-hidden="true" /> : null}
            </div>
            <dl className="mt-2 grid gap-2">
              {visibleColumns.slice(1).map((column) => <div key={column.id} className="grid grid-cols-[minmax(6rem,0.4fr)_minmax(0,1fr)] gap-3 border-t border-[var(--cos-outline-variant)] pt-2"><dt className="text-xs font-bold uppercase text-[var(--cos-on-surface-variant)]">{column.header}</dt><dd className="min-w-0 break-words text-sm">{column.cell(row)}</dd></div>)}
            </dl>
          </article>; })}
        </div>
        <div ref={tableRef} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)} className="hidden max-h-[min(68vh,760px)] overflow-auto md:block" role="region" aria-label={`${label} table`} tabIndex={0}>
          <table className="w-max min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-20 bg-[var(--cos-surface-container-low)] shadow-[0_1px_0_var(--cos-outline-variant)]"><tr>
              {selected ? <th className="sticky left-0 z-30 w-11 bg-[var(--cos-surface-container-low)] px-3 py-3"><input type="checkbox" aria-label="Select all rows on this page" checked={allPageSelected} onChange={toggleAll} /></th> : null}
              {visibleColumns.map((column, index) => <th key={column.id} style={{ width: widths[column.id], minWidth: widths[column.id] }} className={cn("relative px-3 py-3 text-xs font-bold uppercase text-[var(--cos-on-surface-variant)]", index === 0 && "sticky z-20 bg-[var(--cos-surface-container-low)]", index === 0 && (selected ? "left-11" : "left-0"))}><button type="button" disabled={!column.sortValue} className="inline-flex items-center gap-1 disabled:cursor-default" onClick={() => setSort((current) => current?.id === column.id ? { id: column.id, direction: current.direction === "asc" ? "desc" : "asc" } : { id: column.id, direction: "asc" })}>{column.header}{sort?.id === column.id ? <span aria-label={`sorted ${sort.direction}`}>{sort.direction === "asc" ? "↑" : "↓"}</span> : null}</button><button type="button" aria-label={`Resize ${column.header} column`} className="absolute inset-y-0 right-0 w-3 cursor-col-resize touch-none text-[var(--cos-outline)]" onPointerDown={(event) => resize(column.id, event)}><GripVertical size={12} /></button></th>)}
            </tr></thead>
            <tbody>{topSpacer ? <tr aria-hidden="true"><td colSpan={visibleColumns.length + (selected ? 1 : 0)} style={{ height: topSpacer }} /></tr> : null}{renderedRows.map((row, renderedIndex) => { const index = virtualStart + renderedIndex; const id = rowKey(row); return <tr key={id} data-admin-row={index} tabIndex={0} onKeyDown={(event) => rowKeyDown(event, index, row)} onClick={(event) => { if (onOpen && !(event.target as HTMLElement).closest("button,a,input,select")) onOpen(row); }} className={cn("group border-b outline-none hover:bg-[var(--cos-surface-container-low)] focus:bg-[var(--cos-surface-container-low)]", onOpen && "cursor-pointer")}>
              {selected ? <td className="sticky left-0 z-10 w-11 border-b border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)] px-3 group-hover:bg-[var(--cos-surface-container-low)]"><input type="checkbox" aria-label={`Select row ${id}`} checked={selected.has(id)} onChange={() => toggleRow(id)} /></td> : null}
              {visibleColumns.map((column, columnIndex) => <td key={column.id} style={{ width: widths[column.id], minWidth: widths[column.id], height: rowHeight }} className={cn("border-b border-[var(--cos-outline-variant)] px-3", columnIndex === 0 && "sticky z-10 font-semibold", columnIndex === 0 && (selected ? "left-11" : "left-0"), columnIndex === 0 && "bg-[var(--cos-surface-container-lowest)] group-hover:bg-[var(--cos-surface-container-low)]")}>{column.cell(row)}</td>)}
            </tr>; })}{bottomSpacer ? <tr aria-hidden="true"><td colSpan={visibleColumns.length + (selected ? 1 : 0)} style={{ height: bottomSpacer }} /></tr> : null}</tbody>
          </table>
        </div>
      </>)}
      {rows.length ? <div className="flex flex-col gap-3 border-t border-[var(--cos-outline-variant)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[var(--cos-on-surface-variant)]">{(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, sorted.length)} of {sorted.length}</p><div className="flex items-center gap-2"><label className="text-sm">Rows <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="ml-1 h-9 rounded border border-[var(--cos-outline-variant)] bg-transparent px-2"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label><Button variant="ghost" size="icon" aria-label="Previous page" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={17} /></Button><span className="text-sm">{safePage} / {totalPages}</span><Button variant="ghost" size="icon" aria-label="Next page" disabled={safePage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ChevronRight size={17} /></Button></div></div> : null}
    </section>
  );
}

function compare(a: string | number | boolean | undefined, b: string | number | boolean | undefined) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
}
