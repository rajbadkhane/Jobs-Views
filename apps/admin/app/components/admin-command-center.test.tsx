import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAdminData = vi.hoisted(() => vi.fn());
vi.mock("@career-os/hooks", () => ({ useAdminData }));

import { AdminCommandCenter } from "./admin-command-center";

const query = (data: unknown) => ({ data, isPending: false });

describe("admin command center", () => {
  beforeEach(() => useAdminData.mockReturnValue({ users: query({ items: [{ id: "u1", email: "owner@example.com", role: "EMPLOYER" }] }), companies: query({ items: [] }), jobs: query({ items: [] }), plans: query({ items: [] }) }));
  it("opens with Ctrl K and searches admin entities", () => {
    render(<AdminCommandCenter />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "owner" } });
    expect(screen.getByText("owner@example.com")).toBeTruthy();
    expect(screen.getByText("EMPLOYER")).toBeTruthy();
  });
});
