import type { Metadata } from "next";

import { buildMetadata } from "@career-os/shared";
import { ResumeBuilderClient } from "./resume-builder-client";

export const metadata: Metadata = buildMetadata("Resume Builder Workspace | Jobs View", "Create, version, preview, and export an ATS-conscious resume with Jobs View Premium.", "/resume");

export default function ResumePage() { return <ResumeBuilderClient />; }
