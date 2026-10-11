import React from "react";
import Link from "next/link";
import { Music, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center font-black text-3xl shadow-xl animate-bounce">
        ۴۰۴
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          صفحه مورد نظر یافت نشد!
        </h1>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          ممکن است آدرس مورد نظر تغییر کرده باشد یا این قطعه موسیقی از دسترس خارج شده باشد.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-2xl bg-brand text-white text-xs font-bold shadow-lg shadow-brand/30 hover:opacity-95 flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
        <Link
          href="/songs"
          className="px-5 py-3 rounded-2xl bg-surface-card border border-surface-border text-xs font-bold text-content-secondary hover:text-content-primary"
        >
          آرشیو آهنگ‌ها
        </Link>
      </div>
    </div>
  );
}
