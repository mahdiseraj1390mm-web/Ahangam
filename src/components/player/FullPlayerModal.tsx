"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Clock,
  Wifi,
  Share2,
  Heart,
  ChevronDown,
  Trash2,
  Disc3,
  Square,
  Radio,
  Check,
  Sparkles,
} from "lucide-react";
import { formatDuration, toPersianDigits } from "@/lib/utils";
import { LyricLine } from "@/types";
import { StoryShareModal } from "./StoryShareModal";

export function FullPlayerModal() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    repeatMode,
    isShuffled,
    selectedQuality,
    isFullPlayerOpen,
    sleepTimerMinutes,
    sleepEndOfTrack,
    isRadioMode,
    isDataSaver,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    changeQuality,
    removeFromQueue,
    clearQueue,
    setIsFullPlayerOpen,
    setSleepTimer,
    toggleSleepEndOfTrack,
    toggleRadioMode,
    toggleDataSaver,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<"player" | "lyrics" | "queue">("player");
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [isVinylMode, setIsVinylMode] = useState<boolean>(true);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Parse synced lyrics or standard lyrics
  useEffect(() => {
    if (!currentSong?.syncedLyrics) {
      setParsedLyrics([]);
      return;
    }
    try {
      // Supports JSON array of [{time: number, text: string}] or LRC format
      if (currentSong.syncedLyrics.trim().startsWith("[")) {
        try {
          const jsonLines = JSON.parse(currentSong.syncedLyrics);
          if (Array.isArray(jsonLines)) {
            setParsedLyrics(jsonLines);
            return;
          }
        } catch {
          // If not valid JSON, fallback to LRC format parsing
        }
      }

      // LRC parsing: [00:12.34]Lyric text
      const lines = currentSong.syncedLyrics.split("\n");
      const result: LyricLine[] = [];
      const lrcRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

      for (const line of lines) {
        const match = lrcRegex.exec(line);
        if (match) {
          const mins = parseInt(match[1], 10);
          const secs = parseInt(match[2], 10);
          const ms = match[3] ? parseInt(match[3], 10) / (match[3].length === 2 ? 100 : 1000) : 0;
          result.push({
            time: mins * 60 + secs + ms,
            text: match[4].trim(),
          });
        }
      }
      setParsedLyrics(result);
    } catch {
      setParsedLyrics([]);
    }
  }, [currentSong]);

  // Scroll synced lyrics to active line
  useEffect(() => {
    if (activeTab !== "lyrics" || parsedLyrics.length === 0) return;
    const activeIdx = parsedLyrics.findIndex(
      (l, idx) =>
        currentTime >= l.time &&
        (idx === parsedLyrics.length - 1 || currentTime < parsedLyrics[idx + 1].time)
    );
    if (activeIdx !== -1 && lyricsContainerRef.current) {
      const lineEl = document.getElementById(`lyric-line-${activeIdx}`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, activeTab, parsedLyrics]);

  if (!isFullPlayerOpen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = () => {
    setIsStoryModalOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`پخش آهنگ ${currentSong.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-surface-bg/95 backdrop-blur-2xl animate-fadeIn overflow-hidden"
    >
      {/* Dynamic Ambient Aurora Glow Canvas */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand/25 filter blur-[100px] animate-pulse-subtle"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-fuchsia-600/20 filter blur-[100px] animate-pulse-subtle"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-25 filter blur-3xl transition-all duration-1000"
          style={{
            backgroundImage: currentSong.coverImage ? `url(${currentSong.coverImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-border shrink-0">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2 text-content-secondary hover:text-content-primary rounded-xl hover:bg-surface-100 transition-colors"
          aria-label="بستن پخش‌کننده"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Tab switchers */}
        <div className="flex items-center bg-surface-100/80 p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveTab("player")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "player"
                ? "bg-brand text-white shadow-md"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            پخش‌کننده
          </button>
          <button
            onClick={() => setActiveTab("lyrics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === "lyrics"
                ? "bg-brand text-white shadow-md"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            متن ترانه
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === "queue"
                ? "bg-brand text-white shadow-md"
                : "text-content-secondary hover:text-content-primary"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            صف پخش ({toPersianDigits(queue.length)})
          </button>
        </div>

        <button
          onClick={handleShare}
          className="p-2 text-content-secondary hover:text-content-primary rounded-xl hover:bg-surface-100 transition-colors"
          aria-label="اشتراک‌گذاری"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {activeTab === "player" && (
          <div className="w-full flex flex-col items-center space-y-5">
            {/* Gramophone / Vinyl Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsVinylMode(!isVinylMode)}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isVinylMode
                  ? "bg-brand/20 text-brand border border-brand/40"
                  : "bg-surface-100 text-content-secondary hover:text-content-primary border border-surface-border"
              }`}
            >
              {isVinylMode ? (
                <>
                  <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin text-brand" : ""}`} />
                  <span>حالت دیسک گرامافون (چرخان)</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-content-muted" />
                  <span>حالت تصویر ثابت (مربعی)</span>
                </>
              )}
            </button>

            {/* Cover Display (Vinyl CD Disc OR Classic Square) */}
            {isVinylMode ? (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none">
                {/* Interactive Gramophone Needle / Tonearm */}
                <button
                  type="button"
                  onClick={togglePlay}
                  title={
                    isPlaying
                      ? "کلیک روی سوزن برای برداشتن از روی سی‌دی و توقف آهنگ"
                      : "کلیک روی سوزن برای قرار دادن روی سی‌دی و پخش آهنگ"
                  }
                  className={`absolute top-0 right-2 sm:top-1 sm:right-3 z-30 origin-top-right transition-transform duration-700 ease-out cursor-pointer group focus:outline-none drop-shadow-2xl ${
                    isPlaying ? "rotate-[28deg]" : "-rotate-[14deg]"
                  }`}
                  style={{ width: "95px", height: "145px" }}
                >
                  {/* Pivot Base */}
                  <div className="absolute top-0 right-0 w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 border-2 border-white/80 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-300" />
                  </div>
                  {/* Metallic Arm Rod */}
                  <div className="absolute top-6 right-3.5 w-2 h-24 bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-500 rounded-full shadow-md group-hover:brightness-110" />
                  {/* Stylus Cartridge & Needle Head (Directly onto CD track) */}
                  <div className="absolute bottom-1.5 left-2 w-6 h-9 bg-zinc-800 border-2 border-zinc-300 rounded-md shadow-xl transform -rotate-[16deg] flex items-center justify-center group-hover:border-brand transition-colors">
                    <div className={`w-1.5 h-3.5 rounded-full ${isPlaying ? "bg-brand animate-pulse" : "bg-zinc-500"}`} />
                  </div>
                </button>

                {/* Full-Cover Circular CD Disc (تمام عکس دایره‌ای کل سی‌دی را در بر می‌گیرد) */}
                <div
                  onClick={togglePlay}
                  title={isPlaying ? "برای توقف آهنگ کلیک کنید" : "برای پخش آهنگ کلیک کنید"}
                  className={`w-60 h-60 sm:w-72 sm:h-72 rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden flex items-center justify-center cursor-pointer group active:scale-98 transition-all ${
                    isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
                  }`}
                  style={{
                    boxShadow: "0 25px 60px rgba(0,0,0,0.85), inset 0 0 30px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Entire Circular Cover Art */}
                  {currentSong.coverImage ? (
                    <img
                      src={currentSong.coverImage}
                      alt={currentSong.title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand to-brand-700 flex items-center justify-center text-white font-black text-2xl rounded-full">
                      آهنگام
                    </div>
                  )}

                  {/* CD Holographic/Glossy Glass Overlay */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />

                  {/* Outer CD Ring Trim */}
                  <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />

                  {/* CD Center Spindle Ring & Hole (مرکز و سوراخ سی‌دی) */}
                  <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/50 shadow-inner flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
                  </div>
                </div>
              </div>
            ) : (
              /* Classic Static Square Cover Art */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-surface-border/50 group bg-surface-100">
                {currentSong.coverImage ? (
                  <img
                    src={currentSong.coverImage}
                    alt={currentSong.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-black text-2xl">
                    آهنگام
                  </div>
                )}
              </div>
            )}

            {/* Title & Artist & Album */}
            <div className="text-center w-full px-4">
              <h2 className="text-2xl sm:text-3xl font-black text-content-primary truncate">
                {currentSong.title}
              </h2>
              <p className="text-base sm:text-lg font-medium text-brand mt-1 truncate">
                {currentSong.artist?.name || "بیتا"}
              </p>
              {currentSong.album && (
                <p className="text-xs text-content-muted mt-0.5 truncate">
                  آلبوم: {currentSong.album.title}
                </p>
              )}
            </div>

            {/* Quality & Sleep Timer Quick Badges */}
            <div className="flex items-center gap-3 relative">
              {/* Quality selector */}
              <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl border border-surface-border text-xs">
                {["128", "320", "FLAC"].map((q) => {
                  const hasQual = currentSong.qualities?.some((sq) => sq.quality === q);
                  return (
                    <button
                      key={q}
                      disabled={!hasQual}
                      onClick={() => changeQuality(q)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        selectedQuality === q
                          ? "bg-brand text-white shadow-sm"
                          : hasQual
                          ? "text-content-secondary hover:text-content-primary"
                          : "text-content-muted/40 cursor-not-allowed"
                      }`}
                    >
                      {q === "FLAC" ? "FLAC" : `${toPersianDigits(q)}k`}
                    </button>
                  );
                })}
              </div>

              {/* Sleep timer button */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    sleepTimerMinutes || sleepEndOfTrack
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-surface-border bg-surface-100 text-content-secondary hover:text-content-primary"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {sleepTimerMinutes
                      ? `${toPersianDigits(sleepTimerMinutes)} دقیقه`
                      : sleepEndOfTrack
                      ? "پایان قطعه"
                      : "تایمر خواب"}
                  </span>
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-44 bg-surface-card border border-surface-border rounded-xl shadow-xl p-1 z-30 space-y-0.5">
                    <button
                      onClick={() => {
                        toggleSleepEndOfTrack();
                        if (sleepTimerMinutes) setSleepTimer(null);
                        setShowSleepMenu(false);
                      }}
                      className={`w-full text-right px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                        sleepEndOfTrack
                          ? "bg-brand/15 text-brand font-bold"
                          : "hover:bg-surface-100 text-content-secondary hover:text-content-primary"
                      }`}
                    >
                      <span>پایان همین قطعه</span>
                      {sleepEndOfTrack && <Check className="w-3.5 h-3.5 text-brand" />}
                    </button>
                    <div className="my-1 border-t border-surface-border" />
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setSleepTimer(mins);
                          if (sleepEndOfTrack) toggleSleepEndOfTrack();
                          setShowSleepMenu(false);
                        }}
                        className={`w-full text-right px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                          sleepTimerMinutes === mins
                            ? "bg-brand/15 text-brand font-bold"
                            : "hover:bg-surface-100 text-content-secondary hover:text-content-primary"
                        }`}
                      >
                        <span>{toPersianDigits(mins)} دقیقه</span>
                        {sleepTimerMinutes === mins && <Check className="w-3.5 h-3.5 text-brand" />}
                      </button>
                    ))}
                    {(sleepTimerMinutes || sleepEndOfTrack) && (
                      <button
                        onClick={() => {
                          setSleepTimer(null);
                          if (sleepEndOfTrack) toggleSleepEndOfTrack();
                          setShowSleepMenu(false);
                        }}
                        className="w-full text-right px-3 py-1.5 text-xs rounded-lg hover:bg-red-500/10 text-red-400 font-bold transition-colors"
                      >
                        لغو تایمر
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Data Saver Toggle */}
              <button
                onClick={toggleDataSaver}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isDataSaver
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-surface-border bg-surface-100 text-content-muted hover:text-content-primary"
                }`}
                title="صرفه‌جویی در مصرف اینترنت (کیفیت ۱۲۸)"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">صرفه‌جویی</span>
              </button>
            </div>
          </div>
        )}

        {/* Synced / Plain Lyrics View */}
        {activeTab === "lyrics" && (
          <div
            ref={lyricsContainerRef}
            className="w-full h-96 overflow-y-auto px-4 py-6 space-y-4 text-center rounded-2xl bg-surface-card/60 border border-surface-border"
          >
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((line, idx) => {
                const isActive =
                  currentTime >= line.time &&
                  (idx === parsedLyrics.length - 1 || currentTime < parsedLyrics[idx + 1].time);
                return (
                  <p
                    key={idx}
                    id={`lyric-line-${idx}`}
                    onClick={() => seek(line.time)}
                    className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                      isActive
                        ? "text-xl font-black text-brand scale-105 bg-brand/10 shadow-sm"
                        : "text-sm text-content-muted hover:text-content-secondary"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : currentSong.lyrics ? (
              <div className="whitespace-pre-line text-sm leading-relaxed text-content-secondary">
                {currentSong.lyrics}
              </div>
            ) : (
              <div className="text-center py-20 text-content-muted text-sm">
                متن ترانه برای این قطعه ثبت نشده است.
              </div>
            )}
          </div>
        )}

        {/* Queue View */}
        {activeTab === "queue" && (
          <div className="w-full h-96 overflow-y-auto space-y-2 p-2 rounded-2xl bg-surface-card/60 border border-surface-border">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-content-secondary">
                  {toPersianDigits(queue.length)} آهنگ در صف
                </span>
                <button
                  type="button"
                  onClick={toggleRadioMode}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    isRadioMode
                      ? "bg-brand/15 text-brand border border-brand/30"
                      : "bg-surface-100 text-content-muted border border-surface-border"
                  }`}
                  title="پخش خودکار و بی‌پایان آهنگ‌های مشابه پس از اتمام صف"
                >
                  <Radio className="w-3 h-3" />
                  <span>رادیوی هوشمند: {isRadioMode ? "روشن" : "خاموش"}</span>
                </button>
              </div>
              <button
                onClick={clearQueue}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                پاک‌سازی صف
              </button>
            </div>

            {queue.map((song, idx) => (
              <div
                key={`${song.id}-${idx}`}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  idx === queueIndex
                    ? "bg-brand/10 border-brand text-brand"
                    : "bg-surface-50 border-surface-border text-content-secondary hover:border-brand/40"
                }`}
              >
                <div
                  onClick={() => seek(0)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <span className="text-xs font-mono font-bold w-4 text-center">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface-100">
                    {song.coverImage && (
                      <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-content-primary">{song.title}</p>
                    <p className="text-[11px] text-content-muted truncate">
                      {song.artist?.name || "بیتا"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-content-muted font-mono">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-content-muted hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Controls Bar */}
      <footer className="p-4 sm:p-6 border-t border-surface-border bg-surface-card/80 shrink-0 space-y-3 max-w-2xl mx-auto w-full">
        {/* Interactive Audio Waveform Visualizer */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, clickX / rect.width));
            if (duration > 0) seek(percent * duration);
          }}
          className="flex items-end justify-between gap-[3px] h-7 px-1 cursor-pointer select-none group"
          title="امواج صوتی - کلیک برای پرش مستقیم به این ثانیه"
        >
          {[
            12, 18, 26, 32, 20, 14, 28, 36, 22, 18, 30, 38, 24, 16, 32, 40,
            28, 20, 34, 42, 26, 18, 30, 38, 22, 16, 28, 36, 20, 14, 24, 16
          ].map((baseH, i) => {
            const barPercent = (i / 32) * 100;
            const isPassed = barPercent <= progressPercent;
            const animatedH = isPlaying
              ? Math.max(6, Math.min(28, baseH * 0.7 + Math.sin(currentTime * 5 + i * 0.8) * 6))
              : Math.max(5, baseH * 0.45);
            return (
              <span
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-brand group-hover:brightness-110 shadow-sm shadow-brand/30"
                    : "bg-surface-border group-hover:bg-surface-200"
                }`}
                style={{ height: `${animatedH}px` }}
              />
            );
          })}
        </div>

        {/* Progress seek bar */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1.5 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-brand"
          />
          <div className="flex justify-between text-xs text-content-muted font-mono">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-xl transition-colors ${
              isShuffled ? "text-brand bg-brand/10" : "text-content-secondary hover:text-content-primary"
            }`}
            title="پخش تصادفی"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="p-2.5 text-content-secondary hover:text-content-primary rounded-xl transition-colors"
            title="آهنگ قبلی"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* Play / Pause Main */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/40 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "توقف" : "پخش"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white mr-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="p-2.5 text-content-secondary hover:text-content-primary rounded-xl transition-colors"
            title="آهنگ بعدی"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-xl transition-colors ${
              repeatMode !== "off"
                ? "text-brand bg-brand/10"
                : "text-content-secondary hover:text-content-primary"
            }`}
            title="تکرار"
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Volume slider (desktop view) */}
        <div className="hidden sm:flex items-center justify-center gap-3 pt-1">
          <button
            onClick={toggleMute}
            className="text-content-secondary hover:text-content-primary transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolumeLevel(Number(e.target.value))}
            className="w-32 h-1 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>
      </footer>

      {/* Story Share Modal */}
      <StoryShareModal
        song={currentSong}
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </div>
  );
}
