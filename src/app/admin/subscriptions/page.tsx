import React from "react";
import { prisma } from "@/lib/prisma";
import { SubscriptionsAdminClient } from "./SubscriptionsAdminClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const [subscriptions, bankSettings] = await Promise.all([
    prisma.userSubscription.findMany({
      include: {
        user: { select: { id: true, displayName: true, phone: true, role: true } },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findMany({
      where: { key: { in: ["BANK_CARD_NUMBER", "BANK_CARD_HOLDER", "BANK_NAME"] } },
    }),
  ]);

  const bankCardNumber = bankSettings.find((s) => s.key === "BANK_CARD_NUMBER")?.value || "";
  const bankCardHolder = bankSettings.find((s) => s.key === "BANK_CARD_HOLDER")?.value || "";
  const bankName = bankSettings.find((s) => s.key === "BANK_NAME")?.value || "";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت فیش‌های واریزی و اشتراک‌ها</h1>
        <p className="text-xs text-content-muted">
          بررسی فیش‌های کارت به کارت ارسالی کاربران، تایید آنی یا رد با ذکر دلیل شفاف
        </p>
      </div>

      <SubscriptionsAdminClient
        initialSubscriptions={subscriptions as any}
        initialBankInfo={{
          cardNumber: bankCardNumber,
          cardHolder: bankCardHolder,
          bankName: bankName,
        }}
      />
    </div>
  );
}
