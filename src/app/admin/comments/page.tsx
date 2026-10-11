import React from "react";
import { prisma } from "@/lib/prisma";
import { CommentsAdminClient } from "./CommentsAdminClient";

export const revalidate = 0;

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: {
      user: {
        select: {
          displayName: true,
          phone: true,
          role: true,
        },
      },
      song: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت و نظارت بر دیدگاه‌ها</h1>
        <p className="text-xs text-content-muted">
          بررسی دیدگاه‌های ارسالی کاربران، تایید، رد یا حذف موارد نامناسب
        </p>
      </div>

      <CommentsAdminClient initialComments={comments as any} />
    </div>
  );
}
