import nextConfig from "../../packages/config/next.config.mjs";

// Legacy top-level candidate routes were never linked from anywhere in the app (confirmed via
// codebase search) and duplicated the real /candidate/* tree. Redirect rather than delete so old
// bookmarks/links still land somewhere useful.
const candidateRedirects = [
  ["/dashboard", "/candidate"],
  ["/profile", "/candidate/profile"],
  ["/applications", "/candidate/jobs/applied"],
  ["/messages", "/candidate/messages"],
  ["/notifications", "/candidate/notifications"],
  ["/settings", "/candidate/settings"],
  ["/saved-jobs", "/candidate/jobs/saved"],
  ["/job-alerts", "/candidate"],
  ["/profile-strength", "/candidate/career-health"],
  ["/recommended-jobs", "/candidate/jobs/recommended"]
];

export default {
  ...nextConfig,
  async redirects() {
    const base = (await nextConfig.redirects?.()) ?? [];
    return [
      ...base,
      ...candidateRedirects.map(([source, destination]) => ({ source, destination, permanent: true }))
    ];
  }
};
