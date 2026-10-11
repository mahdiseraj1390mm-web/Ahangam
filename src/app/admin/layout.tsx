import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { checkAdminPermission } from "@/lib/auth";
import {
  LayoutDashboard,
  Music,
  PlusCircle,
  Users,
  Radio,
  Sparkles,
  Sliders,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Disc3,
  MessageSquare,
  Layers,
  Share2,
  AlertTriangle,
  Film,
  Flame,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, user, message } = await checkAdminPermission();

  if (!authorized) {
    redirect("/auth/login");
  }

  const navItems = [
    { label: "داشبورد و آمار", href: "/admin", icon: LayoutDashboard },
    { label: "مدیریت آهنگ‌ها", href: "/admin/songs", icon: Music },
    { label: "مدیریت سبک‌ها و دسته‌بندی‌ها", href: "/admin/genres", icon: Layers },
    { label: "افزودن آهنگ جدید", href: "/admin/songs/new", icon: PlusCircle, highlight: true },
    { label: "پیشنهاد ویژه روز (بنر اصلی)", href: "/admin/featured-song", icon: Sparkles },
    { label: "مدیریت برترین آهنگ‌ها", href: "/admin/top-songs", icon: Flame },
    { label: "مدیریت موزیک‌ویدیوها", href: "/admin/videos", icon: Film },
    { label: "هنرمندان", href: "/admin/artists", icon: Radio },
    { label: "آلبوم‌ها", href: "/admin/albums", icon: Disc3 },
    { label: "استوری‌ها", href: "/admin/stories", icon: Sparkles },
    { label: "چیدمان صفحه اصلی", href: "/admin/home-sections", icon: Layers },
    { label: "کاربران و زیرادمین‌ها", href: "/admin/users", icon: Users },
    { label: "نظرات کاربران", href: "/admin/comments", icon: MessageSquare },
    { label: "تیکت‌های پشتیبانی", href: "/admin/tickets", icon: MessageSquare },
    { label: "گزارش‌های تخلف", href: "/admin/reports", icon: AlertTriangle },
    { label: "شبکه‌های اجتماعی", href: "/admin/socials", icon: Share2 },
    { label: "تنظیمات و ظاهر سایت", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div className="min-h-screen -mx-4 -my-6 sm:-mx-6 flex flex-col md:flex-row bg-surface-bg text-content-primary">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-card border-b md:border-b-0 md:border-l border-surface-border p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md border border-surface-border flex items-center justify-center bg-surface-50 shrink-0">
                <img src="/logo.png" alt="Ahangam" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-sm font-black text-content-primary">پنل مدیریت آهنگام</h2>
                <span className="text-[10px] text-content-muted font-mono">{user?.role}</span>
              </div>
            </div>
            <Link
              href="/"
              className="text-xs text-brand hover:underline flex items-center gap-1"
              title="مشاهده سایت"
            >
              <span>سایت</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    item.highlight
                      ? "bg-brand text-white shadow-md shadow-brand/30 hover:opacity-95"
                      : "text-content-secondary hover:text-content-primary hover:bg-surface-50"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Current Admin user info */}
        <div className="pt-4 border-t border-surface-border mt-4 flex items-center justify-between text-xs">
          <div className="truncate">
            <p className="font-bold text-content-primary truncate">{user?.displayName}</p>
            <p className="text-[10px] text-content-muted font-mono truncate">{user?.phone}</p>
          </div>
          <Link
            href="/"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-50"
            title="خروج"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
