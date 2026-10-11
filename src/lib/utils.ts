import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English numbers to Persian digits
export function toPersianDigits(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "";
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

// Format seconds into MM:SS
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "۰۰:۰۰";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return toPersianDigits(formatted);
}

// Format numbers with thousands separator in Persian
export function formatNumberPersian(num: number): string {
  const parts = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");
  return toPersianDigits(parts);
}

// Normalize Persian and Arabic text for robust search
export function normalizePersian(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ة]/g, "ه")
    .replace(/[إأآ]/g, "ا")
    .replace(/[\u200C\u200D]/g, " ") // replace zero-width non-joiner with standard space for search matching
    .replace(/\s+/g, " ");
}

// Format date to Persian relative or standard format
export function formatPersianDate(dateInput: Date | string | number): string {
  try {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}
