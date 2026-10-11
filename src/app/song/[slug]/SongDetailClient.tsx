"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Download,
  Heart,
  Share2,
  Star,
  MessageSquare,
  AlertTriangle,
  Music,
  Check,
  Disc,
  Clock,
  Calendar,
  Sparkles,
  Headphones,
  ListPlus,
  Plus,
  X,
} from "lucide-react";
import { SongItem, CommentItem } from "@/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { formatDuration, formatNumberPersian, toPersianDigits, formatPersianDate } from "@/lib/utils";

interface SongDetailClientProps {
  song: SongItem;
  initialComments: CommentItem[];
  userRating?: number;
  averageRating: number;
  totalRatings: number;
}

export function SongDetailClient({
  song,
  initialComments,
  userRating = 0,
  averageRating,
  totalRatings,
}: SongDetailClientProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isThisPlaying = currentSong?.id === song.id && isPlaying;
  const isThisCurrent = currentSong?.id === song.id;

  const [rating, setRating] = useState<number>(userRating);
  const [avgRating, setAvgRating] = useState<number>(averageRating);
  const [ratingsCount, setRatingsCount] = useState<number>(totalRatings);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("خرابی فایل صوتی");
  const [reportDesc, setReportDesc] = useState("");
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

  // Playlist state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState<string | null>(null);
  const [playlistSuccessMsg, setPlaylistSuccessMsg] = useState<string | null>(null);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  const fetchUserPlaylists = async () => {
    try {
      setIsLoadingPlaylists(true);
      const res = await fetch("/api/playlists");
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(data.playlists || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const openPlaylistModal = () => {
    setIsPlaylistModalOpen(true);
    setPlaylistSuccessMsg(null);
    fetchUserPlaylists();
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      setIsAddingToPlaylist(playlistId);
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlaylistSuccessMsg("با موفقیت به پلی‌لیست افزوده شد!");
        setTimeout(() => {
          setIsPlaylistModalOpen(false);
          setPlaylistSuccessMsg(null);
        }, 1500);
      } else {
        alert(data.message || "خطا در افزودن آهنگ.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsAddingToPlaylist(null);
    }
  };

  const handleCreateAndAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistTitle.trim()) return;
    try {
      setIsCreatingPlaylist(true);
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newPlaylistTitle.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.playlist) {
        // Now add song to the created playlist
        await handleAddToPlaylist(data.playlist.id);
        setNewPlaylistTitle("");
      } else {
        alert(data.message || "خطا در ساخت پلی‌لیست.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  // Check initial favorite status
  React.useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ahangam_favorites") || "[]");
      if (stored.includes(song.id)) setIsFavorite(true);
      const savedRate = localStorage.getItem(`ahangam_rate_${song.id}`);
      if (savedRate && !rating) setRating(Number(savedRate));
    } catch {}

    fetch(`/api/songs/${song.id}/favorite`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.isFavorite) setIsFavorite(true);
      })
      .catch(() => {});
  }, [song.id]);

  const handleFavoriteToggle = async () => {
    try {
      setIsFavLoading(true);
      const res = await fetch(`/api/songs/${song.id}/favorite`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.isFavorite);
        try {
          const stored = JSON.parse(localStorage.getItem("ahangam_favorites") || "[]");
          if (data.isFavorite) {
            if (!stored.includes(song.id)) stored.push(song.id);
          } else {
            const idx = stored.indexOf(song.id);
            if (idx > -1) stored.splice(idx, 1);
          }
          localStorage.setItem("ahangam_favorites", JSON.stringify(stored));
        } catch {}
      } else {
        alert(data.message || "خطا در ثبت علاقه‌مندی.");
      }
    } catch {
      alert("خطا در افزودن به علاقه‌مندی‌ها.");
    } finally {
      setIsFavLoading(false);
    }
  };

  const handlePlayToggle = () => {
    if (isThisCurrent) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleRating = async (score: number) => {
    try {
      setIsRatingSubmitting(true);
      const res = await fetch(`/api/songs/${song.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      const data = await res.json();
      if (res.ok) {
        setRating(score);
        setAvgRating(data.averageRating);
        setRatingsCount(data.totalRatings);
        try {
          localStorage.setItem(`ahangam_rate_${song.id}`, score.toString());
        } catch {}
      } else {
        alert(data.message || "خطا در ارسال امتیاز.");
      }
    } catch {
      alert("خطا در ارسال امتیاز.");
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsCommentSubmitting(true);
      const res = await fetch(`/api/songs/${song.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data.comment, ...comments]);
        setCommentText("");
        alert("نظر شما با موفقیت ثبت شد.");
      } else {
        alert(data.message || "برای ثبت نظر باید وارد حساب کاربری شوید.");
      }
    } catch {
      alert("خطا در ارسال نظر.");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "SONG",
          contentId: song.id,
          reason: reportReason,
          description: reportDesc,
        }),
      });
      setIsReportSubmitted(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setIsReportSubmitted(false);
        setReportDesc("");
      }, 2000);
    } catch {
      alert("خطا در ثبت گزارش.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `آهنگ ${song.title} با صدای ${song.artist?.name || "بیتا"}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("لینک کپی شد!");
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Cover Art */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-surface-100 group">
          {song.coverImage ? (
            <img
              src={song.coverImage}
              alt={song.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-black text-3xl">
              آهنگام
            </div>
          )}

          {/* Quick Play Trigger */}
          <button
            onClick={handlePlayToggle}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="پخش آنلاین"
          >
            <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center shadow-xl">
              {isThisPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white mr-1" />
              )}
            </div>
          </button>
        </div>

        {/* Info & Details */}
        <div className="flex-1 space-y-4 text-center md:text-right min-w-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black text-content-primary">
              {song.title}
            </h1>
            <div className="text-lg font-bold text-brand hover:underline pt-1">
              <Link href={`/artist/${song.artist?.slug || song.artist?.id}`}>
                {song.artist?.name || "بیتا"}
              </Link>
            </div>
            {song.album && (
              <p className="text-sm text-content-muted">
                از آلبوم: <Link href={`/album/${song.album.slug}`} className="hover:text-brand">{song.album.title}</Link>
              </p>
            )}
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs text-content-secondary">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>مدت: {formatDuration(song.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
              <Headphones className="w-3.5 h-3.5 text-brand" />
              <span>{formatNumberPersian(song.playCount)} بار پخش</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
              <Download className="w-3.5 h-3.5 text-brand" />
              <span>{formatNumberPersian(song.downloadCount)} دانلود</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-50 border border-surface-border">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>انتشار: {formatPersianDate(song.createdAt)}</span>
            </div>
          </div>

          {/* Star Rating Interactive */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <div className="flex items-center gap-1" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isRatingSubmitting}
                  onClick={() => handleRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (rating || Math.round(avgRating))
                        ? "text-amber-400 fill-amber-400"
                        : "text-content-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-content-primary">
              {toPersianDigits(avgRating.toFixed(1))} ({toPersianDigits(ratingsCount)} رأی)
            </span>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
            <button
              onClick={handlePlayToggle}
              className="px-6 py-3 rounded-2xl bg-brand text-white font-bold text-sm shadow-xl shadow-brand/30 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
            >
              {isThisPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>توقف پخش</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white mr-0.5" />
                  <span>پخش آنلاین</span>
                </>
              )}
            </button>

            <button
              onClick={handleFavoriteToggle}
              disabled={isFavLoading}
              className={`p-3 rounded-2xl border transition-all ${
                isFavorite
                  ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-sm"
                  : "bg-surface-50 hover:bg-surface-100 border-surface-border text-content-secondary hover:text-red-400"
              }`}
              title={isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>

            <button
              onClick={openPlaylistModal}
              className="p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-brand transition-colors"
              title="افزودن به پلی‌لیست"
            >
              <ListPlus className="w-5 h-5" />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-content-primary transition-colors"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-3 rounded-2xl bg-surface-50 hover:bg-red-500/10 border border-surface-border text-content-muted hover:text-red-400 transition-colors"
              title="گزارش خرابی لینک یا محتوا"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Production Credits Table */}
      {(song.lyricist || song.composer || song.arranger || song.publisher) && (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-md">
          <h3 className="text-base font-bold text-content-primary mb-4 flex items-center gap-2">
            <Disc className="w-4 h-4 text-brand" />
            <span>مشخصات و عوامل تولید</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {song.lyricist && (
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-border">
                <span className="text-content-muted block mb-1">ترانه‌سرا</span>
                <span className="font-bold text-content-primary">{song.lyricist}</span>
              </div>
            )}
            {song.composer && (
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-border">
                <span className="text-content-muted block mb-1">آهنگساز</span>
                <span className="font-bold text-content-primary">{song.composer}</span>
              </div>
            )}
            {song.arranger && (
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-border">
                <span className="text-content-muted block mb-1">تنظیم‌کننده</span>
                <span className="font-bold text-content-primary">{song.arranger}</span>
              </div>
            )}
            {song.publisher && (
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-border">
                <span className="text-content-muted block mb-1">ناشر / تهیه‌کننده</span>
                <span className="font-bold text-content-primary">{song.publisher}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real Audio Download Boxes */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-md space-y-4">
        <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
          <Download className="w-4 h-4 text-brand" />
          <span>دانلود مستقیم با کیفیت‌های موجود</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {song.qualities?.map((q) => {
            const sizeMb = q.fileSize ? (q.fileSize / (1024 * 1024)).toFixed(1) : null;
            return (
              <a
                key={q.id}
                href={`/api/songs/${song.id}/download?quality=${q.quality}`}
                download
                className="flex items-center justify-between p-4 rounded-xl bg-surface-50 hover:bg-brand/10 border border-surface-border hover:border-brand/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                    {q.quality === "FLAC" ? "FLAC" : `${toPersianDigits(q.quality)}k`}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-content-primary group-hover:text-brand transition-colors">
                      کیفیت {q.quality === "FLAC" ? "FLAC بدون افت" : `${toPersianDigits(q.quality)} کیلوبیت`}
                    </h4>
                    {sizeMb && (
                      <span className="text-[11px] text-content-muted">
                        حجم: {toPersianDigits(sizeMb)} مگابایت
                      </span>
                    )}
                  </div>
                </div>
                <Download className="w-4 h-4 text-content-muted group-hover:text-brand transition-colors" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Lyrics Section (SEO & Rich Content Optimized) */}
      {song.lyrics && (
        <section aria-label={`متن ترانه ${song.title}`} className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h2 className="text-base sm:text-lg font-bold text-content-primary flex items-center gap-2">
              <Music className="w-5 h-5 text-brand" />
              <span>متن کامل آهنگ {song.title} از {song.artist?.name || "بیتا"}</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(song.lyrics || "");
                alert("متن ترانه با موفقیت کپی شد!");
              }}
              className="text-xs text-brand hover:underline font-bold px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20 transition-colors"
            >
              کپی متن آهنگ
            </button>
          </div>
          
          <div className="p-5 rounded-xl bg-surface-50 text-sm sm:text-base leading-loose text-content-secondary whitespace-pre-line text-center select-text font-normal font-sans">
            {song.lyrics}
          </div>

          {/* SEO Tag Cloud for Google indexing */}
          <div className="pt-3 border-t border-surface-border flex flex-wrap items-center gap-2 text-[11px] text-content-muted">
            <span className="font-bold text-content-primary">برچسب‌های مرتبط:</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">دانلود آهنگ {song.title}</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">متن آهنگ {song.title}</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">تکست {song.title} از {song.artist?.name || "بیتا"}</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">پخش آنلاین آهنگ {song.title}</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">آهنگ های {song.artist?.name || "بیتا"}</span>
            <span className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border">سایت آهنگام</span>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-content-primary">
              نظرات کاربران ({toPersianDigits(comments.length)})
            </h3>
          </div>
        </div>

        {/* New comment input */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="دیدگاه خود را درباره این اثر بنویسید..."
            className="w-full p-3.5 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCommentSubmitting || !commentText.trim()}
              className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-md shadow-brand/20 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isCommentSubmitting ? "در حال ثبت..." : "ارسال نظر"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-xs">
                    {c.user?.displayName?.[0] || "ک"}
                  </div>
                  <span className="text-xs font-bold text-content-primary">
                    {c.user?.displayName || "کاربر آهنگام"}
                  </span>
                  {c.user?.role === "VIP" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                      VIP
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-content-muted">
                  {formatPersianDate(c.createdAt)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-content-secondary pr-9">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-content-primary">گزارش مشکل قطعه</h4>

            {isReportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>گزارش شما با موفقیت ثبت شد و بررسی خواهد شد.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1.5">
                    نوع مشکل
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  >
                    <option value="خرابی فایل صوتی">خرابی فایل صوتی یا پخش نشدن</option>
                    <option value="کیفیت نامناسب">کیفیت نامناسب یا نویز</option>
                    <option value="اطلاعات نادرست">اطلاعات نادرست (نام اثر یا عوامل)</option>
                    <option value="مشکل کپی رایت">نقض حق نشر یا کپی‌رایت</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-secondary mb-1.5">
                    توضیحات تکمیلی
                  </label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="جزئیات مشکل را بنویسید..."
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-content-secondary hover:bg-surface-100"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white shadow-md hover:opacity-90"
                  >
                    ارسال گزارش
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add To Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="font-bold text-base text-content-primary flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-brand" />
                <span>افزودن به پلی‌لیست</span>
              </h3>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {playlistSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{playlistSuccessMsg}</span>
              </div>
            )}

            {/* List of user playlists */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {isLoadingPlaylists ? (
                <div className="py-6 text-center text-xs text-content-muted">در حال بارگذاری پلی‌لیست‌ها...</div>
              ) : userPlaylists.length === 0 ? (
                <div className="py-6 text-center text-xs text-content-muted">
                  هنوز هیچ پلی‌لیستی نساخته‌اید. در کادر زیر یک پلی‌لیست جدید ایجاد کنید.
                </div>
              ) : (
                userPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    disabled={isAddingToPlaylist === pl.id}
                    onClick={() => handleAddToPlaylist(pl.id)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface-50 hover:bg-surface-100 border border-surface-border transition-colors text-right group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-content-primary group-hover:text-brand transition-colors">
                          {pl.title}
                        </p>
                        <p className="text-[11px] text-content-muted">
                          {toPersianDigits(pl._count?.songs || 0)} آهنگ
                        </p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAddingToPlaylist === pl.id ? "در حال افزودن..." : "افزودن"}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Create new playlist form */}
            <form onSubmit={handleCreateAndAddPlaylist} className="pt-2 border-t border-surface-border space-y-3">
              <label className="block text-xs font-semibold text-content-secondary">
                یا ساخت پلی‌لیست جدید:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="عنوان پلی‌لیست..."
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  disabled={isCreatingPlaylist || !newPlaylistTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-brand hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-opacity flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ساخت و افزودن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
