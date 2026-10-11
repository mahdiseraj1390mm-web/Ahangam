import React from "react";
import { prisma } from "@/lib/prisma";
import { VideosAdminClient } from "./VideosAdminClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const [videos, artists] = await Promise.all([
    prisma.musicVideo.findMany({
      include: {
        artist: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artist.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت موزیک‌ویدیوها و نماهنگ‌ها</h1>
        <p className="text-xs text-content-muted">
          بارگذاری فایل موزیک‌ویدیو، تعیین کاور، ویرایش مشخصات اثر و حذف ویدیوها
        </p>
      </div>

      <VideosAdminClient initialVideos={videos as any} allArtists={artists} />
    </div>
  );
}
