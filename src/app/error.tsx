"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-400 flex items-center justify-center shadow-lg">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-xl sm:text-2xl font-black text-content-primary">
          خطایی در بارگذاری اطلاعات رخ داده است
        </h1>
        <p className="text-xs text-content-muted leading-relaxed">
          سامانه هنگام پردازش این بخش با مشکل غیرمنتظره روبه‌رو شد. لطفاً دوباره تلاش کنید.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>تلاش مجدد</span>
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-xs font-bold text-content-secondary hover:text-content-primary flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>صفحه اصلی</span>
        </Link>
      </div>
    </div>
  );
}
