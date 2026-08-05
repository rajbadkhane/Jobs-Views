import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useJobsSearch = vi.hoisted(() => vi.fn());
const navigation = vi.hoisted(() => ({
  query: "",
  push: vi.fn(),
  replace: vi.fn()
}));
const noopMutation = vi.hoisted(() => () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }));

vi.mock("@career-os/hooks", () => ({
  useJobsSearch,
  useSession: () => ({ data: undefined, isPending: false }),
  useCandidateData: () => ({ savedJobs: { data: { items: [] }, isPending: false } }),
  useCandidateActions: () => ({
    saveJob: noopMutation(),
    removeSavedJob: noopMutation()
  })
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/jobs",
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.query)
}));

import { JobSearchExperience } from "./job-search-experience";

describe("job search states", () => {
  beforeEach(() => {
    useJobsSearch.mockReset();
    navigation.query = "";
    navigation.push.mockReset();
    navigation.replace.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => { vi.useRealTimers(); });

  it("renders job-card skeletons while searching", () => {
    useJobsSearch.mockReturnValue({ data: undefined, isPending: true, isFetching: true, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);
    expect(screen.getByRole("status", { name: "Loading jobs" })).toBeTruthy();
  });

  it("renders an actionable empty state without demo jobs", () => {
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);
    expect(screen.getByText("No jobs match your filters")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
    expect(screen.queryByText("Aarunya Cloud")).toBeNull();
  });

  it("renders a recoverable network error", () => {
    useJobsSearch.mockReturnValue({ data: undefined, isPending: false, isFetching: false, isError: true, error: { code: "ERR_NETWORK", message: "Network Error" }, refetch: vi.fn() });
    render(<JobSearchExperience />);
    expect(screen.getByText("You're offline")).toBeTruthy();
    expect(screen.getByRole("button", { name: /retry/i })).toBeTruthy();
  });

  it("maps URL filters to the existing jobs API query", () => {
    navigation.query = "q=react&location=Indore&type=full-time&mode=hybrid&salary=1000000&experience=3&sort=newest";
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);

    expect(useJobsSearch).toHaveBeenCalledWith(expect.objectContaining({
      q: "react",
      city: "Indore",
      job_type: "full-time",
      work_mode: "hybrid",
      salary_min: 1000000,
      experience: 3,
      sort: "latest"
    }));
    expect(screen.getAllByRole("button", { name: /react/i }).length).toBeGreaterThan(0);
  });

  it("debounces keyword URL updates by 300ms", () => {
    vi.useFakeTimers();
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);
    const input = screen.getByRole("combobox", { name: /search jobs/i });

    fireEvent.change(input, { target: { value: "react" } });
    act(() => vi.advanceTimersByTime(299));
    expect(navigation.push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(navigation.push).toHaveBeenCalledWith("/jobs?q=react", { scroll: false });
  });

  it("restores search fields when URL state changes", () => {
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    navigation.query = "q=react&location=Pune";
    const view = render(<JobSearchExperience />);
    expect((screen.getByRole("combobox", { name: /search jobs/i }) as HTMLInputElement).value).toBe("react");
    expect((screen.getByPlaceholderText("City, state, or remote") as HTMLInputElement).value).toBe("Pune");

    navigation.query = "q=python&location=Indore";
    view.rerender(<JobSearchExperience />);
    expect((screen.getByRole("combobox", { name: /search jobs/i }) as HTMLInputElement).value).toBe("python");
    expect((screen.getByPlaceholderText("City, state, or remote") as HTMLInputElement).value).toBe("Indore");
  });

  it("supports keyboard selection in search suggestions", () => {
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);
    const input = screen.getByRole("combobox", { name: /search jobs/i });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "rea" } });
    expect(screen.getByRole("option", { name: /skills/i })).toBeTruthy();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(navigation.push).toHaveBeenCalledWith("/jobs?skills=react", { scroll: false });
  });

  it("persists and restores saved filter combinations", () => {
    window.localStorage.setItem("jobsview.job-search.saved-filters", JSON.stringify([{ id: "saved-1", name: "Remote React", params: "q=react&mode=remote" }]));
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Remote React" }));
    expect(navigation.push).toHaveBeenCalledWith("/jobs?q=react&mode=remote", { scroll: false });
  });

  it("remembers compact result view", () => {
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);

    fireEvent.click(screen.getByRole("button", { name: "Compact list view" }));
    expect(window.localStorage.getItem("jobsview.job-search.view")).toBe("compact");
  });

  it("allows individual recent searches to be removed", () => {
    window.localStorage.setItem("jobsview.job-search.history", JSON.stringify(["React developer", "Data analyst"]));
    useJobsSearch.mockReturnValue({ data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    render(<JobSearchExperience />);
    fireEvent.focus(screen.getByRole("combobox", { name: /search jobs/i }));

    fireEvent.click(screen.getByRole("button", { name: "Remove React developer from search history" }));
    expect(JSON.parse(window.localStorage.getItem("jobsview.job-search.history") ?? "[]")).toEqual(["Data analyst"]);
  });
});
