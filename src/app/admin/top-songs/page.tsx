import React from "react";
import { prisma } from "@/lib/prisma";
import { TopSongsAdminClient } from "./TopSongsAdminClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminTopSongsPage() {
  const [songs, setting] = await Promise.all([
    prisma.song.findMany({
      where: { status: "PUBLISHED" },
      include: {
        artist: { select: { id: true, name: true } },
        qualities: { select: { quality: true, fileUrl: true } },
      },
      orderBy: { playCount: "desc" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "TOP_SONGS_CONFIG" },
    }),
  ]);

  let config = {
    title: "برترین آهنگ‌های این هفته در آهنگام",
    subtitle: "جدول رسمی پرشنونده‌ترین و محبوب‌ترین قطعات موسیقی",
    mode: "manual",
    songIds: [] as string[],
    isEnabled: true,
    limitCount: 8,
  };

  if (setting?.value) {
    try {
      config = { ...config, ...JSON.parse(setting.value) };
    } catch {}
  }

  // If manual list is empty, default to top songs by playCount
  if (config.songIds.length === 0 && songs.length > 0) {
    config.songIds = songs.slice(0, 8).map((s) => s.id);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت بخش برترین آهنگ‌ها</h1>
        <p className="text-xs text-content-muted">
          کنترل کامل نحوه انتخاب، رتبه‌بندی (رتبه‌های ۱، ۲، ۳...) و نمایش برترین آهنگ‌ها در صفحه اصلی سایت
        </p>
      </div>

      <TopSongsAdminClient initialConfig={config} allSongs={songs as any} />
    </div>
  );
}
