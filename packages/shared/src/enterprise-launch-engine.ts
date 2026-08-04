export type CommunicationChannel = "email" | "sms" | "push" | "whatsapp" | "in_app" | "browser" | "voice";
export type CommunicationStatus = "queued" | "sent" | "delivered" | "failed" | "opened" | "skipped";
export type NotificationPriority = "low" | "normal" | "high" | "critical";
export type NotificationCadence = "muted" | "instant" | "daily" | "weekly" | "digest";
export type QueueName = "email" | "notification" | "recommendation" | "search" | "seo" | "media" | "import" | "export" | "analytics" | "retry" | "failed";
export type SchedulerTaskKey =
  | "expire_jobs"
  | "archive_jobs"
  | "publish_scheduled_content"
  | "recommendation_refresh"
  | "seo_refresh"
  | "search_index_refresh"
  | "salary_refresh"
  | "reminder_emails"
  | "subscription_renewal"
  | "cleanup"
  | "draft_cleanup"
  | "analytics_aggregation";
export type SearchProviderKey = "database" | "meilisearch_placeholder" | "opensearch_placeholder" | "elastic_placeholder";
export type StorageProviderKey = "local" | "cloudflare_r2" | "s3_placeholder" | "azure_placeholder" | "gcp_placeholder";
export type ResumeParserProviderKey = "heuristic" | "ocr_placeholder" | "ai_placeholder" | "linkedin_import_placeholder";
export type WebhookEventKey =
  | "candidate_created"
  | "employer_approved"
  | "job_published"
  | "application_submitted"
  | "interview_scheduled"
  | "offer_released"
  | "candidate_hired"
  | "subscription_renewed"
  | "admin_action";
export type PublicApiScope = "employer" | "ats" | "career" | "job" | "candidate" | "analytics";
export type HealthState = "healthy" | "degraded" | "down" | "unknown";

export type CommunicationEventKey =
  | "candidate_registration"
  | "employer_registration"
  | "email_verification"
  | "password_reset"
  | "application_submitted"
  | "application_viewed"
  | "shortlisted"
  | "interview_scheduled"
  | "interview_reminder"
  | "interview_cancelled"
  | "interview_feedback"
  | "offer_released"
  | "offer_accepted"
  | "offer_declined"
  | "joining_reminder"
  | "employer_approval"
  | "employer_rejection"
  | "subscription_expiry"
  | "payment_success"
  | "payment_failed"
  | "admin_announcement";

export type MessageTemplate = {
  key: string;
  name: string;
  channels: CommunicationChannel[];
  subject?: string;
  variables: string[];
  localizationReady: boolean;
  html: boolean;
  darkModeCompatible: boolean;
};

export type CommunicationEvent = {
  key: CommunicationEventKey;
  templateKey: string;
  defaultChannels: CommunicationChannel[];
  priority: NotificationPriority;
  retryable: boolean;
  trackOpen: boolean;
};

export type QueueDefinition = {
  name: QueueName;
  purpose: string;
  retry: boolean;
  deadLetter: boolean;
};

export type SchedulerTask = {
  key: SchedulerTaskKey;
  label: string;
  queue: QueueName;
  defaultCron: string;
  idempotent: boolean;
};

export type ProviderDefinition<T extends string> = {
  key: T;
  label: string;
  adapter: string;
  status: "active" | "placeholder";
};

export type ImportExportFormat = "csv" | "excel" | "json";
export type ImportExportTarget = "admin" | "employer" | "candidate";

export type ImportExportContract = {
  target: ImportExportTarget;
  formats: ImportExportFormat[];
  bulkImport: boolean;
  bulkExport: boolean;
  errorReport: boolean;
  validationReport: boolean;
  duplicateDetection: boolean;
};

export type WebhookDefinition = {
  event: WebhookEventKey;
  retry: boolean;
  signatureValidation: boolean;
};

export type PublicApiDefinition = {
  scope: PublicApiScope;
  basePath: string;
  apiKeyRequired: boolean;
  rateLimited: boolean;
};

export type MonitoringCheck = {
  key: string;
  label: string;
  status: HealthState;
  critical: boolean;
};

export type FeatureFlagKey =
  | "ai_features"
  | "marketplace"
  | "government_jobs"
  | "learning"
  | "career_intelligence"
  | "blue_collar_quick_flow"
  | "employer_quick_job_post"
  | "public_api"
  | "webhooks";

export type FeatureFlag = {
  key: FeatureFlagKey;
  enabled: boolean;
  source: "environment" | "runtime";
  beta: boolean;
};

export const emailTemplates: MessageTemplate[] = [
  template("verification", "Email Verification", ["email"], ["name", "verificationUrl"]),
  template("reset_password", "Reset Password", ["email"], ["name", "resetUrl"]),
  template("interview", "Interview", ["email", "in_app", "push"], ["name", "jobTitle", "interviewTime"]),
  template("offer", "Offer", ["email", "in_app"], ["name", "jobTitle", "offerUrl"]),
  template("welcome", "Welcome", ["email", "in_app"], ["name"]),
  template("employer_approval", "Employer Approval", ["email", "in_app"], ["companyName"]),
  template("employer_rejection", "Employer Rejection", ["email", "in_app"], ["companyName", "reason"]),
  template("job_alert", "Job Alert", ["email", "push", "in_app"], ["name", "jobs"]),
  template("newsletter", "Newsletter", ["email"], ["name", "content"]),
  template("admin_notice", "Admin Notice", ["email", "in_app", "browser"], ["title", "message"])
];

export const communicationEvents: CommunicationEvent[] = [
  event("candidate_registration", "welcome", ["email", "in_app"], "normal"),
  event("employer_registration", "welcome", ["email", "in_app"], "normal"),
  event("email_verification", "verification", ["email"], "high"),
  event("password_reset", "reset_password", ["email"], "critical"),
  event("application_submitted", "job_alert", ["email", "in_app"], "normal"),
  event("application_viewed", "admin_notice", ["in_app", "push"], "normal"),
  event("shortlisted", "interview", ["email", "push", "whatsapp"], "high"),
  event("interview_scheduled", "interview", ["email", "in_app", "push"], "high"),
  event("interview_reminder", "interview", ["email", "push", "sms"], "high"),
  event("interview_cancelled", "interview", ["email", "push", "in_app"], "high"),
  event("interview_feedback", "admin_notice", ["in_app"], "normal"),
  event("offer_released", "offer", ["email", "in_app", "push"], "critical"),
  event("offer_accepted", "offer", ["email", "in_app"], "high"),
  event("offer_declined", "offer", ["email", "in_app"], "high"),
  event("joining_reminder", "offer", ["email", "push", "sms"], "high"),
  event("employer_approval", "employer_approval", ["email", "in_app"], "high"),
  event("employer_rejection", "employer_rejection", ["email", "in_app"], "high"),
  event("subscription_expiry", "admin_notice", ["email", "in_app"], "high"),
  event("payment_success", "admin_notice", ["email", "in_app"], "normal"),
  event("payment_failed", "admin_notice", ["email", "in_app", "sms"], "critical"),
  event("admin_announcement", "admin_notice", ["email", "in_app", "browser"], "critical")
];

export const queueDefinitions: QueueDefinition[] = [
  queue("email", "Transactional and marketing email delivery", true),
  queue("notification", "Push, in-app, browser, SMS, and WhatsApp dispatch", true),
  queue("recommendation", "Career and job recommendation refresh", true),
  queue("search", "Search indexing and refresh", true),
  queue("seo", "SEO, sitemap, schema, and metadata refresh", true),
  queue("media", "Image, resume, and document processing", true),
  queue("import", "Bulk import jobs, users, companies, and content", true),
  queue("export", "CSV, Excel, and JSON exports", true),
  queue("analytics", "Metric aggregation and reporting", true),
  queue("retry", "Retryable failed jobs", true),
  queue("failed", "Dead-letter queue for failed work", false, false)
];

export const schedulerTasks: SchedulerTask[] = [
  task("expire_jobs", "Expire Jobs", "seo", "*/30 * * * *"),
  task("archive_jobs", "Archive Jobs", "seo", "0 2 * * *"),
  task("publish_scheduled_content", "Publish Scheduled Content", "seo", "*/10 * * * *"),
  task("recommendation_refresh", "Recommendation Refresh", "recommendation", "0 */2 * * *"),
  task("seo_refresh", "SEO Refresh", "seo", "0 */6 * * *"),
  task("search_index_refresh", "Search Index Refresh", "search", "*/15 * * * *"),
  task("salary_refresh", "Salary Refresh", "analytics", "0 3 * * *"),
  task("reminder_emails", "Reminder Emails", "email", "*/15 * * * *"),
  task("subscription_renewal", "Subscription Renewal", "email", "0 4 * * *"),
  task("cleanup", "Cleanup", "failed", "0 5 * * *"),
  task("draft_cleanup", "Draft Cleanup", "failed", "0 1 * * *"),
  task("analytics_aggregation", "Analytics Aggregation", "analytics", "*/30 * * * *")
];

export const searchProviders: ProviderDefinition<SearchProviderKey>[] = [
  provider("database", "Database Search", "DatabaseSearchProvider", "active"),
  provider("meilisearch_placeholder", "Meilisearch", "MeilisearchProvider", "placeholder"),
  provider("opensearch_placeholder", "OpenSearch", "OpenSearchProvider", "placeholder"),
  provider("elastic_placeholder", "Elastic", "ElasticSearchProvider", "placeholder")
];

export const storageProviders: ProviderDefinition<StorageProviderKey>[] = [
  provider("local", "Local Storage", "LocalStorageProvider", "active"),
  provider("cloudflare_r2", "Cloudflare R2", "CloudflareR2StorageProvider", "active"),
  provider("s3_placeholder", "Amazon S3", "S3StorageProvider", "placeholder"),
  provider("azure_placeholder", "Azure Blob Storage", "AzureStorageProvider", "placeholder"),
  provider("gcp_placeholder", "Google Cloud Storage", "GcpStorageProvider", "placeholder")
];

export const resumeParserProviders: ProviderDefinition<ResumeParserProviderKey>[] = [
  provider("heuristic", "Heuristic Parser", "HeuristicResumeParser", "active"),
  provider("ocr_placeholder", "OCR Parser", "OcrResumeParser", "placeholder"),
  provider("ai_placeholder", "AI Parser", "AiResumeParser", "placeholder"),
  provider("linkedin_import_placeholder", "LinkedIn Import", "LinkedInResumeImporter", "placeholder")
];

export const importExportContracts: ImportExportContract[] = [
  importExport("admin", ["csv", "excel", "json"]),
  importExport("employer", ["csv", "excel", "json"]),
  importExport("candidate", ["csv", "json"])
];

export const webhookDefinitions: WebhookDefinition[] = [
  webhook("candidate_created"),
  webhook("employer_approved"),
  webhook("job_published"),
  webhook("application_submitted"),
  webhook("interview_scheduled"),
  webhook("offer_released"),
  webhook("candidate_hired"),
  webhook("subscription_renewed"),
  webhook("admin_action")
];

export const publicApiDefinitions: PublicApiDefinition[] = [
  publicApi("employer", "/api/public/employer"),
  publicApi("ats", "/api/public/ats"),
  publicApi("career", "/api/public/career"),
  publicApi("job", "/api/public/jobs"),
  publicApi("candidate", "/api/public/candidates"),
  publicApi("analytics", "/api/public/analytics")
];

export const monitoringChecks: MonitoringCheck[] = [
  { key: "database", label: "Database", status: "unknown", critical: true },
  { key: "redis", label: "Redis", status: "unknown", critical: true },
  { key: "queue", label: "Queue", status: "unknown", critical: true },
  { key: "storage", label: "Storage", status: "unknown", critical: true },
  { key: "search", label: "Search", status: "unknown", critical: false },
  { key: "api", label: "API", status: "unknown", critical: true },
  { key: "frontend", label: "Frontend", status: "unknown", critical: true },
  { key: "employer_portal", label: "Employer Portal", status: "unknown", critical: true },
  { key: "admin_portal", label: "Admin Portal", status: "unknown", critical: true },
  { key: "scheduler", label: "Scheduler", status: "unknown", critical: true },
  { key: "background_workers", label: "Background Workers", status: "unknown", critical: true }
];

export const featureFlags: FeatureFlag[] = [
  flag("ai_features", false, true),
  flag("marketplace", true, false),
  flag("government_jobs", true, false),
  flag("learning", true, false),
  flag("career_intelligence", true, false),
  flag("blue_collar_quick_flow", true, false),
  flag("employer_quick_job_post", true, false),
  flag("public_api", false, true),
  flag("webhooks", false, true)
];

export const blueCollarQuickFlow = ["phone", "otp", "name", "education", "current_job", "city", "preferred_job", "done"];

export const quickJobTemplates = [
  "Security Guard",
  "Driver",
  "Delivery Executive",
  "Warehouse Associate",
  "Factory Worker",
  "Electrician",
  "Plumber",
  "Receptionist",
  "Office Boy",
  "Sales Executive",
  "Software Developer",
  "Teacher",
  "Nurse"
];

export function communicationPlanFor(eventKey: CommunicationEventKey, cadence: NotificationCadence = "instant") {
  const eventDefinition = communicationEvents.find((item) => item.key === eventKey);
  if (!eventDefinition || cadence === "muted") return [];
  const delayMinutes = cadence === "instant" ? 0 : cadence === "daily" ? 1440 : cadence === "weekly" ? 10080 : 360;
  return eventDefinition.defaultChannels.map((channel) => ({
    eventKey,
    channel,
    templateKey: eventDefinition.templateKey,
    priority: eventDefinition.priority,
    delayMinutes,
    retryable: eventDefinition.retryable
  }));
}

export function queueForCommunication(channel: CommunicationChannel): QueueName {
  return channel === "email" ? "email" : "notification";
}

export function launchCenterSnapshot(input: {
  jobsToday?: number;
  applicationsToday?: number;
  interviewsToday?: number;
  hiresToday?: number;
  employerGrowth?: number;
  candidateGrowth?: number;
  revenue?: number;
  emailQueue?: number;
  notificationQueue?: number;
  errors?: number;
  warnings?: number;
  environment?: string;
  deployVersion?: string;
}) {
  return {
    productionHealth: (input.errors ?? 0) > 0 ? "degraded" : "healthy",
    jobsToday: input.jobsToday ?? 0,
    applicationsToday: input.applicationsToday ?? 0,
    interviewsToday: input.interviewsToday ?? 0,
    hiresToday: input.hiresToday ?? 0,
    employerGrowth: input.employerGrowth ?? 0,
    candidateGrowth: input.candidateGrowth ?? 0,
    revenue: input.revenue ?? 0,
    emailQueue: input.emailQueue ?? 0,
    notificationQueue: input.notificationQueue ?? 0,
    errors: input.errors ?? 0,
    warnings: input.warnings ?? 0,
    environment: input.environment ?? "development",
    deployVersion: input.deployVersion ?? "local"
  };
}

export function productionReadinessScore(input: { checks: MonitoringCheck[]; queuesReady: boolean; webhooksReady: boolean; publicApisReady: boolean; featureFlagsReady: boolean }) {
  const healthyCritical = input.checks.filter((check) => check.critical && check.status === "healthy").length;
  const criticalTotal = Math.max(input.checks.filter((check) => check.critical).length, 1);
  const infra = (healthyCritical / criticalTotal) * 60;
  const platform = [input.queuesReady, input.webhooksReady, input.publicApisReady, input.featureFlagsReady].filter(Boolean).length * 10;
  return Math.round(infra + platform);
}

export function signWebhookPayload(payload: string, secret: string) {
  let hash = 0;
  const input = `${payload}.${secret}`;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return `v1=${Math.abs(hash).toString(16)}`;
}

function template(key: string, name: string, channels: CommunicationChannel[], variables: string[]): MessageTemplate {
  return { key, name, channels, variables, subject: name, localizationReady: true, html: true, darkModeCompatible: true };
}

function event(key: CommunicationEventKey, templateKey: string, defaultChannels: CommunicationChannel[], priority: NotificationPriority): CommunicationEvent {
  return { key, templateKey, defaultChannels, priority, retryable: true, trackOpen: defaultChannels.includes("email") };
}

function queue(name: QueueName, purpose: string, retry: boolean, deadLetter = true): QueueDefinition {
  return { name, purpose, retry, deadLetter };
}

function task(key: SchedulerTaskKey, label: string, queueName: QueueName, defaultCron: string): SchedulerTask {
  return { key, label, queue: queueName, defaultCron, idempotent: true };
}

function provider<T extends string>(key: T, label: string, adapter: string, status: "active" | "placeholder"): ProviderDefinition<T> {
  return { key, label, adapter, status };
}

function importExport(target: ImportExportTarget, formats: ImportExportFormat[]): ImportExportContract {
  return { target, formats, bulkImport: true, bulkExport: true, errorReport: true, validationReport: true, duplicateDetection: true };
}

function webhook(eventKey: WebhookEventKey): WebhookDefinition {
  return { event: eventKey, retry: true, signatureValidation: true };
}

function publicApi(scope: PublicApiScope, basePath: string): PublicApiDefinition {
  return { scope, basePath, apiKeyRequired: true, rateLimited: true };
}

function flag(key: FeatureFlagKey, enabled: boolean, beta: boolean): FeatureFlag {
  return { key, enabled, beta, source: "environment" };
}
