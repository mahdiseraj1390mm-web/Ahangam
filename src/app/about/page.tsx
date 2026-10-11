import React from "react";
import { Music, ShieldCheck, Heart, Sparkles, Headphones } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="space-y-3 text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand mx-auto flex items-center justify-center shadow-md">
          <Music className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-content-primary">درباره پلتفرم موسیقی آهنگام</h1>
        <p className="text-sm text-content-muted">
          تجربه‌ای مدرن، گوش‌نواز و حرفه‌ای برای شنیدن و کشف موسیقی ناب
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-content-secondary shadow-xl">
        <p>
          <strong>آهنگام (Ahangam)</strong> با هدف ایجاد بستری مدرن، سریع و کاربرمحور برای عاشقان موسیقی پارسی متولد شده است. در آهنگام، هدف ما صرفاً ارائه لینک دانلود نیست؛ ما به دنبال ساخت تجربه‌ای بی‌نقص و زنده از لمس هنر موسیقی هستیم.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-2">
            <div className="flex items-center gap-2 text-brand font-bold">
              <Headphones className="w-5 h-5" />
              <span>پخش پیوسته و هوشمند</span>
            </div>
            <p className="text-xs text-content-muted">
              پخش‌کننده صوتی شناور و پیشرفته با امکان پخش بی‌وقفه در حین مرور صفحات و متن همگام ترانه‌ها.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-2">
            <div className="flex items-center gap-2 text-brand font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>کیفیت بی‌نقص فایل‌ها</span>
            </div>
            <p className="text-xs text-content-muted">
              ارائه فایل‌های اورجینال با کیفیت FLAC و ۳۲۰ کیلوبیت بدون دستکاری یا کاهش حجم مصنوعی.
            </p>
          </div>
        </div>

        <p>
          تمام هنرمندان، آلبوم‌ها و قطعات با دقیق‌ترین جزئیات عوامل تولید شامل ترانه‌سرا، آهنگساز و تنظیم‌کننده ثبت می‌شوند تا ادای احترامی باشد به تمامی آفرینندگان هنر در این مرز و بوم.
        </p>
      </div>
    </div>
  );
}
