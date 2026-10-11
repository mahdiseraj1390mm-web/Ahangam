"use client";

import React, { useState, useRef } from "react";
import {
  Film,
  Plus,
  Upload,
  Play,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  Sparkles,
  Clock,
  X,
  Search,
} from "lucide-react";
import { formatDuration, formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface VideoRow {
  id: string;
  title: string;
  slug: string;
  videoUrl: string;
  coverImage: string | null;
  duration: number;
  description: string | null;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: string | Date;
  artist: { id: string; name: string };
}

interface VideosAdminClientProps {
  initialVideos: VideoRow[];
  allArtists: { id: string; name: string }[];
}

export function VideosAdminClient({
  initialVideos,
  allArtists,
}: VideosAdminClientProps) {
  const [videos, setVideos] = useState<VideoRow[]>(initialVideos);
  const [artists, setArtists] = useState(allArtists);
  const [search, setSearch] = useState("");

  // Modal / Form state for Creating new video
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState(artists[0]?.id || "");
  const [newArtistName, setNewArtistName] = useState("");
  const [isAddingNewArtist, setIsAddingNewArtist] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [duration, setDuration] = useState(0);
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Upload states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit State
  const [editingVideo, setEditingVideo] = useState<VideoRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistId, setEditArtistId] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editDuration, setEditDuration] = useState(0);
  const [editDescription, setEditDescription] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editViewsCount, setEditViewsCount] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Preview Player Modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);
  const editCoverInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  // Upload Video File
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);

      // Measure duration
      const tempVideo = document.createElement("video");
      tempVideo.src = URL.createObjectURL(file);
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.duration && !isNaN(tempVideo.duration)) {
          const secs = Math.round(tempVideo.duration);
          if (isEdit) setEditDuration(secs);
          else setDuration(secs);
        }
      };

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        if (isEdit) setEditVideoUrl(data.url);
        else setVideoUrl(data.url);
        showToast("فایل ویدیو با موفقیت به سرور آپلود شد.");
      } else {
        alert(data.message || "خطا در آپلود ویدیو.");
      }
    } catch {
      alert("خطای اتصال در آپلود ویدیو.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Upload Cover Image
  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.url) {
        if (isEdit) setEditCoverImage(data.url);
        else setCoverImage(data.url);
        showToast("تصویر کاور ویدیو با موفقیت آپلود شد.");
      } else {
        alert(data.message || "خطا در آپلود کاور.");
      }
    } catch {
      alert("خطای اتصال در آپلود کاور.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Create Video Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      alert("عنوان و فایل ویدیو الزامی هستند.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artistId: isAddingNewArtist ? undefined : artistId,
          artistName: isAddingNewArtist ? newArtistName.trim() : undefined,
          videoUrl: videoUrl.trim(),
          coverImage: coverImage.trim() || "/logo.png",
          duration,
          description: description.trim() || undefined,
          isFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok && data.video) {
        setVideos([data.video, ...videos]);
        setIsCreateOpen(false);
        setTitle("");
        setVideoUrl("");
        setCoverImage("");
        setDescription("");
        setDuration(0);
        setIsFeatured(false);
        showToast("موزیک‌ویدیو جدید با موفقیت ثبت شد!");
      } else {
        alert(data.message || "خطا در ذخیره موزیک‌ویدیو.");
      }
    } catch {
      alert("خطای اتصال به سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Edit
  const handleStartEdit = (vid: VideoRow) => {
    setEditingVideo(vid);
    setEditTitle(vid.title);
    setEditArtistId(vid.artist?.id || "");
    setEditArtistName(vid.artist?.name || "");
    setEditVideoUrl(vid.videoUrl);
    setEditCoverImage(vid.coverImage || "");
    setEditDuration(vid.duration || 0);
    setEditDescription(vid.description || "");
    setEditIsFeatured(vid.isFeatured);
    setEditViewsCount(vid.viewsCount || 0);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editTitle.trim() || !editVideoUrl.trim()) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/admin/videos/${editingVideo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          artistId: editArtistId,
          artistName: editArtistName.trim() || undefined,
          videoUrl: editVideoUrl.trim(),
          coverImage: editCoverImage.trim() || "/logo.png",
          duration: editDuration,
          description: editDescription.trim() || undefined,
          viewsCount: editViewsCount,
          isFeatured: editIsFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok && data.video) {
        setVideos(videos.map((v) => (v.id === editingVideo.id ? data.video : v)));
        setEditingVideo(null);
        showToast("تغییرات موزیک‌ویدیو با موفقیت ذخیره شد!");
      } else {
        alert(data.message || "خطا در ذخیره تغییرات.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (id: string, vidTitle: string) => {
    if (!confirm(`آیا از حذف موزیک‌ویدیو «${vidTitle}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setVideos(videos.filter((v) => v.id !== id));
        showToast("موزیک‌ویدیو با موفقیت حذف شد.");
      } else {
        alert("خطا در حذف موزیک‌ویدیو.");
      }
    } catch {
      alert("خطای سرور.");
    }
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.artist?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-md animate-fade-in ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {msg.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان یا نام هنرمند..."
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
            <Search className="w-4 h-4 text-content-muted absolute right-3 top-2.5" />
          </div>
          <span className="text-xs font-bold text-content-muted">
            {toPersianDigits(filteredVideos.length)} ویدیو
          </span>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-md shadow-brand/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن و آپلود موزیک‌ویدیو جدید</span>
        </button>
      </div>

      {/* Videos List Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((vid) => (
            <div
              key={vid.id}
              className="group rounded-2xl bg-surface-card border border-surface-border p-4 shadow-sm hover:shadow-xl transition-all space-y-3"
            >
              {/* Video Thumbnail with Play Trigger */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/20 border border-surface-border shadow-inner">
                {vid.coverImage ? (
                  <img
                    src={vid.coverImage}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand">
                    <Film className="w-8 h-8" />
                  </div>
                )}

                {/* Badges */}
                {vid.isFeatured && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-md">
                    ویژه
                  </span>
                )}

                {/* Duration */}
                <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/70 text-white">
                  {formatDuration(vid.duration)}
                </span>

                {/* Play Trigger Overlay */}
                <button
                  onClick={() => setPreviewVideoUrl(vid.videoUrl)}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="پیش‌نمایش پخش ویدیو"
                >
                  <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white mr-0.5" />
                  </div>
                </button>
              </div>

              {/* Title & Artist */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-content-primary truncate">
                  {vid.title}
                </h3>
                <p className="text-xs text-brand font-semibold truncate">
                  {vid.artist?.name || "بیتا"}
                </p>
                {vid.description && (
                  <p className="text-[11px] text-content-muted line-clamp-2 mt-0.5">
                    {vid.description}
                  </p>
                )}
              </div>

              {/* Views Count and Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-border/50 text-xs text-content-muted">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumberPersian(vid.viewsCount)} بازدید</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(vid)}
                    className="p-1.5 rounded-lg bg-surface-50 hover:bg-brand/10 hover:text-brand text-content-secondary transition-colors"
                    title="ویرایش اطلاعات"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(vid.id, vid.title)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                    title="حذف موزیک‌ویدیو"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-surface-card border border-surface-border text-center space-y-3">
          <Film className="w-10 h-10 text-brand mx-auto opacity-50" />
          <h3 className="text-base font-bold text-content-primary">
            هنوز موزیک‌ویدیویی در سامانه ثبت نشده است.
          </h3>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            با کلیک روی دکمه «افزودن و آپلود موزیک‌ویدیو جدید» می‌توانید اولین ویدیوی باکیفیت را آپلود و منتشر کنید.
          </p>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-black text-content-primary flex items-center gap-2">
                <Film className="w-5 h-5 text-brand" />
                <span>آپلود و انتشار موزیک‌ویدیو جدید</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Video File Upload Box */}
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-2">
                <label className="text-xs font-bold text-content-primary block">
                  فایل ویدیوی موزیک‌ویدیو (MP4، WebM) *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="آدرس اینترنتی فایل ویدیو یا آپلود مستقیم..."
                    className="flex-1 p-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2.5 bg-brand hover:bg-brand/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingVideo ? "در حال آپلود..." : "آپلود فایل ویدیو"}</span>
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoFileSelect(e, false)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-content-primary mb-1.5">
                    عنوان موزیک‌ویدیو *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: موزیک ویدیو رسمی یادگار بنفش"
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-content-primary">
                      نام هنرمند / خواننده *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewArtist(!isAddingNewArtist)}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      {isAddingNewArtist ? "انتخاب از لیست" : "+ هنرمند جدید"}
                    </button>
                  </div>

                  {isAddingNewArtist ? (
                    <input
                      type="text"
                      required
                      value={newArtistName}
                      onChange={(e) => setNewArtistName(e.target.value)}
                      placeholder="نام خواننده جدید..."
                      className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  ) : (
                    <select
                      value={artistId}
                      onChange={(e) => setArtistId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-bold"
                    >
                      {artists.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Cover Image & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="block text-xs font-bold text-content-primary">
                    تصویر کاور ویدیو
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="آدرس کاور یا آپلود..."
                      className="flex-1 p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className="px-3 py-2.5 bg-surface-50 hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-content-primary font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingCover ? "..." : "کاور"}</span>
                    </button>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCoverFileSelect(e, false)}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-content-primary">
                    مدت زمان (ثانیه)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1.5">
                  توضیحات و شناسنامه نماهنگ
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="کارگردان، عوامل تولید، یا توضیحی کوتاه..."
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-2 text-xs font-bold text-content-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-brand rounded"
                />
                <span>نمایش به عنوان ویدیوی ویژه (Featured Video)</span>
              </label>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !videoUrl.trim()}
                  className="flex-1 py-3 bg-brand hover:bg-brand/90 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? "در حال ثبت..." : "انتشار موزیک‌ویدیو"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-3 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-secondary font-bold text-xs transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-black text-content-primary flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand" />
                <span>ویرایش موزیک‌ویدیو: «{editingVideo.title}»</span>
              </h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1.5">
                  عنوان موزیک‌ویدیو *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-content-primary mb-1.5">
                    نام هنرمند / خواننده
                  </label>
                  <input
                    type="text"
                    value={editArtistName}
                    onChange={(e) => setEditArtistName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-content-primary mb-1.5">
                    تعداد بازدیدها
                  </label>
                  <input
                    type="number"
                    value={editViewsCount}
                    onChange={(e) => setEditViewsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-content-primary">
                    آدرس یا فایل ویدیو
                  </label>
                  <label className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>آپلود فایل جدید</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFileSelect(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-brand"
                />
              </div>

              {/* Cover Image & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-content-primary">
                      تصویر کاور
                    </label>
                    <label className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>آپلود کاور جدید</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverFileSelect(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-content-primary">
                    مدت زمان (ثانیه)
                  </label>
                  <input
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1.5">
                  توضیحات
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-content-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="accent-brand rounded"
                />
                <span>نمایش در بخش ویدیوی ویژه (Featured)</span>
              </label>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-surface-border">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-3 bg-brand hover:bg-brand/90 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSavingEdit ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-5 py-3 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-secondary font-bold text-xs transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW VIDEO MODAL */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-3xl bg-black rounded-3xl overflow-hidden shadow-2xl relative border border-white/20">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <video
              controls
              autoPlay
              src={previewVideoUrl}
              className="w-full aspect-video object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
