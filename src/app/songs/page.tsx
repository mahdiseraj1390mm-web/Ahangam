import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SongsArchiveClient } from "./SongsArchiveClient";
import { SongItem } from "@/types";

export const metadata: Metadata = {
  title: "دانلود تمام آهنگ‌ها | آرشیو آهنگ‌های جدید و قدیمی با متن ترانه",
  description:
    "آرشیو کامل آهنگ‌ها، دانلود با کیفیت‌های 320 و 128 و FLAC، تفکیک سبک‌ها و پخش آنلاین تمامی آهنگ‌ها در رسانه آهنگام.",
  keywords: [
    "دانلود آهنگ",
    "آرشیو آهنگ",
    "آهنگ جدید",
    "دانلود آهنگ جدید",
    "متن ترانه",
    "آهنگام",
    "بیتا",
    "پخش آنلاین موسیقی",
  ],
};

export const revalidate = 0;

export default async function SongsArchivePage() {
  const [songsRaw, genres, artists] = await Promise.all([
    prisma.song.findMany({
      where: { status: "PUBLISHED" },
      include: {
        artist: true,
        album: true,
        qualities: true,
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.genre.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.artist.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const songs: SongItem[] = songsRaw as unknown as SongItem[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          آرشیو کامل آهنگ‌ها
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          دسترسی به تمامی قطعات موسیقی با کیفیت‌های متنوع و قابلیت فیلتر پیشرفته
        </p>
      </div>

      <SongsArchiveClient
        initialSongs={songs}
        genres={genres}
        artists={artists}
      />
    </div>
  );
}
