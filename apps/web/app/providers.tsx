"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useEffect, useMemo } from "react";

import { appConfig, navigation } from "@career-os/config";
import { useAuthStore, useThemeStore } from "@career-os/shared";
import { ToastViewport, UniversalCommandCenter } from "@career-os/ui";
import { ProductionRuntime } from "./production-runtime";

export function Providers({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => failureCount < 2 && !String(error).includes("403"),
        staleTime: appConfig.reliability.queryStaleMs,
        gcTime: appConfig.reliability.queryGcMs,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false
      },
      mutations: { retry: 0 }
    }
  }), []);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
  }, [hydrateAuth, hydrateTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", mode === "dark" || (mode === "system" && prefersDark));
  }, [mode]);

  return (
    <QueryClientProvider client={client}>
      <ProductionRuntime />
      <ToastViewport />
      <UniversalCommandCenter nav={[...navigation.public, ...navigation.candidate]} role="candidate" />
      {children}
    </QueryClientProvider>
  );
}
