import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAdminData = vi.hoisted(() => vi.fn());
const useAdminActions = vi.hoisted(() => vi.fn());
vi.mock("@career-os/hooks", () => ({ useAdminData, useAdminActions }));

import { AdminPortal } from "./admin-portal";

const query = (data: unknown) => ({ data, isPending: false, isFetching: false, isError: false, error: null, refetch: vi.fn() });
const mutation = () => ({ mutate: vi.fn(), mutateAsync: vi.fn().mockResolvedValue(null), isPending: false });

function data() {
  return {
    dashboard: query({ total_users: 120, active_users: 90, companies: 12, active_jobs: 25, applications: 51, revenue: 72000, pending_verifications: 3, reports: 4 }),
    dashboardTrends: query({ users: [], jobs: [], applications: [], revenue: [], application_funnel: [] }),
    businessDashboard: query({ employers: 8, active_subscriptions: 5, mrr: 10000, arr: 120000, revenue: 72000 }),
    marketplace: query({}),
    users: query({ items: [{ id: "u1", email: "candidate@example.com", role: "JOB_SEEKER", is_active: true, is_verified: true, created_at: "2026-07-01T00:00:00Z" }] }),
    companies: query({ items: [{ id: "c1", name: "Aarunya Cloud", slug: "aarunya-cloud", website: "https://aarunya.example", industry: "Technology", headquarters: "Pune", status: "pending", is_verified: false, created_at: "2026-07-02T00:00:00Z" }] }),
    jobs: query({ items: [{ id: "j1", company_id: "c1", company_name: "Aarunya Cloud", title: "Frontend Engineer", slug: "frontend-engineer", full_description: "Build production interfaces.", status: "published", city: "Pune", work_mode: "hybrid", job_type: "full-time", published_at: "2026-07-03T00:00:00Z" }] }),
    applications: query({ items: [{ id: "a1", candidate_email: "candidate@example.com", job_title: "Frontend Engineer", company: "Aarunya Cloud", status: "screening", created_at: "2026-07-04T00:00:00Z" }] }),
    plans: query({ items: [{ id: 1, name: "Plus", slug: "plus", price: 299, currency: "INR", billing_interval: "month", is_active: true }] }),
    cms: query({ items: [] }), reports: query({ items: [] }), tickets: query({ items: [] }), seo: query({ items: [] }), settings: query({ items: [{ key: "brand", category: "branding", value: { name: "Jobs View" }, is_public: true }] }),
    audit: query({ items: [{ id: "log1", action: "company_approved", resource_type: "company", created_at: "2026-07-10T00:00:00Z" }] }),
    health: query({ api: "ok", database: "ok" })
  };
}

function actions() {
  return {
    suspendUser: mutation(), activateUser: mutation(), deleteUser: mutation(), resetPassword: mutation(), assignRole: mutation(), bulkUsers: mutation(),
    moderateCompany: mutation(), verifyCompany: mutation(), bulkModerateCompanies: mutation(), bulkVerifyCompanies: mutation(),
    moderateJob: mutation(), setJobFlags: mutation(), bulkModerateJobs: mutation(), quickPostJob: mutation(), upsertPlan: mutation(),
    upsertCms: mutation(), upsertSetting: mutation(), createReport: mutation(), createTicket: mutation(), upsertSeo: mutation()
  };
}

describe("professional admin portal", () => {
  beforeEach(() => { useAdminData.mockReset(); useAdminActions.mockReset(); useAdminData.mockReturnValue(data()); useAdminActions.mockReturnValue(actions()); });

  it("renders only real dashboard metrics and audit activity", () => {
    render(<AdminPortal view="dashboard" />);
    expect(screen.getByText("120")).toBeTruthy();
    expect(screen.getByText("25")).toBeTruthy();
    expect(screen.getByText("Company Approved")).toBeTruthy();
    expect(screen.queryByText("Growth Score")).toBeNull();
    expect(screen.queryByText("AI Moderation")).toBeNull();
  });

  it("opens a user drawer and confirms suspension before mutation", async () => {
    const liveActions = actions(); useAdminActions.mockReturnValue(liveActions);
    render(<AdminPortal view="users" />);
    fireEvent.click(screen.getAllByText("candidate@example.com")[0]);
    expect(screen.getByRole("dialog", { name: "candidate@example.com" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Suspend" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(liveActions.suspendUser.mutateAsync).not.toHaveBeenCalled();
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Suspend" }));
    await waitFor(() => expect(liveActions.suspendUser.mutateAsync).toHaveBeenCalledWith("u1"));
  });

  it("shows only supported job moderation actions in the drawer", () => {
    render(<AdminPortal view="jobs" />);
    expect((screen.getByRole("textbox", { name: "Company" }) as HTMLInputElement).value).toBe("");
    fireEvent.click(screen.getAllByText("Frontend Engineer")[0]);
    expect(screen.getByRole("button", { name: "Publish" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Duplicate" })).toBeNull();
  });

  it("groups real settings and validates JSON before saving", () => {
    const liveActions = actions(); useAdminActions.mockReturnValue(liveActions);
    render(<AdminPortal view="settings" />);
    expect(screen.getByText("Branding")).toBeTruthy();
    const field = screen.getByLabelText("brand value");
    fireEvent.change(field, { target: { value: "not-json" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert").textContent).toContain("valid JSON");
    expect(liveActions.upsertSetting.mutate).not.toHaveBeenCalled();
  });
});
