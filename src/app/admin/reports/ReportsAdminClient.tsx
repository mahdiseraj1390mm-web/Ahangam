"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, X, Trash2, Eye } from "lucide-react";
import { formatPersianDate } from "@/lib/utils";

interface ReportRow {
  id: string;
  contentType: string;
  contentId: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: string | Date;
}

export function ReportsAdminClient({ initialReports }: { initialReports: ReportRow[] }) {
  const [reports, setReports] = useState<ReportRow[]>(initialReports);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReports(
          reports.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
        );
      }
    } catch {
      alert("خطا در به‌روزرسانی گزارش.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این گزارش اطمینان دارید؟")) return;
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id));
      }
    } catch {
      alert("خطا در حذف.");
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
              <th className="p-3.5">علت گزارش</th>
              <th className="p-3.5">نوع و شناسه محتوا</th>
              <th className="p-3.5">توضیحات تکمیلی</th>
              <th className="p-3.5">وضعیت</th>
              <th className="p-3.5">تاریخ ثبت</th>
              <th className="p-3.5 text-center">اقدامات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-surface-50/50 transition-colors">
                <td className="p-3.5 font-bold text-red-400">{r.reason}</td>
                <td className="p-3.5 font-mono text-content-muted">
                  {r.contentType}: {r.contentId}
                </td>
                <td className="p-3.5 max-w-xs">
                  <p className="text-content-secondary line-clamp-2 leading-relaxed">
                    {r.description || "بدون توضیحات اضافی"}
                  </p>
                </td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "REVIEWED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : r.status === "DISMISSED"
                        ? "bg-surface-100 text-content-muted"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    {r.status === "REVIEWED" ? "رسیدگی شد" : r.status === "DISMISSED" ? "نادیده گرفته شد" : "معلق"}
                  </span>
                </td>
                <td className="p-3.5 text-content-muted">{formatPersianDate(r.createdAt)}</td>
                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    {r.status !== "REVIEWED" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "REVIEWED")}
                        disabled={isUpdating === r.id}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="علامت‌گذاری به عنوان بررسی شده"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {r.status !== "DISMISSED" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "DISMISSED")}
                        disabled={isUpdating === r.id}
                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                        title="رد کردن گزارش"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={isUpdating === r.id}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="حذف گزارش"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-content-muted">
                  هیچ گزارشی ثبت نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
