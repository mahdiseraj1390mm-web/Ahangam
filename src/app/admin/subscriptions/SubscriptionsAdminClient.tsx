"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Clock,
  AlertCircle,
  FileText,
  User,
  Phone,
  Calendar,
  ExternalLink,
  Save,
  Search,
} from "lucide-react";
import { formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface SubscriptionRow {
  id: string;
  userId: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED" | "CANCELLED";
  receiptImage: string | null;
  rejectReason: string | null;
  transactionRef: string | null;
  amountPaid: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    phone: string;
    role: string;
  };
  plan: {
    id: string;
    name: string;
    durationDays: number;
    price: number;
  };
}

interface BankInfo {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
}

export function SubscriptionsAdminClient({
  initialSubscriptions,
  initialBankInfo,
}: {
  initialSubscriptions: SubscriptionRow[];
  initialBankInfo: BankInfo;
}) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>(initialSubscriptions);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("PENDING");
  const [search, setSearch] = useState("");

  // Bank Info form state
  const [cardNumber, setCardNumber] = useState(initialBankInfo.cardNumber);
  const [cardHolder, setCardHolder] = useState(initialBankInfo.cardHolder);
  const [bankName, setBankName] = useState(initialBankInfo.bankName);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState<string | null>(null);

  // Reject modal state
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSaveBankInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingBank(true);
      setBankMsg(null);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            BANK_CARD_NUMBER: cardNumber.trim(),
            BANK_CARD_HOLDER: cardHolder.trim(),
            BANK_NAME: bankName.trim(),
          },
        }),
      });

      if (res.ok) {
        setBankMsg("اطلاعات کارت بانکی با موفقیت ذخیره شد!");
        setTimeout(() => setBankMsg(null), 4000);
      } else {
        alert("خطا در ذخیره اطلاعات کارت.");
      }
    } catch {
      alert("خطای اتصال به سرور.");
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("آیا از تایید این فیش و فعال‌سازی فوری اشتراک VIP برای کاربر اطمینان دارید؟")) {
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "APPROVE" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "ACTIVE", rejectReason: null } : s))
        );
        alert("اشتراک با موفقیت تایید و کاربر به سطح VIP ارتقا یافت!");
      } else {
        alert(data.message || "خطا در تایید اشتراک.");
      }
    } catch {
      alert("خطای اتصال.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSubId) return;

    try {
      setIsProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectingSubId,
          action: "REJECT",
          rejectReason: rejectReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === rejectingSubId
              ? { ...s, status: "REJECTED", rejectReason: rejectReason.trim() }
              : s
          )
        );
        setRejectingSubId(null);
        setRejectReason("");
        alert("درخواست با موفقیت رد شد و دلیل برای کاربر ثبت گردید.");
      } else {
        alert(data.message || "خطا در رد درخواست.");
      }
    } catch {
      alert("خطای ارتباط.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = subscriptions.filter((s) => {
    if (filter !== "ALL" && s.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.user.displayName.toLowerCase().includes(q);
      const matchPhone = s.user.phone.includes(q);
      const matchRef = s.transactionRef?.toLowerCase().includes(q);
      return matchName || matchPhone || matchRef;
    }
    return true;
  });

  const pendingCount = subscriptions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* 1. Bank Card Configuration Card */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-brand font-bold text-base">
          <CreditCard className="w-5 h-5" />
          <span>تنظیمات شماره کارت بانکی جهت دریافت مبالغ اشتراک</span>
        </div>
        <p className="text-xs text-content-muted">
          این اطلاعات به کاربران در صفحه پلن‌ها نشان داده می‌شود تا وجه را واریز و فیش را بارگذاری کنند.
        </p>

        {bankMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{bankMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveBankInfo} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-content-secondary mb-1">
              شماره کارت ۱۶ رقمی
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="۶۰۳۷-۹۹۷۵-...."
              dir="ltr"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm font-mono text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-secondary mb-1">
              نام و نام‌خانوادگی صاحب کارت
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="مهدی سراج"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-secondary mb-1">
              نام بانک
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="بانک ملی ایران"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSavingBank}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-lg shadow-brand/20 hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingBank ? "در حال ذخیره..." : "ذخیره اطلاعات بانکی"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Receipts & Subscriptions Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "PENDING"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "bg-surface-card border border-surface-border text-content-secondary hover:text-content-primary"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>در انتظار تایید ({toPersianDigits(pendingCount)})</span>
          </button>

          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "ACTIVE"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-surface-card border border-surface-border text-content-secondary hover:text-content-primary"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>تایید شده (VIP فعال)</span>
          </button>

          <button
            onClick={() => setFilter("REJECTED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === "REJECTED"
                ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                : "bg-surface-card border border-surface-border text-content-secondary hover:text-content-primary"
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>رد شده‌ها</span>
          </button>

          <button
            onClick={() => setFilter("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-surface-200 text-content-primary font-black"
                : "bg-surface-card border border-surface-border text-content-secondary hover:text-content-primary"
            }`}
          >
            <span>همه ({toPersianDigits(subscriptions.length)})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام یا شماره موبایل..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
          />
          <Search className="w-4 h-4 text-content-muted absolute right-3 top-2.5" />
        </div>
      </div>

      {/* 3. Receipts List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-surface-card border border-surface-border space-y-2">
          <FileText className="w-8 h-8 text-content-muted mx-auto opacity-50" />
          <p className="text-sm font-bold text-content-primary">هیچ درخواستی در این بخش وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((sub) => {
            const isPending = sub.status === "PENDING";
            const isActive = sub.status === "ACTIVE";
            const isRejected = sub.status === "REJECTED";

            return (
              <div
                key={sub.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-surface-border/80 transition-all"
              >
                {/* User & Plan info */}
                <div className="flex items-start gap-4">
                  {/* Receipt thumbnail */}
                  {sub.receiptImage ? (
                    <button
                      onClick={() => setPreviewImage(sub.receiptImage)}
                      className="relative w-20 h-24 rounded-2xl overflow-hidden border-2 border-brand/40 shadow-md group shrink-0 focus:outline-none"
                      title="مشاهده فیش واریزی در سایز بزرگ"
                    >
                      <img
                        src={sub.receiptImage}
                        alt="فیش واریزی"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                        بزرگنمایی
                      </div>
                    </button>
                  ) : (
                    <div className="w-20 h-24 rounded-2xl bg-surface-100 border border-surface-border flex items-center justify-center text-content-muted text-[10px] text-center p-2 shrink-0">
                      بدون فیش
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-content-primary">
                        {sub.user.displayName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {isPending
                          ? "در انتظار تایید"
                          : isActive
                          ? "VIP فعال"
                          : "رد شده"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
                      <span className="flex items-center gap-1 font-mono" dir="ltr">
                        <Phone className="w-3 h-3" />
                        {sub.user.phone}
                      </span>
                      <span>
                        پلن: <b className="text-content-primary">{sub.plan.name}</b> (
                        {toPersianDigits(sub.plan.durationDays)} روزه)
                      </span>
                      <span>
                        مبلغ واریزی:{" "}
                        <b className="text-emerald-400">
                          {formatNumberPersian(sub.amountPaid || sub.plan.price)} تومان
                        </b>
                      </span>
                    </div>

                    {sub.transactionRef && (
                      <p className="text-xs text-content-muted">
                        کد پیگیری کاربر: <span className="font-mono text-content-primary">{sub.transactionRef}</span>
                      </p>
                    )}

                    {isRejected && sub.rejectReason && (
                      <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        <b>علت رد درخواست:</b> {sub.rejectReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-surface-border">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(sub.id)}
                        disabled={isProcessing}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>تایید و فعال‌سازی VIP</span>
                      </button>

                      <button
                        onClick={() => {
                          setRejectingSubId(sub.id);
                          setRejectReason("");
                        }}
                        disabled={isProcessing}
                        className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>رد درخواست</span>
                      </button>
                    </>
                  )}

                  {isActive && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>فعال تا تاریخ {new Date(sub.endsAt).toLocaleDateString("fa-IR")}</span>
                    </span>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => handleApprove(sub.id)}
                      disabled={isProcessing}
                      className="px-3.5 py-2 rounded-xl bg-surface-100 text-content-primary hover:bg-emerald-500 hover:text-white text-xs font-bold transition-all"
                    >
                      تایید مجدد
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Reject Modal with Reason Input */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-content-primary">ثبت علت رد فیش واریزی</h3>
              <button
                onClick={() => setRejectingSubId(null)}
                className="p-1.5 rounded-xl hover:bg-surface-100 text-content-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-content-muted">
              این پیام دقیقاً در صفحه پلن‌ها و پروفایل کاربر نمایش داده خواهد شد تا فیش صحیح را ارسال کند.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="مثال: مبلغ واریز شده کمتر از مبلغ پلن است، یا تصویر فیش ناخوانا می‌باشد."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-red-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingSubId(null)}
                  className="px-4 py-2 rounded-xl bg-surface-100 text-content-secondary text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-600 disabled:opacity-50"
                >
                  {isProcessing ? "در حال ثبت..." : "ارسال دلیل و رد فیش"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Image Preview Full Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={previewImage}
              alt="بزرگنمایی فیش"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
