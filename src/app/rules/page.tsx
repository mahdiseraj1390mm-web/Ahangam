import React from "react";
import { ShieldCheck, FileText, Scale } from "lucide-react";

import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "قوانین و مقررات | آهنگام",
  description: "ضوابط انتشار آثار، کپی‌رایت، حقوق ناشران و شرایط عضویت در رسانه آهنگام.",
  alternates: {
    canonical: `${getSiteUrl()}/rules`,
  },
};

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black text-content-primary">قوانین و شرایط استفاده</h1>
        <p className="text-xs sm:text-sm text-content-muted">
          ضوابط انتشار آثار، استفاده از محتوا و عضویت در پلتفرم آهنگام
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-content-secondary shadow-xl">
        <div className="space-y-3">
          <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand" />
            <span>۱. قوانین کپی‌رایت و حقوق صاحبان اثر</span>
          </h3>
          <p>
            کلیه آثار صوتی و تصویری منتشر شده در وب‌سایت آهنگام با رعایت حقوق ناشرین و صاحبان معنوی آثار قرار می‌گیرند. در صورتی که شما صاحب امتیاز یا ناشر قطعه‌ای هستید و تمایل به حذف یا ویرایش اطلاعات اثر خود دارید، می‌توانید از بخش گزارش مشکل یا تماس با ما اقدام فرمایید.
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-surface-border">
          <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>۲. قوانین حساب‌های کاربری و اشتراک VIP</span>
          </h3>
          <p>
            حساب‌های ویژه VIP صرفاً برای استفاده شخصی کاربر صادر می‌شوند و هرگونه سوءاستفاده، استخراج خودکار (Scraping) داده‌ها و فروش مجدد فایل‌ها ممنوع بوده و منجر به مسدودسازی حساب خواهد شد.
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-surface-border">
          <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand" />
            <span>۳. نظرات و دیدگاه‌های کاربران</span>
          </h3>
          <p>
            نظرات ثبت‌شده نباید حاوی توهین، الفاظ نامناسب یا تبلیغات باشند. دیدگاه‌های نامتعارف توسط مدیران بررسی و حذف خواهند شد.
          </p>
        </div>
      </div>
    </div>
  );
}
