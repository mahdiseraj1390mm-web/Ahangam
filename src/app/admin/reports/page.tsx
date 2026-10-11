import React from "react";
import { prisma } from "@/lib/prisma";
import { ReportsAdminClient } from "./ReportsAdminClient";

export const revalidate = 0;

export default async function AdminReportsPage() {
  const reports = await prisma.contentReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">گزارش‌های خرابی و تخلف محتوا</h1>
        <p className="text-xs text-content-muted">
          بررسی گزارش‌های دریافتی از کاربران درباره خرابی لینک‌ها، کپی‌رایت یا فایل‌های صوتی
        </p>
      </div>

      <ReportsAdminClient initialReports={reports as any} />
    </div>
  );
}
