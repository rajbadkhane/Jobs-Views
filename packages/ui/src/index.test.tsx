import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, EmptyState, ErrorState, ResilientImage } from "./index";

describe("ui primitives", () => {
  it("renders buttons", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  it("renders empty states", () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByText("No results")).toBeTruthy();
  });

  it("prevents duplicate button clicks while loading", () => {
    render(<Button loading onClick={() => undefined}>Save</Button>);
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("maps network failures to an offline recovery state", () => {
    render(<ErrorState error={{ code: "ERR_NETWORK", message: "Network Error" }} onRetry={() => undefined} />);
    expect(screen.getByText("You're offline")).toBeTruthy();
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
  });

  it("shows a fallback when an image fails", () => {
    render(<ResilientImage src="/missing.png" alt="Company logo" fallbackLabel="Company" />);
    fireEvent.error(screen.getByAltText("Company logo"));
    expect(screen.getByRole("img", { name: "Company logo" })).toBeTruthy();
  });
});
