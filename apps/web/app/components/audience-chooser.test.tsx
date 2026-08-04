import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AudienceChooser } from "./audience-chooser";

describe("audience chooser", () => {
  it("continues to the public homepage for job seekers", () => {
    const onContinue = vi.fn();
    render(<AudienceChooser onContinue={onContinue} />);
    fireEvent.click(screen.getByRole("button", { name: /i want a job/i }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("uses Escape as an accessible job-seeker continuation", () => {
    const onContinue = vi.fn();
    render(<AudienceChooser onContinue={onContinue} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
