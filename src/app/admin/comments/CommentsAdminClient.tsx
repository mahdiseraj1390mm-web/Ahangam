"use client";

import React, { useState } from "react";
import { MessageSquare, Check, X, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { formatPersianDate } from "@/lib/utils";

interface CommentRow {
  id: string;
  text: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string | Date;
  user: {
    displayName: string;
    phone: string;
    role: string;
  };
  song: {
    id: string;
    title: string;
    slug: string;
  };
}

export function CommentsAdminClient({ initialComments }: { initialComments: CommentRow[] }) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
        );
      }
    } catch {
      alert("خطا در تغییر وضعیت نظر.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نظر اطمینان دارید؟")) return;
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch {
      alert("خطا در حذف نظر.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-surface-50 border-b border-surface-border text-content-secondary font-bold">
            <tr>
              <th className="p-3.5">کاربر</th>
              <th className="p-3.5">قطعه موسیقی</th>
              <th className="p-3.5">متن نظر</th>
              <th className="p-3.5">وضعیت</th>
              <th className="p-3.5">تاریخ ثبت</th>
              <th className="p-3.5 text-center">مدیریت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {comments.map((c) => (
              <tr key={c.id} className="hover:bg-surface-50/50 transition-colors">
                <td className="p-3.5">
                  <p className="font-bold text-content-primary">{c.user.displayName}</p>
                  <p className="text-[10px] text-content-muted font-mono">{c.user.phone}</p>
                </td>
                <td className="p-3.5">
                  <Link
                    href={`/song/${c.song.slug}`}
                    target="_blank"
                    className="font-bold text-brand hover:underline flex items-center gap-1"
                  >
                    <span>{c.song.title}</span>
                    <Eye className="w-3 h-3" />
                  </Link>
                </td>
                <td className="p-3.5 max-w-xs">
                  <p className="text-content-secondary line-clamp-2 leading-relaxed">{c.text}</p>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : c.status === "REJECTED"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {c.status === "APPROVED" ? "تایید شده" : c.status === "REJECTED" ? "رد شده" : "در انتظار"}
                  </span>
                </td>
                <td className="p-3.5 text-content-muted">{formatPersianDate(c.createdAt)}</td>
                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {c.status !== "APPROVED" && (
                      <button
                        onClick={() => handleStatusChange(c.id, "APPROVED")}
                        disabled={isUpdating === c.id}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="تایید و انتشار"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {c.status !== "REJECTED" && (
                      <button
                        onClick={() => handleStatusChange(c.id, "REJECTED")}
                        disabled={isUpdating === c.id}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                        title="رد کردن نظر"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isUpdating === c.id}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="حذف دائمی"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
