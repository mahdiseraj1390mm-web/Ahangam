import React from "react";
import { Lock, Shield, EyeOff } from "lucide-react";

import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "حریم خصوصی کاربران | آهنگام",
  description: "سیاست حفظ حریم خصوصی، امنیت داده‌ها و عدم افشای شماره‌های تماس در رسانه آهنگام.",
  alternates: {
    canonical: `${getSiteUrl()}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-content-primary">سیاست حریم خصوصی</h1>
        <p className="text-xs sm:text-sm text-content-muted">
          تعهد ما به امنیت، رمزنگاری و حفاظت از داده‌های شخصی شما
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-content-secondary shadow-xl">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand" />
            <span>رمزنگاری رمزهای عبور</span>
          </h3>
          <p>
            رمزهای عبور کاربران به هیچ وجه به شکل متنی ذخیره نمی‌شوند و با الگوریتم‌های استاندارد یک‌طرفه هش (Bcrypt) محافظت می‌شوند. حتی مدیران سیستم نیز به رمز عبور شما دسترسی ندارند.
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-surface-border">
          <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-brand" />
            <span>حفاظت از شماره‌های تماس</span>
          </h3>
          <p>
            شماره‌های همراه کاربران صرفاً جهت ورود امن، احراز هویت و اطلاع‌رسانی‌های ضروری استفاده می‌شوند و هرگز در اختیار اشخاص ثالث یا سامانه‌های تبلیغاتی قرار نخواهند گرفت.
          </p>
        </div>
      </div>
    </div>
  );
}
