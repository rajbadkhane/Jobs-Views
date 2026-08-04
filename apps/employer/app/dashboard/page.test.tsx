import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "./page";

describe("employer dashboard shell", () => {
  it("renders employer dashboard", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    );
    expect(screen.getAllByText("Employer Dashboard").length).toBeGreaterThan(0);
    expect(screen.getByText("Open Jobs")).toBeTruthy();
    expect(screen.queryByText("Applications Trend")).toBeNull();
    expect(screen.getByText("Hiring Funnel")).toBeTruthy();
  });
});
