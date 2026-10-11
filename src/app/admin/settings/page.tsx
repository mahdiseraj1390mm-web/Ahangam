import React from "react";
import { prisma } from "@/lib/prisma";
import { SettingsAdminClient } from "./SettingsAdminClient";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">تنظیمات و محتوای سایت</h1>
        <p className="text-xs text-content-muted">
          کنترل کامل متن‌ها، نام‌های پیش‌فرض، قوانین دانلود و تم سامانه بدون نیاز به تغییر کد
        </p>
      </div>

      <SettingsAdminClient initialSettings={settings} />
    </div>
  );
}
