import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PlansClient } from "./PlansClient";

import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "خرید اشتراک VIP | دسترسی نامحدود به بالاترین کیفیت دانلود",
  description:
    "تهیه اشتراک ویژه آهنگام جهت دانلود با کیفیت‌های ۳۲۰ و FLAC بدون تبلیغات و با سرعت نامحدود.",
  keywords: ["خرید اشتراک آهنگام", "اشتراک VIP موسیقی", "دانلود بی نهایت", "آهنگام"],
  alternates: {
    canonical: `${getSiteUrl()}/plans`,
  },
  openGraph: {
    title: "خرید اشتراک VIP | رسانه آهنگام",
    description: "دانلود بدون محدودیت با بالاترین کیفیت در رسانه آهنگام.",
    url: `${getSiteUrl()}/plans`,
    siteName: "آهنگام",
    locale: "fa_IR",
  },
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const user = await getCurrentUser();

  const [plans, bankSettings, userSub] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: ["BANK_CARD_NUMBER", "BANK_CARD_HOLDER", "BANK_NAME"] } },
    }),
    user
      ? prisma.userSubscription.findFirst({
          where: { userId: user.id },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        })
      : null,
  ]);

  const bankInfo = {
    cardNumber: bankSettings.find((s) => s.key === "BANK_CARD_NUMBER")?.value || "۶۰۳۷-۹۹۷۵-۱۲۳۴-۵۶۷۸",
    cardHolder: bankSettings.find((s) => s.key === "BANK_CARD_HOLDER")?.value || "بیتا",
    bankName: bankSettings.find((s) => s.key === "BANK_NAME")?.value || "بانک ملی ایران",
  };

  return (
    <PlansClient
      plans={plans}
      bankInfo={bankInfo}
      initialUserSubscription={userSub as any}
      isLoggedIn={!!user}
    />
  );
}
