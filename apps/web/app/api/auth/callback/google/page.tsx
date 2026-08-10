"use client";

import React, { useEffect } from "react";
import { useAuthActions } from "@career-os/hooks";

export default function GoogleCallbackPage() {
  const auth = useAuthActions();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    
    if (error) {
      // User likely cancelled the flow
      if (typeof window !== "undefined") window.location.href = "/login";
      return;
    }

    if (code && !auth.googleAuth.isPending && !auth.googleAuth.isSuccess && !auth.googleAuth.isError) {
      const redirectUri = `${window.location.origin}/api/auth/callback/google`;
      auth.googleAuth.mutate({ code, redirect_uri: redirectUri });
    }
  }, [auth.googleAuth]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--cos-primary)] border-r-transparent"></div>
      <h2 className="text-xl font-bold">Authenticating with Google...</h2>
      <p className="mt-2 text-[var(--cos-on-surface-variant)]">Please wait while we securely log you in.</p>
      
      {auth.googleAuth.isError && (
        <div className="mt-6 w-full max-w-md">
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{auth.googleAuth.error?.message || "There was a problem authenticating with Google."}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "/login"}
            className="mt-4 rounded-[var(--radius-career-button)] bg-[var(--cos-primary)] px-4 py-2 font-semibold text-white"
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
}
