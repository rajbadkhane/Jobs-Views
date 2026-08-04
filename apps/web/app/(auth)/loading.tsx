import React from "react";

import { SkeletonCard } from "@career-os/ui";

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8">
      <div className="hidden items-center lg:flex">
        <SkeletonCard lines={8} className="w-full" />
      </div>
      <div className="flex items-center">
        <SkeletonCard lines={10} className="w-full" />
      </div>
    </main>
  );
}
