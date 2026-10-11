import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Film, Play, Eye } from "lucide-react";
import { formatNumberPersian, formatDuration } from "@/lib/utils";

export const revalidate = 0;

export default async function VideosArchivePage() {
  const videos = await prisma.musicVideo.findMany({
    include: { artist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          موزیک‌ویدیوها
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          تماشا و پخش باکیفیت جدیدترین نماهنگ‌ها و موزیک‌ویدیوهای رسمی
        </p>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-3xl bg-surface-card border border-surface-border overflow-hidden shadow-lg hover:shadow-2xl transition-all space-y-3 p-3"
            >
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-surface-100 relative shadow-inner">
                {vid.coverImage ? (
                  <img
                    src={vid.coverImage}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand">
                    <Film className="w-8 h-8" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white mr-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
                  {formatDuration(vid.duration)}
                </span>
              </div>

              <div className="px-1">
                <h3 className="text-sm font-bold text-content-primary truncate group-hover:text-brand transition-colors">
                  {vid.title}
                </h3>
                <p className="text-xs text-content-muted truncate mt-0.5">
                  {vid.artist?.name || "بیتا"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-content-muted pt-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumberPersian(vid.viewsCount)} بازدید</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-card border border-surface-border rounded-3xl p-8 space-y-3">
          <Film className="w-10 h-10 text-brand mx-auto opacity-60" />
          <p className="text-base font-bold text-content-primary">
            به‌زودی جدیدترین نماهنگ‌ها و موزیک‌ویدیوها در این بخش قرار خواهند گرفت.
          </p>
        </div>
      )}
    </div>
  );
}
