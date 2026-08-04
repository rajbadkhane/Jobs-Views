import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: () => ({ has: () => true }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import Page from "./page";

describe("web shell", () => {
  it("renders the product name", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <Page />
      </QueryClientProvider>
    );
    expect(screen.getByRole("heading", { name: /find work you can trust/i })).toBeTruthy();
    expect(screen.getAllByText("Jobs View", { exact: false }).length).toBeGreaterThan(0);
  });
});
