"use client";

import React, { useState } from "react";
import { Send, Check, Phone, Mail, MessageSquare, Headphones } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("TECHNICAL");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, subject, category, message }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("خطا در ارسال پیام.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-content-primary">تماس با ما و پشتیبانی</h1>
        <p className="text-xs sm:text-sm text-content-muted">
          پرسش‌ها، انتقادات، پیشنهادات یا گزارش‌های خود را با تیم پشتیبانی آهنگام در میان بگذارید
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-content-primary">
              پیام شما با موفقیت دریافت شد!
            </h3>
            <p className="text-xs text-content-muted">
              کارشناسان پشتیبانی آهنگام در اسرع وقت پیام شما را بررسی و پاسخ خواهند داد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  نام و نام خانوادگی *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  شماره تماس یا ایمیل *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  موضوع درخواست
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثال: سوال درباره پلن VIP"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  دسته‌بندی پیام
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                >
                  <option value="TECHNICAL">مشکل فنی و پخش</option>
                  <option value="PAYMENT">مالی و اشتراک VIP</option>
                  <option value="CONTENT">درخواست یا اصلاح آهنگ</option>
                  <option value="SUGGESTION">انتقاد و پیشنهاد</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                متن پیام شما *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="توضیحات خود را بنویسید..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-brand text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSubmitting ? "در حال ارسال..." : "ارسال پیام به پشتیبانی"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
