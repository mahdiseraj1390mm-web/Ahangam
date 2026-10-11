import React from "react";
import { prisma } from "@/lib/prisma";
import { HomeSectionsAdminClient } from "./HomeSectionsAdminClient";

export const revalidate = 0;

export default async function AdminHomeSectionsPage() {
  const [sections, songs, dailySetting] = await Promise.all([
    prisma.homeSection.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.song.findMany({
      select: {
        id: true,
        title: true,
        coverImage: true,
        artist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "FEATURED_SONG_OF_THE_DAY" },
    }),
  ]);

  let initialDailyFeatured = null;
  if (dailySetting?.value) {
    try {
      initialDailyFeatured = JSON.parse(dailySetting.value);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">چیدمان و پیشنهاد ویژه صفحه اصلی</h1>
        <p className="text-xs text-content-muted">
          مدیریت پیشنهاد ویژه روز در بنر اصلی، تغییر ترتیب بخش‌ها، و فعال/غیرفعال‌سازی نمایش
        </p>
      </div>

      <HomeSectionsAdminClient
        initialSections={sections}
        allSongs={songs}
        initialDailyFeatured={initialDailyFeatured}
      />
    </div>
  );
}
