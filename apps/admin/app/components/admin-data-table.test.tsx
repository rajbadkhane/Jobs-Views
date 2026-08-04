import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AdminDataTable } from "./admin-data-table";

const rows = [{ id: "2", name: "Zulu", status: "active" }, { id: "1", name: "Alpha", status: "pending" }];
const columns = [{ id: "name", header: "Name", hideable: false, sortValue: (row: typeof rows[number]) => row.name, cell: (row: typeof rows[number]) => row.name }, { id: "status", header: "Status", sortValue: (row: typeof rows[number]) => row.status, cell: (row: typeof rows[number]) => row.status }];

describe("admin data table", () => {
  it("sorts, selects, changes density, and opens rows with the keyboard", () => {
    const open = vi.fn(); const selected = new Set<string>(); const selectedChange = vi.fn();
    render(<AdminDataTable label="Records" rows={rows} columns={columns} rowKey={(row) => row.id} onOpen={open} selected={selected} onSelectedChange={selectedChange} emptyTitle="No rows" emptyDescription="Nothing here" />);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    const tableRows = screen.getAllByRole("row");
    expect(tableRows[1].textContent).toContain("Alpha");
    fireEvent.click(screen.getAllByLabelText("Select row 1")[0]);
    expect(selectedChange).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Table density"), { target: { value: "comfortable" } });
    fireEvent.keyDown(tableRows[1], { key: "Enter" });
    expect(open).toHaveBeenCalledWith(rows[1]);
  });
});
