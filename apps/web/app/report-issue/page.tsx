import { buildMetadata } from "@career-os/shared";
import { PublicInfoPage } from "../components/public-info-page";
import { SupportTicketForm } from "../components/support-ticket-form";

export const metadata = buildMetadata("Report an Issue | Jobs View", "Report a technical, safety, accessibility or listing issue on Jobs View.", "/report-issue");

export default function Page() {
  return (
    <PublicInfoPage
      title="Report an issue"
      description="Include the affected URL, what you expected, and what happened. Never send a password or OTP."
      sections={[
        { title: "Submit a ticket", body: <SupportTicketForm /> },
        { title: "Suspicious job or employer", body: <a className="font-bold text-[var(--cos-primary)]" href="mailto:safety@jobsview.in?subject=Listing%20safety%20report">Email the safety team</a> },
        { title: "Accessibility barrier", body: <a className="font-bold text-[var(--cos-primary)]" href="mailto:accessibility@jobsview.in">Email accessibility support</a> }
      ]}
    />
  );
}
