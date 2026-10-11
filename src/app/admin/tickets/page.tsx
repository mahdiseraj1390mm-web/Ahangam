import React from "react";
import { prisma } from "@/lib/prisma";
import { TicketsAdminClient } from "./TicketsAdminClient";

export const revalidate = 0;

export default async function AdminTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">تیکت‌های پشتیبانی</h1>
        <p className="text-xs text-content-muted">
          رسیدگی به پیام‌های ارسالی از فرم تماس با ما، پاسخ‌دهی و تغییر وضعیت پیگیری
        </p>
      </div>

      <TicketsAdminClient initialTickets={tickets} />
    </div>
  );
}
