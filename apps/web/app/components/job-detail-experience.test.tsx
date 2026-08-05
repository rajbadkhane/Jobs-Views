import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicJob } from "@career-os/shared";

const useJobBySlug = vi.hoisted(() => vi.fn());
const useSession = vi.hoisted(() => vi.fn());
const useCandidateSubscription = vi.hoisted(() => vi.fn());
const useCandidateActions = vi.hoisted(() => vi.fn());
const useCandidateData = vi.hoisted(() => vi.fn());

vi.mock("@career-os/hooks", () => ({ useJobBySlug, useSession, useCandidateSubscription, useCandidateActions, useCandidateData }));

import { JobDetailExperience } from "./job-detail-experience";

const job: PublicJob = {
  id: "3b7674d3-1af2-4bb2-9664-1c911c27e4f2",
  company_id: "1bb17a83-e6bf-4348-b0b9-5ed4aab7e2c5",
  company_name: "Northstar Logistics",
  company_slug: "northstar-logistics",
  title: "Fleet Operations Manager",
  slug: "fleet-operations-manager",
  short_description: "Lead regional fleet operations and driver safety.",
  full_description: "Own fleet performance across the region.",
  requirements: ["Five years of fleet operations experience", "Commercial transport knowledge"],
  qualifications: ["Graduate or equivalent experience"],
  benefits: ["Health insurance", "Annual performance bonus"],
  salary_min: 1200000,
  salary_max: 1800000,
  currency: "INR",
  experience_min: 5,
  experience_max: 8,
  education: "Graduate",
  openings: 2,
  work_mode: "on_site",
  city: "Pune",
  state: "Maharashtra",
  country: "India",
  status: "published",
  skills: [{ name: "Fleet Management" }, { name: "Driver Safety" }],
  published_at: "2026-07-10T00:00:00Z",
  updated_at: "2026-07-12T00:00:00Z"
};

describe("job detail experience", () => {
  beforeEach(() => {
    useJobBySlug.mockReset();
    useSession.mockReturnValue({ data: undefined, isPending: false });
    useCandidateSubscription.mockReturnValue({ data: undefined, isPending: false });
    useCandidateActions.mockReturnValue({ apply: { mutate: vi.fn(), isPending: false }, saveJob: { mutate: vi.fn(), isPending: false }, removeSavedJob: { mutate: vi.fn(), isPending: false } });
    useCandidateData.mockReturnValue({ savedJobs: { data: { items: [] }, isPending: false } });
  });

  it("renders the job returned by the slug query", () => {
    useJobBySlug.mockReturnValue({ data: job, isPending: false, isError: false, isFetching: false, refetch: vi.fn() });
    render(<JobDetailExperience slug={job.slug} initialJob={job} />);

    expect(screen.getAllByText("Fleet Operations Manager").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Northstar Logistics").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pune, Maharashtra, India").length).toBeGreaterThan(0);
    expect(screen.getByText("Five years of fleet operations experience")).toBeTruthy();
    expect(screen.getByText("Health insurance")).toBeTruthy();
    expect(screen.queryByText("Aarunya Cloud")).toBeNull();
  });

  it("shows the job not found state for a 404 response", () => {
    useJobBySlug.mockReturnValue({ data: undefined, isPending: false, isError: true, isFetching: false, error: { response: { status: 404 } }, refetch: vi.fn() });
    render(<JobDetailExperience slug="missing-job" />);
    expect(screen.getByText("Job Not Found")).toBeTruthy();
    expect(screen.getByRole("link", { name: /browse jobs/i }).getAttribute("href")).toBe("/jobs");
  });

  it("allows a failed request to be retried", () => {
    const refetch = vi.fn();
    useJobBySlug.mockReturnValue({ data: undefined, isPending: false, isError: true, isFetching: false, error: new Error("Network unavailable"), refetch });
    render(<JobDetailExperience slug="fleet-operations-manager" />);
    fireEvent.click(screen.getByRole("button", { name: /^retry$/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("submits a real application for an active candidate subscriber", () => {
    const mutate = vi.fn();
    useJobBySlug.mockReturnValue({ data: job, isPending: false, isError: false, isFetching: false, refetch: vi.fn() });
    useSession.mockReturnValue({ data: { id: "candidate", role: "JOB_SEEKER" }, isPending: false });
    useCandidateSubscription.mockReturnValue({ data: { active: true, plan: { slug: "basic" } }, isPending: false });
    useCandidateActions.mockReturnValue({ apply: { mutate, isPending: false }, saveJob: { mutate: vi.fn(), isPending: false }, removeSavedJob: { mutate: vi.fn(), isPending: false } });
    render(<JobDetailExperience slug={job.slug} initialJob={job} />);

    fireEvent.click(screen.getAllByRole("button", { name: /apply now/i })[0]);
    expect(mutate).toHaveBeenCalledWith({ job_id: job.id, source: "job_detail" });
    expect(screen.getByText("Full job description")).toBeTruthy();
  });
});
