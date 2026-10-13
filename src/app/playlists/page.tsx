import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListMusic, Music } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "پلی‌لیست‌های برگزیده | گلچین بهترین آهنگ‌ها",
  description:
    "مجموعه برترین و پرطرفدارترین پلی‌لیست‌های موسیقی برای موقعیت‌های مختلف از جمله رانندگی، مهمانی، آرامش و ورزش در رسانه آهنگام.",
  keywords: [
    "پلی لیست آهنگ",
    "گلچین آهنگ",
    "پلی لیست رانندگی",
    "پلی لیست شاد",
    "آهنگام",
    "پخش آنلاین پلی لیست",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/playlists`,
  },
  openGraph: {
    title: "پلی‌لیست‌های برگزیده | آهنگام",
    description: "مجموعه برترین پلی‌لیست‌های اختصاصی و منتخب کاربران در رسانه آهنگام.",
    url: `${getSiteUrl()}/playlists`,
    siteName: "آهنگام",
    locale: "fa_IR",
  },
};

export default async function PlaylistsArchivePage() {
  const playlists = await prisma.playlist.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { displayName: true } },
      _count: { select: { songs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          پلی‌لیست‌های برگزیده
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          مجموعه‌های شنیدنی به انتخاب سردبیر و کاربران برتر آهنگام
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            href={`/playlist/${pl.slug}`}
            className="group relative rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
          >
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-surface-100 mb-3 shadow-md relative flex items-center justify-center text-brand">
              {pl.coverImage ? (
                <img src={pl.coverImage} alt={pl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <ListMusic className="w-10 h-10" />
              )}
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                <Music className="w-3 h-3" />
                {toPersianDigits(pl._count.songs)} قطعه
              </span>
            </div>

            <h4 className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors truncate">
              {pl.title}
            </h4>
            <p className="text-xs text-content-muted truncate mt-0.5">
              {pl.user?.displayName || "سردبیر آهنگام"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
