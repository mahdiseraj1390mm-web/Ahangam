/**
 * Centralized Domain & Site URL configuration for Ahangam
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Explicit production override)
 * 2. NEXT_PUBLIC_APP_URL (Legacy env var support)
 * 3. Default production domain (https://ahangam.ir)
 * 4. Localhost fallback during development
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "" && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  // Production default domain
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "https://ahangam.ir";
  }

  return "http://localhost:3000";
}

export const SITE_URL = getSiteUrl();
