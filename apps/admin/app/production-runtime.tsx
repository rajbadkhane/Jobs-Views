"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useState } from "react";

import { appConfig } from "@career-os/config";
import { useSessionTimeoutWarning } from "@career-os/hooks";
import { reportPerformanceMetric, trackEvent } from "@career-os/shared";

export function ProductionRuntime() {
  const [online, setOnline] = useState(true);

  useReportWebVitals((metric) => {
    reportPerformanceMetric({ name: metric.name, value: metric.value, id: metric.id, rating: metric.rating, label: metric.label });
  });

  useSessionTimeoutWarning(appConfig.reliability.sessionWarningMs, () => {
    trackEvent("session.timeout.warning", { workspace: "admin" });
  });

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onSessionExpired = () => {
      if (window.location.pathname === "/admin/login") return;
      window.location.href = "/session-expired";
    };
    trackEvent("page.view", { workspace: "admin", path: window.location.pathname });
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("jobsview:session-expired", onSessionExpired);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("jobsview:session-expired", onSessionExpired);
    };
  }, []);

  if (online) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[80] rounded-[var(--radius-career-card)] border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-career-floating lg:bottom-4">
      You are offline. Admin actions will retry when your network returns.
    </div>
  );
}
