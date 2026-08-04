import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "../admin/page";

describe("admin dashboard shell", () => {
  it("renders a dashboard skeleton while admin data resolves", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    );
    expect(screen.getByRole("status", { name: "Loading content" })).toBeTruthy();
  });
});
