import React from "react";
import Link from "next/link";
import { Music, Heart, ShieldCheck, Headphones, Send, Share2 } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function Footer() {
  const currentYear = toPersianDigits(1405);
  const socialLinks = await prisma.socialLink.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <footer className="mt-20 border-t border-surface-border bg-surface-card/60 transition-colors pb-24 md:pb-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Intro */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md border border-brand/30 flex items-center justify-center bg-surface-50 shrink-0">
                <img src="/logo.png" alt="Ahangam" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-content-primary">آهنگام</span>
            </div>
            <p className="text-sm text-content-secondary leading-relaxed max-w-sm">
              آهنگام، مرجع مدرن و جامع پخش آنلاین و دانلود موسیقی با بالاترین کیفیت، متن همگام ترانه‌ها، دسته‌بندی بر اساس حال‌وهوا و تجربه کاربری بی‌نظیر.
            </p>
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>تمام حقوق مادی و معنوی برای پلتفرم آهنگام محفوظ است.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-content-primary mb-4">بخش‌های اصلی</h4>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link href="/songs" className="hover:text-brand transition-colors">
                  آرشیو آهنگ‌ها
                </Link>
              </li>
              <li>
                <Link href="/artists" className="hover:text-brand transition-colors">
                  لیست هنرمندان
                </Link>
              </li>
              <li>
                <Link href="/albums" className="hover:text-brand transition-colors">
                  آلبوم‌های منتخب
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-brand transition-colors">
                  موزیک‌ویدیوها
                </Link>
              </li>
              <li>
                <Link href="/plans" className="hover:text-brand transition-colors">
                  خرید اشتراک VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="text-sm font-bold text-content-primary mb-4">اطلاعات و قوانین</h4>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link href="/about" className="hover:text-brand transition-colors">
                  درباره آهنگام
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand transition-colors">
                  تماس با ما و پشتیبانی
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-brand transition-colors">
                  قوانین و شرایط استفاده
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand transition-colors">
                  سیاست حریم خصوصی
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-brand transition-colors">
                  گزارش خرابی و تخلف
                </Link>
              </li>
            </ul>
          </div>

          {/* Social and Community */}
          <div>
            <h4 className="text-sm font-bold text-content-primary mb-4">شبکه‌های اجتماعی رسمی</h4>
            <p className="text-xs text-content-muted mb-3">
              جدیدترین موزیک‌ها و اخبار را در شبکه‌های اجتماعی تاییدشده ما دنبال کنید.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.length > 0 ? (
                socialLinks.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-brand/10 hover:text-brand text-xs font-medium text-content-secondary border border-surface-border transition-colors flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{soc.title}</span>
                  </a>
                ))
              ) : (
                <span className="text-xs text-content-muted">کانال‌های رسمی به زودی اعلام خواهد شد.</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-content-muted">
          <div>
            © {currentYear} تمامی حقوق برای وب‌سایت آهنگام محفوظ است.
          </div>
          <div className="flex items-center gap-1">
            <span>طراحی و توسعه با</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>برای علاقه‌مندان به موسیقی</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
