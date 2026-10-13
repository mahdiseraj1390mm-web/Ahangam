import React from "react";
import { prisma } from "@/lib/prisma";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { AlbumItem } from "@/types";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "آلبوم‌های موسیقی | دانلود جدیدترین و برترین آلبوم‌ها",
  description:
    "مجموعه کامل و باکیفیت آلبوم‌های موسیقی منتشرشده رسمی به همراه پخش آنلاین تمامی قطعات در رسانه آهنگام.",
  keywords: [
    "آلبوم موسیقی",
    "دانلود آلبوم جدید",
    "فول آلبوم",
    "آلبوم آهنگ",
    "آهنگام",
    "بیتا",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/albums`,
  },
  openGraph: {
    title: "آلبوم‌های موسیقی | رسانه آهنگام",
    description: "مجموعه کامل آلبوم‌های رسمی منتشرشده در آهنگام با کیفیت بالا.",
    url: `${getSiteUrl()}/albums`,
    siteName: "آهنگام",
    locale: "fa_IR",
  },
};

export default async function AlbumsArchivePage() {
  const albumsRaw = await prisma.album.findMany({
    include: { artist: true },
    orderBy: { releaseYear: "desc" },
  });

  const albums: AlbumItem[] = albumsRaw as unknown as AlbumItem[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          آلبوم‌های موسیقی
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          مجموعه کامل آلبوم‌های رسمی منتشرشده در آهنگام
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
