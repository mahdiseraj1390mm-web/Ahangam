"use client";

import React from "react";
import { usePlayer } from "./PlayerContext";
import { Play, Pause, SkipForward, Heart, Maximize2, AlertCircle, X } from "lucide-react";
import Image from "next/image";
import { toPersianDigits } from "@/lib/utils";

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    selectedQuality,
    setIsFullPlayerOpen,
    audioError,
    retryPlayback,
    closePlayer,
  } = usePlayer();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="پخش‌کننده صوتی"
      className="fixed bottom-16 md:bottom-4 left-3 right-3 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 bg-surface-card/95 backdrop-blur-xl border-2 border-brand/40 hover:border-brand/70 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300"
    >
      {/* Dynamic cover ambient glow */}
      <div
        className="absolute inset-0 opacity-15 filter blur-xl pointer-events-none -z-10"
        style={{
          backgroundImage: currentSong.coverImage ? `url(${currentSong.coverImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Top progress bar indicator */}
      <div className="w-full bg-surface-100 h-1 relative">
        <div
          className="bg-brand h-full transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 gap-2 md:gap-4">
        {/* Track Info & Cover */}
        <div
          onClick={() => setIsFullPlayerOpen(true)}
          className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
          title="کلیک برای بزرگ‌نمایی و صفحه گرامافون"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0 bg-surface-100 border border-brand/30">
            {currentSong.coverImage ? (
              <img
                src={currentSong.coverImage}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  isPlaying ? "animate-pulse-subtle" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                آهنگام
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isPlaying ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"
                }`}
              />
              <span className="text-[10px] font-black text-brand">
                {isPlaying ? "در حال پخش" : "متوقف شده"}
              </span>
              {isPlaying && (
                <div className="hidden sm:flex items-end gap-0.5 h-2.5 shrink-0 mr-1">
                  <span className="w-0.5 h-2 bg-brand rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-brand rounded-full animate-pulse [animation-delay:200ms]" />
                  <span className="w-0.5 h-1.5 bg-brand rounded-full animate-pulse [animation-delay:400ms]" />
                </div>
              )}
            </div>
            <h4 className="text-sm font-black text-content-primary truncate group-hover:text-brand transition-colors mt-0.5">
              {currentSong.title}
            </h4>
            <p className="text-xs text-content-muted truncate">
              {currentSong.artist?.name || "بیتا"}
            </p>
          </div>
        </div>

        {/* Audio Error message if any */}
        {audioError && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>خطا در پخش</span>
            <button
              onClick={retryPlayback}
              className="underline font-bold hover:text-red-300 mr-1"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Quality Badge */}
        <div className="hidden sm:flex items-center">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
            {toPersianDigits(selectedQuality)} kbps
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30 hover:opacity-90 active:scale-95 transition-all"
            aria-label={isPlaying ? "توقف" : "پخش"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white mr-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            className="p-2 text-content-secondary hover:text-content-primary hover:bg-surface-100 rounded-xl transition-colors"
            aria-label="آهنگ بعدی"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Maximize Button - visible on both mobile and desktop */}
          <button
            type="button"
            onClick={() => setIsFullPlayerOpen(true)}
            className="p-2 text-content-secondary hover:text-brand hover:bg-brand/10 rounded-xl transition-colors flex items-center gap-1"
            aria-label="بزرگ‌نمایی و صفحه گرامافون"
            title="بزرگ‌نمایی و صفحه گرامافون"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px] font-bold text-brand">
              بزرگ‌نمایی
            </span>
          </button>

          {/* Close Player Button */}
          <button
            type="button"
            onClick={closePlayer}
            className="p-2 text-content-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            aria-label="بستن کامل پخش‌کننده و توقف آهنگ"
            title="بستن پخش‌کننده"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
