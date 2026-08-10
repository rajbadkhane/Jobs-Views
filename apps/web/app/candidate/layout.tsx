"use client";

import type React from "react";

import { useRoleGuard } from "@career-os/hooks";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  useRoleGuard(["JOB_SEEKER"], "/login");
  return children;
}
