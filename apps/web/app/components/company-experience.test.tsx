import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useCompaniesSearch = vi.hoisted(() => vi.fn());
const useCompanyBySlug = vi.hoisted(() => vi.fn());
const useCompanyBranches = vi.hoisted(() => vi.fn());
const useJobsSearch = vi.hoisted(() => vi.fn());
const navigation = vi.hoisted(() => ({ query: "", push: vi.fn(), replace: vi.fn() }));

vi.mock("@career-os/hooks", () => ({ useCompaniesSearch, useCompanyBySlug, useCompanyBranches, useJobsSearch }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/companies",
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.query)
}));

import { CompanyDetail, CompanyDirectory } from "./company-experience";

const idleQuery = { data: { items: [] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() };

describe("company experience states", () => {
  beforeEach(() => {
    useCompaniesSearch.mockReset();
    useCompanyBySlug.mockReset();
    useCompanyBranches.mockReset();
    useJobsSearch.mockReset();
    navigation.query = "";
    navigation.push.mockReset();
    navigation.replace.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => { vi.useRealTimers(); });

  it("shows an actionable empty company directory", () => {
    useCompaniesSearch.mockReturnValue(idleQuery);
    render(<CompanyDirectory />);
    expect(screen.getByText("No companies available")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse jobs" })).toBeTruthy();
  });

  it("shows a company-specific not-found state", () => {
    useCompanyBySlug.mockReturnValue({ data: undefined, isPending: false, isFetching: false, isError: true, error: { response: { status: 404 } }, refetch: vi.fn() });
    render(<CompanyDetail slug="missing-company" />);
    expect(screen.getByText("Company not found")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse companies" })).toBeTruthy();
  });

  it("maps synchronized URL filters to supported API parameters", () => {
    navigation.query = "q=cloud&industry=SaaS&location=Pune&verified=true&size=51-200&sort=name&page=2";
    useCompaniesSearch.mockReturnValue(idleQuery);
    render(<CompanyDirectory />);

    expect(useCompaniesSearch).toHaveBeenCalledWith({
      q: "cloud",
      industry: "SaaS",
      location: "Pune",
      verified: true,
      sort: "name",
      limit: 18,
      page: 2
    });
    expect((screen.getByRole("combobox", { name: /search company name/i }) as HTMLInputElement).value).toBe("cloud");
    expect((screen.getByPlaceholderText("Headquarters or city") as HTMLInputElement).value).toBe("Pune");
  });

  it("debounces company search by 300ms", () => {
    vi.useFakeTimers();
    useCompaniesSearch.mockReturnValue(idleQuery);
    render(<CompanyDirectory />);
    const input = screen.getByRole("combobox", { name: /search company name/i });
    fireEvent.change(input, { target: { value: "infosys" } });
    act(() => vi.advanceTimersByTime(299));
    expect(navigation.push).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(navigation.push).toHaveBeenCalledWith("/companies?q=infosys", { scroll: false });
  });

  it("renders live company fields and does not invent a rating", () => {
    useCompaniesSearch.mockReturnValue({ ...idleQuery, data: { items: [{ id: "c1", name: "Aarunya Cloud", slug: "aarunya-cloud", industry: "SaaS", headquarters: "Bengaluru", size_range: "51-200", founded_year: 2018, is_verified: true, description: "Cloud infrastructure for modern teams." }] } });
    render(<CompanyDirectory />);
    expect(screen.getByRole("link", { name: "Aarunya Cloud" })).toBeTruthy();
    expect(screen.getAllByText("51-200 employees").length).toBeGreaterThan(0);
    expect(screen.getByText("Founded 2018")).toBeTruthy();
    expect(screen.queryByText(/rating/i)).toBeNull();
  });

  it("persists the frontend follow state", () => {
    useCompaniesSearch.mockReturnValue({ ...idleQuery, data: { items: [{ id: "c1", name: "Aarunya Cloud", slug: "aarunya-cloud" }] } });
    render(<CompanyDirectory />);
    fireEvent.click(screen.getByRole("button", { name: "Follow" }));
    expect(window.localStorage.getItem("jobsview.followed-companies")).toBe('["c1"]');
    expect(screen.getByRole("button", { name: "Following" })).toBeTruthy();
  });

  it("renders company profile, real branches, open jobs, and related companies", () => {
    useCompanyBySlug.mockReturnValue({ data: { id: "c1", name: "Aarunya Cloud", slug: "aarunya-cloud", industry: "SaaS", headquarters: "Bengaluru", size_range: "51-200", founded_year: 2018, is_verified: true, about: "A live company overview.", mission: "Build dependable cloud software.", culture: "Thoughtful and collaborative.", benefits: ["Health insurance"] }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    useJobsSearch.mockReturnValue({ ...idleQuery, data: { items: [{ id: "j1", company_id: "c1", company_name: "Aarunya Cloud", title: "Frontend Engineer", slug: "frontend-engineer", full_description: "Build products", city: "Bengaluru", skills: [{ name: "React" }] }] } });
    useCompanyBranches.mockReturnValue({ ...idleQuery, data: { items: [{ id: "b1", name: "Bengaluru Office", address: "MG Road", city: "Bengaluru", country: "India", is_headquarters: true }] } });
    useCompaniesSearch.mockReturnValue({ ...idleQuery, data: { items: [{ id: "c2", name: "Nexa Cloud", slug: "nexa-cloud", industry: "SaaS", headquarters: "Bengaluru", size_range: "51-200" }] } });

    render(<CompanyDetail slug="aarunya-cloud" />);
    expect(screen.getByText("A live company overview.")).toBeTruthy();
    expect(screen.getByText("Bengaluru Office")).toBeTruthy();
    expect(screen.getByRole("link", { name: /view frontend engineer/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /nexa cloud/i })).toBeTruthy();
    expect(screen.queryByText(/company rating/i)).toBeNull();
  });

  it("shows a meaningful no-jobs state on a live company profile", () => {
    useCompanyBySlug.mockReturnValue({ data: { id: "c1", name: "Quiet Company", slug: "quiet-company" }, isPending: false, isFetching: false, isError: false, refetch: vi.fn() });
    useJobsSearch.mockReturnValue(idleQuery);
    useCompanyBranches.mockReturnValue(idleQuery);
    useCompaniesSearch.mockReturnValue(idleQuery);
    render(<CompanyDetail slug="quiet-company" />);
    expect(screen.getByText("No open jobs")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse all jobs" })).toBeTruthy();
  });
});
