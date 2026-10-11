import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UsersAdminClient } from "./UsersAdminClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      displayName: true,
      role: true,
      isBanned: true,
      permissions: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت کاربران و زیرادمین‌ها</h1>
        <p className="text-xs text-content-muted">
          مشاهده لیست کاربران، اعطای دسترسی VIP، تعیین نقش زیرادمین و مسدودسازی
        </p>
      </div>

      <UsersAdminClient
        initialUsers={users}
        currentUserRole={currentUser?.role || "ADMIN"}
      />
    </div>
  );
}
