"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-[#0b0813] text-white flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-xl font-bold">خطای سراسری در سامانه</h2>
          <p className="text-xs text-gray-400">مشکلی در پردازش پیش آمده است.</p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
