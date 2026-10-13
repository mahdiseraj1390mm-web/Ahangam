/**
 * Centralized Domain & Site URL configuration for Ahangam
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (Explicit override when user purchases domain)
 * 2. Active live Vercel domain (https://ahangam-b18n.vercel.app)
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
    return "http://localhost:3000";
  }

  return "https://ahangam-b18n.vercel.app";
}

export const SITE_URL = getSiteUrl();
