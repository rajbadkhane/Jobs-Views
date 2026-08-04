export type PlanCode = "free" | "starter" | "professional" | "enterprise";
export type MarketplaceProductCode =
  | "featured_job"
  | "boost_job"
  | "urgent_hiring"
  | "premium_listing"
  | "sponsored_job"
  | "resume_unlock"
  | "premium_search"
  | "api_access";

export type PlanFeatureKey =
  | "jobLimit"
  | "recruiterLimit"
  | "featuredJobs"
  | "aiMatching"
  | "analytics"
  | "careerBranding"
  | "prioritySupport"
  | "bulkImport"
  | "apiAccess"
  | "resumeDatabase";

export type PlanEntitlements = Record<PlanFeatureKey, number | boolean>;

export type MarketplacePlan = {
  code: PlanCode;
  name: string;
  monthlyPrice: number;
  entitlements: PlanEntitlements;
};

export type UsageSnapshot = {
  activeJobs?: number;
  recruiters?: number;
  featuredJobs?: number;
  resumeUnlocks?: number;
  apiCalls?: number;
};

export type EntitlementDecision = {
  allowed: boolean;
  reason: string;
  remaining?: number;
};

export type BusinessMetricsInput = {
  monthlyRecurringRevenue?: number;
  annualRecurringRevenue?: number;
  revenue?: number;
  refunds?: number;
  invoices?: number;
  employers?: number;
  newEmployers?: number;
  churnedEmployers?: number;
  candidates?: number;
  applications?: number;
};

export const marketplacePlans: MarketplacePlan[] = [
  {
    code: "free",
    name: "Free",
    monthlyPrice: 0,
    entitlements: {
      jobLimit: 1,
      recruiterLimit: 1,
      featuredJobs: 0,
      aiMatching: false,
      analytics: false,
      careerBranding: false,
      prioritySupport: false,
      bulkImport: false,
      apiAccess: false,
      resumeDatabase: false
    }
  },
  {
    code: "starter",
    name: "Starter",
    monthlyPrice: 2999,
    entitlements: {
      jobLimit: 5,
      recruiterLimit: 3,
      featuredJobs: 1,
      aiMatching: true,
      analytics: true,
      careerBranding: false,
      prioritySupport: false,
      bulkImport: false,
      apiAccess: false,
      resumeDatabase: false
    }
  },
  {
    code: "professional",
    name: "Professional",
    monthlyPrice: 9999,
    entitlements: {
      jobLimit: 25,
      recruiterLimit: 10,
      featuredJobs: 5,
      aiMatching: true,
      analytics: true,
      careerBranding: true,
      prioritySupport: true,
      bulkImport: true,
      apiAccess: false,
      resumeDatabase: true
    }
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyPrice: 0,
    entitlements: {
      jobLimit: -1,
      recruiterLimit: -1,
      featuredJobs: -1,
      aiMatching: true,
      analytics: true,
      careerBranding: true,
      prioritySupport: true,
      bulkImport: true,
      apiAccess: true,
      resumeDatabase: true
    }
  }
];

export const marketplaceProducts: Record<MarketplaceProductCode, { name: string; category: string; defaultPrice: number; durationDays?: number }> = {
  featured_job: { name: "Featured Job", category: "visibility", defaultPrice: 1499, durationDays: 7 },
  boost_job: { name: "Boost Job", category: "visibility", defaultPrice: 999, durationDays: 3 },
  urgent_hiring: { name: "Urgent Hiring Badge", category: "visibility", defaultPrice: 699, durationDays: 7 },
  premium_listing: { name: "Premium Listing", category: "visibility", defaultPrice: 1999, durationDays: 14 },
  sponsored_job: { name: "Sponsored Job", category: "ads", defaultPrice: 2999, durationDays: 7 },
  resume_unlock: { name: "Resume Unlock", category: "resume_database", defaultPrice: 99 },
  premium_search: { name: "Premium Candidate Search", category: "resume_database", defaultPrice: 1999, durationDays: 30 },
  api_access: { name: "Employer API Access", category: "platform", defaultPrice: 4999, durationDays: 30 }
};

export function planByCode(code?: string) {
  return marketplacePlans.find((plan) => plan.code === code) ?? marketplacePlans[0];
}

export function validateEntitlement(planCode: string | undefined, feature: PlanFeatureKey, usage: UsageSnapshot = {}): EntitlementDecision {
  const plan = planByCode(planCode);
  const entitlement = plan.entitlements[feature];
  if (typeof entitlement === "boolean") {
    return { allowed: entitlement, reason: entitlement ? "Feature enabled by plan." : "Upgrade required for this feature." };
  }
  if (entitlement < 0) return { allowed: true, reason: "Unlimited by plan." };
  const used = usageForFeature(feature, usage);
  const remaining = Math.max(0, entitlement - used);
  return { allowed: remaining > 0, reason: remaining > 0 ? "Within plan limit." : "Plan limit reached.", remaining };
}

export function calculateBusinessMetrics(input: BusinessMetricsInput) {
  const mrr = input.monthlyRecurringRevenue ?? 0;
  const arr = input.annualRecurringRevenue ?? mrr * 12;
  const churn = input.employers ? ((input.churnedEmployers ?? 0) / input.employers) * 100 : 0;
  const ltv = churn > 0 ? mrr / (churn / 100) : mrr * 24;
  const netRevenue = (input.revenue ?? 0) - (input.refunds ?? 0);
  return {
    mrr,
    arr,
    churn: Math.round(churn * 100) / 100,
    ltv: Math.round(ltv),
    revenue: input.revenue ?? 0,
    netRevenue,
    collections: Math.max(0, netRevenue),
    invoiceCount: input.invoices ?? 0,
    employerGrowth: input.employers ? Math.round(((input.newEmployers ?? 0) / input.employers) * 10000) / 100 : 0,
    applicationVelocity: input.employers ? Math.round(((input.applications ?? 0) / input.employers) * 100) / 100 : 0
  };
}

export function boostExpiry(days = 7, from = new Date()) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function usageForFeature(feature: PlanFeatureKey, usage: UsageSnapshot) {
  if (feature === "jobLimit") return usage.activeJobs ?? 0;
  if (feature === "recruiterLimit") return usage.recruiters ?? 0;
  if (feature === "featuredJobs") return usage.featuredJobs ?? 0;
  if (feature === "apiAccess") return usage.apiCalls ?? 0;
  if (feature === "resumeDatabase") return usage.resumeUnlocks ?? 0;
  return 0;
}
