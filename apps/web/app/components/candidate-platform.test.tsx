import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useCandidateData = vi.hoisted(() => vi.fn());
const useCandidateActions = vi.hoisted(() => vi.fn());
const useJobsSearch = vi.hoisted(() => vi.fn());
const useJobRecommendations = vi.hoisted(() => vi.fn());

vi.mock("@career-os/hooks", () => ({ useCandidateData, useCandidateActions, useJobsSearch, useJobRecommendations }));

import { CandidatePlatform } from "./candidate-platform";
import { recentJobsStorageKey, rememberRecentJob } from "./candidate-recent-jobs";

const query = (data: unknown) => ({ data, isPending: false, isFetching: false, isError: false, error: null, refetch: vi.fn() });
const mutation = () => ({ mutate: vi.fn(), isPending: false });

function candidateData(overrides: Record<string, ReturnType<typeof query>> = {}) {
  return {
    profile: query({ first_name: "Asha", last_name: "Sharma", headline: "Operations associate", location: "Pune", visibility: "private" }),
    completion: query({ score: 65, strength: "strong", missing_fields: ["resume"] }),
    skills: query([{ id: "s1", name: "Excel", level: "advanced" }]),
    education: query([{ id: "e1", qualification: "Class 12", university: "City School" }]),
    experience: query([]),
    applications: query([
      { id: "a1", job_id: "j1", job_slug: "warehouse-associate", job_title: "Warehouse Associate", company_name: "MoveFast", status: "screening", created_at: "2026-07-01T00:00:00Z", updated_at: "2026-07-10T00:00:00Z" },
      { id: "a2", job_id: "j2", job_slug: "support-executive", job_title: "Support Executive", company_name: "HelpDesk", status: "rejected", created_at: "2026-06-01T00:00:00Z" }
    ]),
    savedJobs: query([{ job_id: "j3", slug: "delivery-partner", title: "Delivery Partner", company: "QuickGo", created_at: "2026-07-12T00:00:00Z" }]),
    notifications: query([{ id: "n1", title: "Application reviewed", message: "MoveFast reviewed your application.", channel: "in_app", is_read: false, created_at: "2026-07-10T00:00:00Z" }]),
    notificationSummary: query({ unread: 1 }),
    ...overrides
  };
}

function actions() {
  return {
    updateProfile: mutation(), uploadAvatar: mutation(), uploadResume: mutation(), upsertSkill: mutation(), deleteSkill: mutation(),
    createEducation: mutation(), createExperience: mutation(), apply: mutation(), withdrawApplication: mutation(), saveJob: mutation(),
    removeSavedJob: mutation(), markNotificationRead: mutation(), markAllNotificationsRead: mutation(), deleteNotification: mutation()
  };
}

describe("candidate platform", () => {
  beforeEach(() => {
    useCandidateData.mockReset(); useCandidateActions.mockReset(); useJobsSearch.mockReset(); useJobRecommendations.mockReset();
    useCandidateData.mockReturnValue(candidateData());
    useCandidateActions.mockReturnValue(actions());
    useJobsSearch.mockReturnValue(query([]));
    useJobRecommendations.mockReturnValue([]);
    window.localStorage.clear();
  });

  it("renders dashboard totals and server profile completion without invented scores", () => {
    render(<CandidatePlatform view="dashboard" />);
    expect(screen.getByRole("link", { name: /Applied Applications 2/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Saved & Bookmarked 1/i })).toBeTruthy();
    expect(screen.getAllByText("65%").length).toBeGreaterThan(0);
    expect(screen.queryByText(/resume score/i)).toBeNull();
    expect(screen.queryByText(/interview readiness/i)).toBeNull();
    expect(screen.getByText("Application reviewed")).toBeTruthy();
  });

  it("searches and filters real application records and allows supported withdrawal", () => {
    const candidateActions = actions();
    useCandidateActions.mockReturnValue(candidateActions);
    render(<CandidatePlatform view="applications" />);
    expect(screen.getByText("Warehouse Associate")).toBeTruthy();
    expect(screen.getAllByText("Under Review").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText("Search applications"), { target: { value: "support" } });
    expect(screen.queryByText("Warehouse Associate")).toBeNull();
    expect(screen.getByText("Support Executive")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "screening" } });
    expect(screen.getByText("No applications match")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "all" } });
    fireEvent.change(screen.getByPlaceholderText("Search applications"), { target: { value: "warehouse" } });
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(candidateActions.withdrawApplication.mutate).toHaveBeenCalledWith("a1");
  });

  it("uses only supported saved-job actions", () => {
    const candidateActions = actions();
    useCandidateActions.mockReturnValue(candidateActions);
    render(<CandidatePlatform view="saved" />);
    expect(screen.getByRole("link", { name: "Open job" }).getAttribute("href")).toBe("/jobs/delivery-partner");
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(candidateActions.apply.mutate).toHaveBeenCalledWith({ job_id: "j3", source: "saved_jobs" });
    fireEvent.click(screen.getByRole("button", { name: /Remove/ }));
    expect(candidateActions.removeSavedJob.mutate).toHaveBeenCalledWith("j3");
    expect(screen.queryByText("Dream companies")).toBeNull();
  });

  it("marks and deletes notifications using existing actions", () => {
    const candidateActions = actions();
    useCandidateActions.mockReturnValue(candidateActions);
    render(<CandidatePlatform view="notifications" />);
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(candidateActions.markNotificationRead.mutate).toHaveBeenCalledWith("n1");
    expect(candidateActions.deleteNotification.mutate).toHaveBeenCalledWith("n1");
    expect(screen.queryByText("Archive")).toBeNull();
  });

  it("records and renders real recently viewed jobs locally", async () => {
    rememberRecentJob({ id: "j9", company_id: "c1", company_name: "RoadWorks", title: "Driver", slug: "driver-roadworks", full_description: "Drive company vehicles", city: "Indore" });
    expect(JSON.parse(window.localStorage.getItem(recentJobsStorageKey) || "[]")).toHaveLength(1);
    render(<CandidatePlatform view="recent" />);
    await waitFor(() => expect(screen.getByText("Driver")).toBeTruthy());
    expect(screen.getByRole("link", { name: /View Driver at RoadWorks/i })).toBeTruthy();
  });
});
