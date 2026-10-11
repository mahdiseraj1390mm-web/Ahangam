"use client";

import React, { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import {
  Sparkles,
  Check,
  Trash2,
  Upload,
  Music,
  ChevronLeft,
  Eye,
  EyeOff,
  Volume2,
  Image as ImageIcon,
  AlertCircle,
  X,
  RotateCcw,
  FileAudio,
  User,
} from "lucide-react";
import Link from "next/link";

interface CurrentSongInfo {
  id: string;
  title: string;
  coverImage: string | null;
  artist?: { name: string } | null;
  qualities?: { quality: string; fileUrl: string }[];
}

interface FeaturedSongAdminClientProps {
  initialFeatured: {
    songId: string;
    title: string;
    subtitle: string;
    badgeTitle?: string;
    bannerImage: string | null;
    isEnabled: boolean;
  } | null;
  currentSong?: CurrentSongInfo | null;
}

export function FeaturedSongAdminClient({
  initialFeatured = null,
  currentSong = null,
}: FeaturedSongAdminClientProps) {
  const [songId, setSongId] = useState(initialFeatured?.songId || currentSong?.id || "");
  const [title, setTitle] = useState(initialFeatured?.title || currentSong?.title || "");
  const [artistName, setArtistName] = useState(currentSong?.artist?.name || "بیتا");
  const [subtitle, setSubtitle] = useState(
    initialFeatured?.subtitle ||
      (currentSong?.artist?.name
        ? `اثری شنیدنی و خاطره‌انگیز با صدای ${currentSong.artist.name}`
        : "اثری شنیدنی و خاطره‌انگیز با صدای بیتا")
  );
  const [badgeTitle, setBadgeTitle] = useState(
    initialFeatured?.badgeTitle || "پیشنهاد ویژه روز در آهنگام"
  );

  // Banner image state: if empty string, strictly falls back to /logo.png
  const [bannerImage, setBannerImage] = useState(initialFeatured?.bannerImage || "");
  const [isEnabled, setIsEnabled] = useState(initialFeatured?.isEnabled ?? true);

  // Audio upload states
  const defaultAudioUrl =
    currentSong?.qualities?.find((q) => q.quality === "320")?.fileUrl ||
    currentSong?.qualities?.[0]?.fileUrl ||
    "";

  const [audioUrl, setAudioUrl] = useState(defaultAudioUrl);
  const [audioDuration, setAudioDuration] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isNewAudioUploaded, setIsNewAudioUploaded] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Banner image upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Parse filename into artist and song title
  const parseFilename = (filename: string) => {
    const raw = filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/_UpMusics|_Ahangam|_Nex1Music/gi, "")
      .replace(/[-_]+/g, " ")
      .trim();

    if (raw.includes(" - ")) {
      const parts = raw.split(" - ");
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(" - ").trim(),
      };
    }
    return { artist: "", title: raw };
  };

  // Upload Audio Handler
  const handleSelectAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = parseFilename(file.name);
    setUploadedFileName(file.name);

    if (parsed.artist && (!artistName || artistName === "بیتا")) {
      setArtistName(parsed.artist);
    }
    if (parsed.title) {
      setTitle(parsed.title);
    }
    const derivedArtist = parsed.artist || artistName || "بیتا";
    setSubtitle(`اثری شنیدنی و خاطره‌انگیز با صدای ${derivedArtist}`);

    try {
      setIsUploadingAudio(true);
      setMsg(null);

      // Measure audio duration in browser
      const blobUrl = URL.createObjectURL(file);
      const audioObj = new Audio(blobUrl);
      audioObj.onloadedmetadata = () => {
        if (audioObj.duration && !isNaN(audioObj.duration)) {
          setAudioDuration(Math.round(audioObj.duration));
        }
      };

      let fileUrl = "";
      const safeBlobName = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      try {
        const newBlob = await upload(safeBlobName, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });
        fileUrl = newBlob.url;
      } catch (directErr: any) {
        console.warn("Direct blob client upload fallback to api/upload:", directErr);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          fileUrl = data.url;
        } else {
          throw new Error(data?.message || directErr?.message || "خطا در آپلود فایل صوتی.");
        }
      }

      if (fileUrl) {
        setAudioUrl(fileUrl);
        setIsNewAudioUploaded(true);
        setMsg({
          text: `فایل صوتی جدید (${file.name}) با موفقیت در فضای ابری آپلود شد. برای اعمال نهایی دکمه ذخیره زیر را بزنید.`,
          type: "success",
        });
      }
    } catch (err: any) {
      alert(`خطا در آپلود فایل صوتی: ${err?.message || "مشکل در اتصال به سرور"}`);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Upload Banner Image Handler
  const handleSelectImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setMsg(null);
      let imageUrl = "";
      try {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });
        imageUrl = newBlob.url;
      } catch {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          imageUrl = data.url;
        } else {
          throw new Error(data?.message || "خطا در آپلود تصویر.");
        }
      }

      if (imageUrl) {
        setBannerImage(imageUrl);
        setMsg({
          text: "تصویر بنر با موفقیت آپلود شد.",
          type: "success",
        });
      }
    } catch (err: any) {
      alert(`خطا در آپلود تصویر: ${err?.message || "مشکل در اتصال"}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Reset image to default site logo
  const handleResetToDefaultLogo = () => {
    setBannerImage("");
  };

  // Save handler: Atomic save for audio, image, title, artist, and banner settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioUrl && !songId && isEnabled) {
      alert("لطفاً ابتدا فایل صوتی (آهنگ) را برای این بنر آپلود کنید.");
      return;
    }

    try {
      setIsSaving(true);
      setMsg(null);

      const effectiveImage = bannerImage.trim() || "/logo.png";

      const res = await fetch("/api/admin/daily-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: songId || undefined,
          title: title.trim() || "آهنگ پیشنهاد ویژه",
          artistName: artistName.trim() || "بیتا",
          subtitle:
            subtitle.trim() || `اثری شنیدنی با صدای ${artistName.trim() || "بیتا"}`,
          badgeTitle: badgeTitle.trim() || "پیشنهاد ویژه روز در آهنگام",
          bannerImage: effectiveImage,
          audioUrl: audioUrl || undefined,
          audioDuration,
          isEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.songId) {
          setSongId(data.songId);
        }
        setIsNewAudioUploaded(false);
        setMsg({
          text: "تنظیمات بنر پیشنهاد ویژه و آهنگ جدید با موفقیت در دیتابیس ذخیره و دائمی شد (پس از رفرش هم باقی می‌ماند).",
          type: "success",
        });
        setTimeout(() => setMsg(null), 5000);
      } else {
        setMsg({ text: data.message || "خطا در ذخیره‌سازی بنر.", type: "error" });
      }
    } catch {
      setMsg({ text: "خطای سرور در ذخیره‌سازی اطلاعات.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete/disable banner
  const handleDelete = async () => {
    if (
      !confirm(
        "آیا مطمئن هستید؟ با این کار بنر پیشنهاد ویژه روز از صفحه اصلی حذف یا غیرفعال می‌شود."
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/admin/daily-featured", { method: "DELETE" });
      if (res.ok) {
        setIsEnabled(false);
        setMsg({
          text: "بنر پیشنهاد ویژه روز با موفقیت از صفحه اصلی برداشته شد.",
          type: "success",
        });
        setTimeout(() => setMsg(null), 4000);
      }
    } catch {
      alert("خطا در حذف بنر.");
    } finally {
      setIsSaving(false);
    }
  };

  const previewCoverImage = bannerImage.trim() || "/logo.png";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-primary flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-brand" />
            <span>مدیریت بنر پیشنهاد ویژه روز (Hero Banner)</span>
          </h1>
          <p className="text-xs text-content-muted mt-1 leading-relaxed">
            در این بخش می‌توانید آهنگ جدید را مستقیماً آپلود کرده و تصویر کاور بنر را مشخص کنید.
            در صورت عدم انتخاب تصویر، تصویر پیش‌فرض سایت (لوگو) قرار می‌گیرد.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-50 border border-surface-border text-xs font-bold text-content-secondary hover:text-content-primary transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>مشاهده در سایت</span>
          </Link>
          <span
            className={`text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border ${
              isEnabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isEnabled ? "بنر در حال نمایش" : "بنر غیرفعال"}</span>
          </span>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border shadow-sm ${
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

      {/* Main Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: AUDIO UPLOAD (ONLY AUDIO UPLOAD - NO PREDEFINED DROPDOWN) */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-content-primary flex items-center gap-2">
                <Music className="w-5 h-5 text-brand" />
                <span>آپلود فایل صوتی آهنگ بنر (MP3) *</span>
              </label>

              {isNewAudioUploaded && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>فایل جدید آماده ذخیره و انتشار است</span>
                </span>
              )}
            </div>

            {/* Direct Upload Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 space-y-2">
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-brand/40 hover:border-brand rounded-2xl p-4 sm:p-5 text-center bg-surface-card hover:bg-brand/5 transition-all space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {isUploadingAudio ? (
                      <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-content-primary block">
                      {isUploadingAudio
                        ? "در حال آپلود فایل صوتی به سرور..."
                        : "کلیک برای انتخاب و آپلود فایل آهنگ (MP3)"}
                    </span>
                    <span className="text-[11px] text-content-muted block mt-0.5">
                      فرمت‌های مجاز: MP3، M4A، WAV (حداکثر حجم ۵۰ مگابایت)
                    </span>
                  </div>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleSelectAudioFile}
                    disabled={isUploadingAudio}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Status / Player for Current or Uploaded Audio */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-surface-card border border-surface-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-content-primary">
                  <FileAudio className="w-4 h-4 text-brand" />
                  <span>پیش‌نمایش پخش آهنگ:</span>
                </div>

                {audioUrl ? (
                  <div className="space-y-2">
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full h-9 rounded-lg"
                      preload="none"
                    />
                    <div className="text-[10px] text-content-muted flex items-center justify-between">
                      <span className="truncate max-w-[150px]">
                        {uploadedFileName || title || "فایل صوتی فعال"}
                      </span>
                      {audioDuration > 0 && <span>{audioDuration} ثانیه</span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-content-muted py-3 text-center">
                    هنوز فایلی برای پخش انتخاب نشده است.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: BANNER IMAGE (WITH STRICT FALLBACK TO /logo.png) */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-surface-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-sm font-extrabold text-content-primary flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand" />
                  <span>تصویر کاور بنر پیشنهاد ویژه و فایل دانلود</span>
                </label>
                <p className="text-[11px] text-content-muted mt-0.5">
                  این تصویر هم در بنر صفحه اصلی و هم به عنوان عکس کاور آهنگ هنگام دانلود اعمال می‌شود.
                  اگر تصویری انتخاب نشود، تصویر پیش‌فرض سایت (لوگو) نمایش می‌یابد.
                </p>
              </div>

              {bannerImage && (
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-border text-content-secondary hover:text-content-primary text-[11px] font-bold flex items-center gap-1 border border-surface-border transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>استفاده از لوگوی پیش‌فرض سایت</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Image Preview */}
              <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-2xl bg-surface-card border border-surface-border">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/20 border border-surface-border shrink-0 relative">
                  <img
                    src={previewCoverImage}
                    alt="کاور بنر"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-xs font-bold text-content-primary block truncate">
                    {bannerImage ? "تصویر انتخابی بنر" : "تصویر پیش‌فرض سایت"}
                  </span>
                  <span className="text-[10px] text-brand block font-semibold">
                    {bannerImage ? "کاور جدید برای بنر و دانلود" : "لوگوی رسمی سایت (/logo.png)"}
                  </span>
                </div>
              </div>

              {/* Upload Button & URL */}
              <div className="md:col-span-8 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="آدرس اینترنتی تصویر کاور یا آپلود از دکمه روبه‌رو..."
                  className="flex-1 p-2.5 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />

                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingImage ? "در حال آپلود..." : "آپلود تصویر جدید"}</span>
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImageFile}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TITLES AND ARTIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Badge Title (سرعنوان) */}
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>سرعنوان کوچک بالای بنر (Badge)</span>
              </label>
              <input
                type="text"
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                placeholder="پیشنهاد ویژه روز در آهنگام"
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
              <p className="text-[11px] text-content-muted mt-1">
                متن چیپ گرد بالای بنر (مثال: پیشنهاد ویژه روز در آهنگام، منتخب هفته، آهنگ برتر...)
              </p>
            </div>

            {/* Main Title (عنوان بنر) */}
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5">
                عنوان اصلی آهنگ / بنر (تیتر بزرگ) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="نام آهنگ..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-sm font-bold text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            {/* Artist Name */}
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" />
                <span>نام خواننده / هنرمند</span>
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => {
                  setArtistName(e.target.value);
                  if (!subtitle || subtitle.includes("اثری شنیدنی")) {
                    setSubtitle(`اثری شنیدنی و خاطره‌انگیز با صدای ${e.target.value}`);
                  }
                }}
                placeholder="مثلاً: شایان یو، محسن یگانه، بیتا..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            {/* Subtitle (توضیحات و زیرعنوان) */}
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5">
                توضیحات و زیرعنوان بنر
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="اثری شنیدنی و خاطره‌انگیز با صدای..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Visibility Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs font-bold text-content-primary cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="accent-brand w-4 h-4 rounded"
              />
              <span>نمایش فعال این بنر در صفحه اصلی سایت</span>
            </label>
          </div>

          {/* Live Preview Box - VISIBLE ON BOTH MOBILE AND DESKTOP */}
          <div className="pt-4 border-t border-surface-border space-y-2">
            <span className="block text-xs font-bold text-content-muted">
              پیش‌نمایش زنده ظاهر بنر در صفحه اول (موبایل و کامپیوتر):
            </span>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand/90 to-purple-950 p-5 sm:p-8 md:p-10 text-white shadow-2xl border border-brand/20">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 max-w-xl flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{badgeTitle || "پیشنهاد ویژه روز در آهنگام"}</span>
                  </div>

                  {/* Mobile Preview Image & Title */}
                  <div className="flex items-center gap-4 md:hidden">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white/25 shrink-0 bg-black/20">
                      <img
                        src={previewCoverImage}
                        alt="پیش‌نمایش کاور موبایل"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                        {title || "عنوان آهنگ ویژه"}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-medium line-clamp-2">
                        {subtitle || `اثری شنیدنی با صدای ${artistName || "بیتا"}`}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Preview Title */}
                  <div className="hidden md:block space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      {title || "عنوان آهنگ ویژه"}
                    </h2>
                    <p className="text-sm sm:text-base text-white/80 font-medium">
                      {subtitle || `اثری شنیدنی با صدای ${artistName || "بیتا"}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="px-5 py-2.5 rounded-xl bg-white text-brand font-black text-xs shadow-md flex items-center gap-2">
                      <span>پخش و متن ترانه</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-black/30 text-white font-bold text-xs">
                      مرور آرشیو
                    </div>
                  </div>
                </div>

                {/* Desktop Preview Large Image */}
                <div className="hidden md:block w-48 h-48 lg:w-56 lg:h-56 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/15 shrink-0 bg-black/20">
                  <img
                    src={previewCoverImage}
                    alt="پیش‌نمایش کاور دسکتاپ"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف یا مخفی‌سازی بنر از صفحه اول</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploadingAudio}
              className="px-7 py-3 rounded-xl bg-brand hover:opacity-90 text-white font-black text-xs transition-opacity shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSaving
                  ? "در حال ذخیره‌سازی..."
                  : isNewAudioUploaded
                  ? "ذخیره و اعمال آهنگ و تصویر جدید روی بنر"
                  : "ذخیره تغییرات بنر پیشنهاد ویژه"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
