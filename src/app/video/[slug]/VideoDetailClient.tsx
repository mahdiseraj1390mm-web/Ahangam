"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Eye, Calendar, Clock, Share2, Sparkles, User, Play } from "lucide-react";
import { formatNumberPersian, formatDuration, formatPersianDate } from "@/lib/utils";

interface VideoDetailClientProps {
  video: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    videoUrl: string;
    duration: number;
    description: string | null;
    viewsCount: number;
    createdAt: string | Date;
    artist: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
    };
  };
  relatedVideos: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    duration: number;
    artist: { name: string };
  }[];
}

export function VideoDetailClient({ video, relatedVideos }: VideoDetailClientProps) {
  const [views, setViews] = useState(video.viewsCount);

  useEffect(() => {
    // Record view
    fetch(`/api/videos/${video.id}/view`, { method: "POST" })
      .then((res) => {
        if (res.ok) setViews((prev) => prev + 1);
      })
      .catch(() => {});
  }, [video.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `موزیک‌ویدیو ${video.title} از ${video.artist.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("لینک کپی شد!");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Video Player Box */}
      <div className="rounded-3xl overflow-hidden bg-black border border-surface-border shadow-2xl relative aspect-video w-full">
        <video
          controls
          poster={video.coverImage || undefined}
          className="w-full h-full object-contain"
        >
          <source src={video.videoUrl} type="video/mp4" />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>

      {/* Video Details */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surface-border gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
              {video.title}
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href={`/artist/${video.artist.slug}`}
                className="text-base font-bold text-brand hover:underline"
              >
                {video.artist.name}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-content-primary transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-content-muted">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
            <Eye className="w-3.5 h-3.5 text-brand" />
            <span>{formatNumberPersian(views)} بازدید</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
            <Clock className="w-3.5 h-3.5 text-brand" />
            <span>مدت: {formatDuration(video.duration)}</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>انتشار: {formatPersianDate(video.createdAt)}</span>
          </span>
        </div>

        {/* Description */}
        {video.description && (
          <div className="p-4 rounded-2xl bg-surface-50 text-xs sm:text-sm leading-relaxed text-content-secondary">
            {video.description}
          </div>
        )}
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-content-primary flex items-center gap-2">
            <Film className="w-5 h-5 text-brand" />
            <span>سایر موزیک‌ویدیوها</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedVideos.map((rv) => (
              <Link
                key={rv.id}
                href={`/video/${rv.slug}`}
                className="group rounded-2xl bg-surface-card border border-surface-border p-3 space-y-2 block hover:shadow-lg transition-all"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-100 relative">
                  {rv.coverImage && (
                    <img src={rv.coverImage} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
                    {formatDuration(rv.duration)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-content-primary truncate group-hover:text-brand transition-colors">
                  {rv.title}
                </h4>
                <p className="text-[11px] text-content-muted truncate">{rv.artist.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
