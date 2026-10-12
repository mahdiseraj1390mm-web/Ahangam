import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PlansClient } from "./PlansClient";

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
