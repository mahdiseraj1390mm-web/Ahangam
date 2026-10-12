"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Loader2,
  CreditCard,
  Copy,
  Upload,
  Clock,
  AlertCircle,
  X,
  FileText,
} from "lucide-react";
import { upload } from "@vercel/blob/client";
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

interface BankInfo {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
}

interface UserSub {
  id: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED" | "CANCELLED";
  receiptImage: string | null;
  rejectReason: string | null;
  transactionRef: string | null;
  amountPaid: number;
  endsAt: string;
  plan: {
    name: string;
  };
}

export function PlansClient({
  plans,
  bankInfo,
  initialUserSubscription,
  isLoggedIn,
}: {
  plans: PlanItem[];
  bankInfo: BankInfo;
  initialUserSubscription: UserSub | null;
  isLoggedIn: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [userSub, setUserSub] = useState<UserSub | null>(initialUserSubscription);

  // Payment modal state
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCard = () => {
    const rawNumber = bankInfo.cardNumber.replace(/[^\d]/g, "");
    navigator.clipboard.writeText(rawNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReceiptFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingReceipt(true);
      setErrorMsg(null);

      const safeBlobName = `receipt-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      let url = "";

      try {
        const newBlob = await upload(safeBlobName, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });
        url = newBlob.url;
      } catch {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          url = data.url;
        } else {
          throw new Error("خطا در بارگذاری تصویر فیش");
        }
      }

      if (url) {
        setReceiptImage(url);
      }
    } catch (err: any) {
      setErrorMsg(`خطا در آپلود فیش: ${err?.message || "مشکل در اتصال به سرور"}`);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!receiptImage) {
      setErrorMsg("لطفاً تصویر فیش واریزی را آپلود نمایید.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/subscriptions/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          receiptImage,
          transactionRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.subscription) {
        setUserSub({
          ...data.subscription,
          plan: { name: selectedPlan.name },
        });
        setSelectedPlan(null);
        setReceiptImage("");
        setTransactionRef("");
      } else {
        setErrorMsg(data.message || "خطا در ثبت فیش واریزی.");
      }
    } catch {
      setErrorMsg("خطای ارتباط با سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ارتقا به حساب کاربری ویژه VIP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-content-primary">
          پلن‌های اشتراک آهنگام
        </h1>
        <p className="text-xs sm:text-sm text-content-muted max-w-xl mx-auto leading-relaxed">
          با عضویت در جمع کاربران ویژه آهنگام، بدون محدودیت و با نهایت کیفیت (کیفیت ۳۲۰ و FLAC) آهنگ‌ها را بشنوید و دریافت کنید.
        </p>
      </div>

      {/* User Subscription Status Alert */}
      {userSub && userSub.status === "PENDING" && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-2 shadow-lg">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <Clock className="w-5 h-5 shrink-0" />
            <span>درخواست اشتراک «{userSub.plan.name}» در انتظار تایید مدیریت است</span>
          </div>
          <p className="text-xs text-amber-300/80 leading-relaxed pr-7">
            فیش واریزی شما با موفقیت دریافت شد و در حال حاضر توسط تیم مدیریت در دست بررسی است. به محض بررسی، اشتراک شما فوراً فعال خواهد شد.
          </p>
        </div>
      )}

      {userSub && userSub.status === "ACTIVE" && (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2 shadow-lg">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>اشتراک ویژه VIP شما فعال است!</span>
          </div>
          <p className="text-xs text-emerald-300/80 leading-relaxed pr-7">
            شما دارای اشتراک فعال «{userSub.plan.name}» تا تاریخ{" "}
            {new Date(userSub.endsAt).toLocaleDateString("fa-IR")} می‌باشید و دسترسی کامل به دانلود و پخش نامحدود دارید.
          </p>
        </div>
      )}

      {userSub && userSub.status === "REJECTED" && (
        <div className="p-5 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-2 shadow-lg">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>فیش واریزی قبلی شما توسط مدیریت تایید نشد</span>
          </div>
          <p className="text-xs text-red-300/90 leading-relaxed pr-7">
            <b>علت رد درخواست:</b> {userSub.rejectReason || "فیش ناخوانا است یا مبلغ واریزی مغایرت دارد."}
          </p>
          <p className="text-xs text-content-muted pr-7">
            می‌توانید در زیر، مجدداً پلن مورد نظر خود را انتخاب کرده و فیش واریزی صحیح را بارگذاری فرمایید.
          </p>
        </div>
      )}

      {/* Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const isFeatured = idx === 1;
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
                    <span className="text-3xl sm:text-4xl font-black text-content-primary">
                      {formatNumberPersian(plan.price)}
                    </span>
                    <span className="text-xs text-content-muted font-bold">تومان</span>
                  </div>
                  <span className="text-[11px] text-content-muted mt-1 block">
                    مدت اعتبار: {toPersianDigits(plan.durationDays)} روز
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 text-xs text-content-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>دانلود بدون محدودیت (روزانه {toPersianDigits(plan.downloadLimitPerDay)} آهنگ)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>بالاترین کیفیت صدا (کیفیت {plan.maxQuality})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>پخش آنلاین بدون تبلیغات و با سرعت حداکثری</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>پشتیبانی اختصاصی و اولویت‌دار</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setErrorMsg(null);
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isFeatured
                        ? "bg-brand text-white shadow-brand/30 hover:opacity-90"
                        : "bg-surface-100 hover:bg-brand hover:text-white text-content-primary"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>پرداخت کارت به کارت و ثبت فیش</span>
                  </button>
                ) : (
                  <Link
                    href={`/auth/login?redirect=/plans`}
                    className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all bg-surface-100 hover:bg-brand hover:text-white text-content-primary"
                  >
                    <span>ورود به حساب جهت خرید</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Receipt Upload Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div className="flex items-center gap-2 text-brand font-bold">
                <CreditCard className="w-5 h-5" />
                <span>خرید اشتراک «{selectedPlan.name}»</span>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-xl hover:bg-surface-100 text-content-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bank Card Info Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-brand/20 via-surface-50 to-surface-100 border border-brand/30 space-y-3">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span>{bankInfo.bankName}</span>
                <span className="font-bold text-brand">مبلغ: {formatNumberPersian(selectedPlan.price)} تومان</span>
              </div>

              {/* Card Number display with easy copy button */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-surface-card border border-surface-border">
                <span className="font-mono text-base sm:text-lg font-black tracking-widest text-content-primary" dir="ltr">
                  {bankInfo.cardNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-all shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? "کپی شد!" : "کپی شماره"}</span>
                </button>
              </div>

              <div className="text-xs text-content-secondary flex justify-between">
                <span>به نام: <b>{bankInfo.cardHolder}</b></span>
              </div>
            </div>

            {/* Receipt Upload Form */}
            <form onSubmit={handleSubmitReceipt} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-content-primary">
                  تصویر فیش واریزی (عکس یا اسکرین‌شات رسید انتقال)
                </label>
                <div className="relative border-2 border-dashed border-surface-border hover:border-brand/50 rounded-2xl p-4 text-center transition-all bg-surface-50">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleReceiptFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {receiptImage ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={receiptImage}
                        alt="فیش آپلود شده"
                        className="w-16 h-16 object-cover rounded-xl border border-brand shadow-md"
                      />
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 block">فیش با موفقیت آپلود شد!</span>
                        <span className="text-[10px] text-content-muted">برای تغییر روی کادر کلیک کنید</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 py-2">
                      <Upload className="w-6 h-6 text-brand mx-auto" />
                      <p className="text-xs font-bold text-content-secondary">
                        {isUploadingReceipt ? "در حال آپلود فیش..." : "کلیک برای انتخاب عکس فیش واریزی"}
                      </p>
                      <p className="text-[10px] text-content-muted">فرمت‌های JPG، PNG، WEBP تا ۱۰ مگابایت</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1">
                  شماره پیگیری یا ۴ رقم آخر کارت (اختیاری)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="مثال: ۱۲۳۴۵۶ یا چهار رقم آخر کارت واریزکننده"
                  dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 text-content-secondary text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingReceipt || !receiptImage}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-black shadow-lg shadow-brand/30 hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ثبت...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ارسال فیش و ثبت درخواست</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
