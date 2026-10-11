"use client";

import React, { useState } from "react";
import { Sparkles, Check, ShieldCheck, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface PlanItem {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  price: number;
  maxQuality: string;
  downloadLimitPerDay: number;
  sortOrder: number;
}

export function PlansClient({ plans }: { plans: PlanItem[] }) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePurchase = async (plan: PlanItem) => {
    setSelectedPlanId(plan.id);
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/subscriptions/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(
          `تراکنش شبیه‌سازی درگاه بانکی با موفقیت تایید شد! اشتراک «${plan.name}» برای حساب شما فعال گردید.`
        );
      } else {
        alert(data.message || "برای خرید اشتراک لطفاً ابتدا وارد حساب کاربری خود شوید.");
      }
    } catch {
      alert("خطا در برقراری ارتباط با درگاه پرداخت.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ارتقا به حساب کاربری ویژه VIP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary">
          پلن‌های اشتراک آهنگام
        </h1>
        <p className="text-xs sm:text-sm text-content-muted max-w-xl mx-auto leading-relaxed">
          با عضویت در جمع کاربران ویژه آهنگام، بدون محدودیت و با نهایت کیفیت فایل‌های اصلی را بشنوید و دریافت کنید.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm text-center font-bold flex items-center justify-center gap-2">
          <Check className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const isFeatured = idx === 1; // popular middle plan
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                isFeatured
                  ? "bg-gradient-to-b from-brand/20 via-surface-card to-surface-card border-2 border-brand shadow-2xl scale-105 z-10"
                  : "bg-surface-card border border-surface-border shadow-xl hover:border-brand/40"
              }`}
            >
              {isFeatured && (
                <span className="absolute -top-3.5 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-brand text-white font-black text-[11px] shadow-lg">
                  پیشنهاد ویژه کاربران
                </span>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-content-primary">{plan.name}</h3>
                {plan.description && (
                  <p className="text-xs text-content-muted leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <div className="py-4 border-y border-surface-border">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-content-primary font-mono">
                      {formatNumberPersian(plan.price)}
                    </span>
                    <span className="text-xs text-content-muted">تومان</span>
                  </div>
                  <span className="text-[11px] text-content-muted mt-1 block">
                    اعتبار: {toPersianDigits(plan.durationDays)} روز
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-content-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>دسترسی به کیفیت خارق‌العاده {plan.maxQuality}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>دانلود تا {toPersianDigits(plan.downloadLimitPerDay)} قطعه در روز</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>نمایش متن همگام‌سازی شده ترانه‌ها</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>بدون هیچ‌گونه محدودیت سرعت یا تبلیغات</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePurchase(plan)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isFeatured
                      ? "bg-brand text-white shadow-brand/40 hover:opacity-95 active:scale-95"
                      : "bg-surface-50 hover:bg-brand hover:text-white border border-surface-border text-content-primary"
                  }`}
                >
                  {isProcessing && selectedPlanId === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>اتصال به درگاه...</span>
                    </>
                  ) : (
                    <span>خرید و فعال‌سازی فوری</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border text-center text-xs text-content-muted flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand" />
        <span>تراکنش‌ها از طریق درگاه‌های امن شتاب و با رمز پویا انجام می‌گیرند.</span>
      </div>
    </div>
  );
}
