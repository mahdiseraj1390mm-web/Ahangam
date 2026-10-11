"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, Lock, Phone, User, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "خطا در ثبت‌نام.");
        setLoading(false);
        return;
      }

      // Immediate full navigation so cookies are instantly sent and server layout recognizes user
      window.location.href = "/";
    } catch {
      setError("خطای اتصال به سرور. لطفاً مجدداً تلاش کنید.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center shadow-md">
            <Music className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-content-primary">عضویت در آهنگام</h1>
          <p className="text-xs text-content-muted">
            ساخت حساب کاربری برای دسترسی به کیفیت‌ها و پلی‌لیست‌ها
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              نام یا نام نمایشی
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="مثال: آرش یا علی رضایی"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
              />
              <User className="w-4 h-4 text-content-muted absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              شماره تلفن همراه
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09123456789"
                dir="ltr"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
              />
              <Phone className="w-4 h-4 text-content-muted absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              رمز عبور (حداقل ۶ کاراکتر)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
              />
              <Lock className="w-4 h-4 text-content-muted absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? "در حال ثبت‌نام..." : "ایجاد حساب کاربری"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-surface-border text-xs text-content-muted">
          <span>قبلاً ثبت‌نام کرده‌اید؟ </span>
          <Link href="/auth/login" className="font-bold text-brand hover:underline">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
}
