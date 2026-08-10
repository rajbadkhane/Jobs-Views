"use client";

import { FileBarChart, LifeBuoy } from "lucide-react";
import { useState } from "react";

import { useAdminActions } from "@career-os/hooks";
import { Button } from "@career-os/ui";

import type { AdminLive, ReportItem, TicketItem } from "../admin-portal";
import { AdminColumn, AdminDataTable } from "../admin-data-table";
import { AdminDrawer, DetailList, PublicLink } from "../admin-overlays";

import { FormCard, Select, StatusBadge, TextArea, TextField } from "./shared";
import { formatDate, items, timestamp, titleCase } from "./utils";

function ReportForm({
  actions,
}: {
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [type, setType] = useState("users");
  const [format, setFormat] = useState("csv");
  return (
    <FormCard
      title="Generate Report"
      description="Request a report using the formats supported by the existing endpoint."
      icon={<FileBarChart size={18} />}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.createReport.mutate({
            report_type: type,
            format,
            filters: {},
          });
        }}
      >
        <Select
          label="Report type"
          value={type}
          onChange={setType}
          options={[
            ["users", "Users"],
            ["companies", "Companies"],
            ["jobs", "Jobs"],
            ["applications", "Applications"],
            ["revenue", "Revenue"],
          ]}
        />
        <Select
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            ["csv", "CSV"],
            ["excel", "Excel"],
            ["pdf", "PDF"],
          ]}
        />
        <Button
          type="submit"
          loading={actions.createReport.isPending}
          disabled={actions.createReport.isPending}
        >
          Generate report
        </Button>
      </form>
    </FormCard>
  );
}
export function ReportsView({ live }: { live: AdminLive }) {
  const reports = items<ReportItem>(live.data.reports.data);
  const columns: AdminColumn<ReportItem>[] = [
    {
      id: "type",
      header: "Report",
      hideable: false,
      sortValue: (row) => row.report_type,
      cell: (row) => titleCase(row.report_type || "Report"),
    },
    {
      id: "format",
      header: "Format",
      sortValue: (row) => row.format,
      cell: (row) => (row.format || "").toUpperCase(),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge value={row.status || "queued"} />,
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
    {
      id: "download",
      header: "Download",
      cell: (row) =>
        row.status === "ready" && row.file_url ? (
          <PublicLink href={row.file_url}>Download</PublicLink>
        ) : (
          <span className="text-xs text-[var(--cos-on-surface-variant)]">
            Unavailable
          </span>
        ),
    },
  ];
  return (
    <div className="grid gap-6">
      <ReportForm actions={live.actions} />
      <AdminDataTable
        label="Report history"
        rows={reports}
        columns={columns}
        rowKey={(row) => row.id || `${row.report_type}-${row.created_at}`}
        emptyTitle="No reports"
        emptyDescription="Generated report requests will appear here."
      />
    </div>
  );
}
function SupportForm({
  actions,
}: {
  actions: ReturnType<typeof useAdminActions>;
}) {
  const [form, setForm] = useState({
    email: "",
    ticket_type: "ticket",
    subject: "",
    message: "",
    priority: "normal",
  });
  return (
    <FormCard
      title="Create Support Ticket"
      description="Create an operational ticket and add it to the support queue."
      icon={<LifeBuoy size={18} />}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          actions.createTicket.mutate(form);
        }}
      >
        <TextField
          label="Email"
          type="email"
          value={form.email}
          setValue={(value) =>
            setForm((current) => ({ ...current, email: value }))
          }
        />
        <Select
          label="Ticket type"
          value={form.ticket_type}
          onChange={(value) =>
            setForm((current) => ({ ...current, ticket_type: value }))
          }
          options={[
            ["ticket", "Support ticket"],
            ["feedback", "Feedback"],
            ["contact", "Contact"],
            ["bug", "Bug report"],
            ["feature", "Feature request"],
          ]}
        />
        <TextField
          label="Subject"
          value={form.subject}
          setValue={(value) =>
            setForm((current) => ({ ...current, subject: value }))
          }
          required
        />
        <TextArea
          label="Message"
          value={form.message}
          setValue={(value) =>
            setForm((current) => ({ ...current, message: value }))
          }
          required
        />
        <Select
          label="Priority"
          value={form.priority}
          onChange={(value) =>
            setForm((current) => ({ ...current, priority: value }))
          }
          options={[
            ["low", "Low"],
            ["normal", "Normal"],
            ["high", "High"],
            ["urgent", "Urgent"],
          ]}
        />
        <Button
          type="submit"
          loading={actions.createTicket.isPending}
          disabled={actions.createTicket.isPending}
        >
          Create ticket
        </Button>
      </form>
    </FormCard>
  );
}
export function SupportView({ live }: { live: AdminLive }) {
  const tickets = items<TicketItem>(live.data.tickets.data);
  const [detail, setDetail] = useState<TicketItem>();
  const columns: AdminColumn<TicketItem>[] = [
    {
      id: "subject",
      header: "Subject",
      hideable: false,
      width: 280,
      sortValue: (row) => row.subject,
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.subject}</div>
          <div className="text-xs text-[var(--cos-on-surface-variant)]">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      sortValue: (row) => row.ticket_type,
      cell: (row) => titleCase(row.ticket_type || "ticket"),
    },
    {
      id: "priority",
      header: "Priority",
      sortValue: (row) => row.priority,
      cell: (row) => <StatusBadge value={row.priority || "normal"} />,
    },
    {
      id: "status",
      header: "Status",
      sortValue: (row) => row.status,
      cell: (row) => <StatusBadge value={row.status || "open"} />,
    },
    {
      id: "created",
      header: "Created",
      sortValue: (row) => timestamp(row.created_at),
      cell: (row) => formatDate(row.created_at),
    },
  ];
  return (
    <div className="grid gap-6">
      <SupportForm actions={live.actions} />
      <AdminDataTable
        label="Support queue"
        rows={tickets}
        columns={columns}
        rowKey={(row) => row.id || `${row.subject}-${row.created_at}`}
        onOpen={setDetail}
        emptyTitle="No support tickets"
        emptyDescription="New support requests will appear here."
      />
      <AdminDrawer
        open={Boolean(detail)}
        title={detail?.subject || "Ticket details"}
        description={detail?.email}
        onClose={() => setDetail(undefined)}
      >
        <DetailList
          items={[
            { label: "Type", value: detail?.ticket_type ? titleCase(detail.ticket_type) : undefined },
            { label: "Priority", value: detail?.priority ? titleCase(detail.priority) : undefined },
            { label: "Status", value: detail?.status ? titleCase(detail.status) : undefined },
            { label: "Created", value: formatDate(detail?.created_at) },
          ]}
        />
        {detail?.message ? (
          <p className="mt-5 whitespace-pre-line text-sm leading-6 text-[var(--cos-on-surface-variant)]">{detail.message}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {detail ? (
            <>
              <Button
                loading={live.actions.updateTicket.isPending}
                disabled={live.actions.updateTicket.isPending}
                onClick={() => detail.id && live.actions.updateTicket.mutate({ id: detail.id, status: "resolved" })}
              >
                Mark resolved
              </Button>
              <Button
                variant="secondary"
                onClick={() => detail.id && live.actions.updateTicket.mutate({ id: detail.id, status: "pending" })}
              >
                Mark pending
              </Button>
              <Button
                variant="danger"
                onClick={() => detail.id && live.actions.updateTicket.mutate({ id: detail.id, status: "closed" })}
              >
                Close
              </Button>
            </>
          ) : null}
        </div>
      </AdminDrawer>
    </div>
  );
}

