"use client";

import React from "react";
import Link from "next/link";
import { Play, Pause, Heart, Headphones, Download } from "lucide-react";
import { SongItem } from "@/types";
import { usePlayer } from "../player/PlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDuration, formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface SongCardProps {
  song: SongItem;
  queueContext?: SongItem[];
  variant?: "standard" | "compact" | "horizontal";
}

export function SongCard({ song, queueContext, variant = "standard" }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(song.id);
  const isThisPlaying = currentSong?.id === song.id && isPlaying;
  const isThisCurrent = currentSong?.id === song.id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isThisCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(song.id);
  };

  // Download link with new cover tagging
  const downloadUrl = song.qualities?.length
    ? `/api/songs/${song.id}/download?quality=320`
    : "";

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (variant === "horizontal") {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border transition-all group">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-100 shadow-md">
            {song.coverImage ? (
              <img
                src={song.coverImage}
                alt={song.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                آهنگام
              </div>
            )}
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={isThisPlaying ? "توقف" : "پخش"}
            >
              {isThisPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white mr-0.5" />
              )}
            </button>
          </div>

          <div className="min-w-0">
            <Link
              href={`/song/${song.slug || song.id}`}
              className="text-sm font-bold text-content-primary hover:text-brand transition-colors block truncate"
            >
              {song.title}
            </Link>
            <Link
              href={`/artist/${song.artist?.slug || song.artist?.id || ""}`}
              className="text-xs text-content-muted hover:text-content-secondary transition-colors block truncate mt-0.5"
            >
              {song.artist?.name || "بیتا"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mr-2">
          <span className="text-xs text-content-muted font-mono hidden sm:inline ml-1">
            {formatDuration(song.duration)}
          </span>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              onClick={handleDownloadClick}
              className="w-9 h-9 rounded-full bg-surface-100 text-content-secondary hover:text-brand hover:bg-brand/10 flex items-center justify-center transition-all border border-surface-border/50"
              title="دانلود مستقیم آهنگ (کیفیت ۳۲۰)"
              aria-label="دانلود مستقیم"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={handleFavoriteClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
              isFav
                ? "bg-red-500/15 border-red-500/30 text-red-500"
                : "bg-surface-100 border-surface-border/50 text-content-secondary hover:text-red-500 hover:bg-red-500/10"
            }`}
            title={isFav ? "حذف از نشان‌شده‌ها" : "افزودن به علاقه‌مندی‌ها"}
            aria-label="نشان کردن قطعه"
          >
            <Heart className={`w-4 h-4 transition-transform ${isFav ? "fill-current scale-110" : ""}`} />
          </button>
          <button
            onClick={handlePlayClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isThisPlaying
                ? "bg-brand text-white shadow-md shadow-brand/30"
                : "bg-surface-100 text-content-primary hover:bg-brand hover:text-white"
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current mr-0.5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-100 mb-3 shadow-md">
        {song.coverImage ? (
          <img
            src={song.coverImage}
            alt={song.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/logo.png";
            }}
          />
        ) : (
          <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-bold">
            آهنگام
          </div>
        )}

        {/* Quick 1-Click Favorite Heart Button on Cover */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-75 ${
            isFav
              ? "bg-red-500 text-white shadow-red-500/40 opacity-100 scale-100"
              : "bg-black/40 text-white/90 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100"
          }`}
          title={isFav ? "حذف از نشان‌شده‌ها" : "نشان کردن / افزودن به علاقه‌مندی‌ها"}
          aria-label="نشان کردن قطعه"
        >
          <Heart className={`w-4 h-4 transition-transform ${isFav ? "fill-white text-white scale-110" : ""}`} />
        </button>

        {/* Badges */}
        {song.isEditorPick && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/90 backdrop-blur-md text-white shadow-md">
            منتخب
          </span>
        )}
        {song.isFeatured && !song.isEditorPick && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white shadow-md">
            ویژه
          </span>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/40 hover:scale-110 active:scale-95 transition-transform"
            aria-label={isThisPlaying ? "توقف" : "پخش"}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white mr-0.5" />
            )}
          </button>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
          {formatDuration(song.duration)}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <Link
          href={`/song/${song.slug || song.id}`}
          className="text-sm font-bold text-content-primary hover:text-brand transition-colors block truncate"
        >
          {song.title}
        </Link>
        <Link
          href={`/artist/${song.artist?.slug || song.artist?.id || ""}`}
          className="text-xs text-content-muted hover:text-content-secondary transition-colors block truncate mt-0.5"
        >
          {song.artist?.name || "بیتا"}
        </Link>

        {/* Play count, Favorite & Download */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-content-muted">
          <span className="flex items-center gap-1">
            <Headphones className="w-3 h-3 opacity-70" />
            <span>{formatNumberPersian(song.playCount || 0)} پخش</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFavoriteClick}
              className={`p-1 rounded-md transition-colors border ${
                isFav
                  ? "bg-red-500/15 border-red-500/30 text-red-500"
                  : "bg-surface-50 border-surface-border/50 text-content-muted hover:text-red-500 hover:bg-red-500/10"
              }`}
              title={isFav ? "حذف از نشان‌شده‌ها" : "نشان کردن"}
              aria-label="نشان کردن"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
            </button>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                onClick={handleDownloadClick}
                className="p-1 rounded-md bg-surface-50 hover:bg-brand/10 hover:text-brand text-content-muted transition-colors border border-surface-border/50"
                title="دانلود مستقیم آهنگ (کیفیت ۳۲۰)"
                aria-label="دانلود مستقیم"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
            {song.qualities?.length > 0 && (
              <span className="font-semibold text-brand/90">
                {toPersianDigits(song.qualities[0].quality)}k
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
