export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EMPLOYER" | "JOB_SEEKER";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: string | {
    code: string;
    message: string;
    details?: unknown;
  };
  details?: Record<string, string> | string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type User = {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isVerified?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type UploadPurpose = "avatar" | "resume" | "logo" | "banner" | "gallery";

export type NavigationItem = {
  label: string;
  href: string;
};

export type ThemeMode = "light" | "dark" | "system";

export type ToastIntent = "success" | "info" | "warning" | "error";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  intent?: ToastIntent;
};
