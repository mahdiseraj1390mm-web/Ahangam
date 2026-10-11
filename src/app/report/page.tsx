"use client";

import React, { useState } from "react";
import { AlertTriangle, Check, Send } from "lucide-react";

export default function ReportProblemPage() {
  const [contentType, setContentType] = useState("SONG");
  const [contentId, setContentId] = useState("");
  const [reason, setReason] = useState("خرابی لینک دانلود");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId: contentId || "general",
          reason,
          description,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("خطا در ارسال گزارش.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-content-primary">گزارش خرابی یا تخلف</h1>
        <p className="text-xs sm:text-sm text-content-muted">
          در صورت مشاهده لینک نامعتبر، پخش نشدن قطعه صوتی یا نقض قوانین، به ما اطلاع دهید
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl">
        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-content-primary">
              گزارش شما دریافت شد
            </h3>
            <p className="text-xs text-content-muted">
              تیم پشتیبانی و فنی آهنگام در اسرع وقت مورد اعلامی را بررسی و برطرف خواهد کرد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                موضوع گزارش *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              >
                <option value="خرابی لینک دانلود">خرابی لینک دانلود</option>
                <option value="عدم پخش فایل صوتی">عدم پخش آنلاین فایل صوتی</option>
                <option value="اشتباه در نام خواننده یا اثر">اشتباه در نام اثر یا عوامل تولید</option>
                <option value="نقض کپی رایت">گزارش نقض حقوق نشر (DMCA)</option>
                <option value="سایر موارد">سایر موارد فنی</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                نام اثر یا آدرس صفحه (در صورت وجود)
              </label>
              <input
                type="text"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="مثال: قطعه یادگار بنفش از بیتا"
                className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                توضیحات تکمیلی مشکل *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="لطفاً شرح مختصری از مشکل به وجود آمده بنویسید..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال گزارش"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
