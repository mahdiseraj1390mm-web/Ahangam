"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Crown,
  Heart,
  ListMusic,
  LogOut,
  Calendar,
  Phone,
  ShieldAlert,
  Palette,
  Edit3,
  X,
  Lock,
  Check,
} from "lucide-react";
import { formatPersianDate, toPersianDigits } from "@/lib/utils";

interface ProfileClientProps {
  user: {
    id: string;
    phone: string;
    displayName: string;
    role: string;
    subscriptionExpiresAt?: string | Date | null;
    createdAt: string | Date;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setEditSuccess(null);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newDisplayName.trim(),
          password: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser({ ...currentUser, displayName: newDisplayName.trim() });
        setEditSuccess("اطلاعات پروفایل با موفقیت به‌روزرسانی شد.");
        setNewPassword("");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditSuccess(null);
        }, 1500);
      } else {
        alert(data.message || "خطا در به‌روزرسانی.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSaving(false);
    }
  };

  const isVip = currentUser.role === "VIP" || currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Profile Card */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand to-pink-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
              {user.displayName[0] || "ک"}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-black text-content-primary">
                  {user.displayName}
                </h1>
                {isVip && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Crown className="w-3 h-3" />
                    <span>{user.role}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-content-muted mt-1 font-mono flex items-center gap-1 justify-center sm:justify-start">
                <Phone className="w-3.5 h-3.5" />
                <span>{user.phone}</span>
              </p>
              <p className="text-[11px] text-content-muted mt-1">
                عضویت از {formatPersianDate(user.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-surface-border bg-surface-50 hover:bg-surface-100 text-content-primary text-xs font-bold transition-colors"
            >
              <Edit3 className="w-4 h-4 text-brand" />
              <span>ویرایش پروفایل</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-content-primary">
                {isVip ? "اشتراک شما فعال است" : "اشتراک عادی (رایگان)"}
              </h4>
              <p className="text-xs text-content-muted">
                {user.subscriptionExpiresAt
                  ? `تاریخ انقضا: ${formatPersianDate(user.subscriptionExpiresAt)}`
                  : "برای دسترسی نامحدود به کیفیت FLAC و ۳۲۰، پلن VIP تهیه کنید."}
              </p>
            </div>
          </div>

          {!isVip && (
            <Link
              href="/plans"
              className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity shrink-0"
            >
              خرید اشتراک VIP
            </Link>
          )}
        </div>

        {/* Admin Link if Admin */}
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>شما دسترسی مدیریت سیستم دارید.</span>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
            >
              ورود به پنل مدیریت
            </Link>
          </div>
        )}
      </div>

      {/* Library Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/profile/library"
          className="flex items-center justify-between p-5 rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border transition-all group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors">
                آهنگ‌های مورد علاقه
              </h4>
              <p className="text-xs text-content-muted">لیست نشان‌شده‌های شما</p>
            </div>
          </div>
        </Link>

        <Link
          href="/artists"
          className="flex items-center justify-between p-5 rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border transition-all group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors">
                هنرمندان دنبال‌شده
              </h4>
              <p className="text-xs text-content-muted">مشاهده آثار هنرمندان محبوب</p>
            </div>
          </div>
        </Link>
      </div>
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="font-bold text-base text-content-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand" />
                <span>ویرایش اطلاعات پروفایل</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  نام و نام خانوادگی / نام نمایشی
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                  placeholder="نام شما"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  شماره موبایل (غیرقابل تغییر)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.phone}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-border text-sm text-content-muted cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  رمز عبور جدید (در صورت تمایل به تغییر)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                    placeholder="حداقل ۶ کاراکتر (اختیاری)"
                  />
                  <Lock className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md disabled:opacity-50"
                >
                  {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-muted font-bold text-xs transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
