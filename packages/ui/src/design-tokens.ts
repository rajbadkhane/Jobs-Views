export const careerColors = {
  teal: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A"
  },
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A"
  },
  amber: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F"
  },
  emerald: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B"
  },
  orange: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12"
  },
  red: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    200: "#FECACA",
    300: "#FCA5A5",
    400: "#F87171",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
    800: "#991B1B",
    900: "#7F1D1D"
  },
  sky: {
    50: "#F0F9FF",
    100: "#E0F2FE",
    200: "#BAE6FD",
    300: "#7DD3FC",
    400: "#38BDF8",
    500: "#0EA5E9",
    600: "#0284C7",
    700: "#0369A1",
    800: "#075985",
    900: "#0C4A6E"
  },
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    700: "#334155",
    800: "#1E293B",
    900: "#0F172A"
  }
} as const;

export const careerRadii = {
  input: "12px",
  card: "20px",
  button: "14px",
  dialog: "24px",
  bottomSheet: "32px",
  badge: "999px",
  avatar: "999px"
} as const;

export const careerMotion = {
  default: { duration: 0.15, ease: "easeOut" },
  hover: { duration: 0.12, ease: "easeOut" },
  buttonHover: { duration: 0.12, ease: "easeOut" },
  buttonPress: { duration: 0.09, ease: "easeOut" },
  cardHover: { duration: 0.16, ease: "easeOut" },
  dropdown: { duration: 0.18, ease: "easeOut" },
  dialog: { duration: 0.22, ease: "easeOut" },
  drawer: { duration: 0.24, ease: "easeOut" },
  sidebar: { duration: 0.22, ease: "easeOut" },
  page: { duration: 0.25, ease: "easeOut" },
  chart: { duration: 0.6, ease: "easeOut" },
  progress: { duration: 0.7, ease: "easeOut" },
  toast: { duration: 0.18, ease: "easeOut" },
  notification: { duration: 0.18, ease: "easeOut" }
} as const;

export const careerContainers = {
  public: "1280px",
  candidate: "1440px",
  employer: "1600px",
  admin: "1700px"
} as const;
