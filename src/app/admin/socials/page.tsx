import React from "react";
import { prisma } from "@/lib/prisma";
import { SocialsAdminClient } from "./SocialsAdminClient";

export const revalidate = 0;

export default async function AdminSocialsPage() {
  const socials = await prisma.socialLink.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">شبکه‌های اجتماعی و پیام‌رسان‌ها</h1>
        <p className="text-xs text-content-muted">
          تنظیم کانال‌ها و صفحات رسمی سایت (فقط لینک‌های ثبت‌شده در اینجا در فوتر نمایش داده می‌شوند)
        </p>
      </div>

      <SocialsAdminClient initialSocials={socials} />
    </div>
  );
}
