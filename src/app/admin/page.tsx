import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  Music,
  Headphones,
  Download,
  Radio,
  Disc3,
  AlertTriangle,
  PlusCircle,
  Eye,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { formatNumberPersian, formatPersianDate, toPersianDigits } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [
    usersCount,
    vipCount,
    songsCount,
    artistsCount,
    albumsCount,
    reportsCount,
    recentSongs,
    recentUsers,
    reports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["VIP", "ADMIN", "SUPER_ADMIN"] } } }),
    prisma.song.count(),
    prisma.artist.count(),
    prisma.album.count(),
    prisma.contentReport.count({ where: { status: "PENDING" } }),
    prisma.song.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        playCount: true,
        downloadCount: true,
        createdAt: true,
        artist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contentReport.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        reason: true,
        description: true,
        contentType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // Real aggregate totals for plays and downloads
  const playAgg = await prisma.song.aggregate({
    _sum: { playCount: true, downloadCount: true },
  });

  const totalPlays = playAgg._sum.playCount || 0;
  const totalDownloads = playAgg._sum.downloadCount || 0;

  const statCards = [
    { label: "کل کاربران", value: usersCount, sub: `${vipCount} کاربر VIP`, icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "کل آهنگ‌ها", value: songsCount, sub: "در دسترس عموم", icon: Music, color: "text-brand bg-brand/10" },
    { label: "مجموع پخش‌ها", value: totalPlays, sub: "پخش واقعی صوتی", icon: Headphones, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "مجموع دانلودها", value: totalDownloads, sub: "دانلود مستقیم فایل", icon: Download, color: "text-purple-500 bg-purple-500/10" },
    { label: "هنرمندان", value: artistsCount, sub: "ثبت‌شده در آرشیو", icon: Radio, color: "text-amber-500 bg-amber-500/10" },
    { label: "آلبوم‌ها", value: albumsCount, sub: "مجموعه قطعات", icon: Disc3, color: "text-rose-500 bg-rose-500/10" },
    { label: "گزارش‌های معلق", value: reportsCount, sub: "نیاز به بررسی", icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
            داشبورد مدیریت آهنگام
          </h1>
          <p className="text-xs text-content-muted mt-1">
            آمار واقعی سیستم، وضعیت کاربران و دسترسی سریع به عملکردهای کلیدی
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card hover:bg-surface-50 border border-surface-border text-content-secondary hover:text-content-primary font-bold text-xs transition-colors shadow-sm"
            title="دانلود نسخه پشتیبان و گزارش جامع داده‌ها"
          >
            <FileDown className="w-4 h-4 text-brand" />
            <span>خروجی و پشتیبان داده‌ها</span>
          </a>

          <Link
            href="/admin/songs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>افزودن آهنگ جدید</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-content-muted">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-content-primary font-mono block">
                  {formatNumberPersian(card.value)}
                </span>
                <span className="text-[11px] text-content-muted">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Row: Recent Songs & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Songs */}
        <div className="p-5 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Music className="w-4 h-4 text-brand" />
              <span>آخرین آهنگ‌های افزوده شده</span>
            </h3>
            <Link href="/admin/songs" className="text-xs text-brand hover:underline font-bold">
              مدیریت همه
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface-100">
                    {song.coverImage && (
                      <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-content-primary truncate">{song.title}</p>
                    <p className="text-[11px] text-content-muted truncate">{song.artist?.name || "بیتا"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-content-muted font-mono">
                    {formatNumberPersian(song.playCount)} پخش
                  </span>
                  <Link
                    href={`/song/${song.slug || song.id}`}
                    target="_blank"
                    className="p-1.5 text-content-muted hover:text-brand transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="p-5 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              <span>کاربران تازه‌عضو</span>
            </h3>
            <Link href="/admin/users" className="text-xs text-brand hover:underline font-bold">
              مدیریت کاربران
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs"
              >
                <div>
                  <p className="font-bold text-content-primary">{u.displayName}</p>
                  <p className="text-[11px] text-content-muted font-mono">{u.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === "VIP"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-surface-100 text-content-muted"
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className="text-[10px] text-content-muted">
                    {formatPersianDate(u.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Reports Section */}
      {reports.length > 0 && (
        <div className="p-5 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
          <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>گزارش‌های خرابی یا تخلف نیازمند بررسی</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-surface-50 border border-surface-border text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-red-400">{r.reason}</span>
                  <span className="text-content-muted font-normal text-[11px]">
                    {formatPersianDate(r.createdAt)}
                  </span>
                </div>
                {r.description && (
                  <p className="text-content-secondary leading-relaxed">{r.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
