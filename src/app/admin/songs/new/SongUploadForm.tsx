"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  Upload,
  Music,
  FileAudio,
  Check,
  AlertCircle,
  Eye,
  Clock,
  Sparkles,
  Layers,
  ChevronLeft,
  Plus,
  Tag,
} from "lucide-react";
import { formatDuration, toPersianDigits } from "@/lib/utils";

interface SongUploadFormProps {
  artists: { id: string; name: string }[];
  albums: { id: string; title: string; artistId: string }[];
  genres: { id: string; name: string }[];
}

export function SongUploadForm({ artists, albums, genres }: SongUploadFormProps) {
  const router = useRouter();

  // Form State (Default artist is "بیتا" per proposal page 7)
  const defaultArtistId = artists.find((a) => a.name.includes("بیتا"))?.id || artists[0]?.id || "";

  const [artistList, setArtistList] = useState(artists);
  const [isAddingNewArtist, setIsAddingNewArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);

  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState(defaultArtistId);
  const [albumId, setAlbumId] = useState("");
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(180);
  const [coverImage, setCoverImage] = useState("/logo.png");
  const [lyrics, setLyrics] = useState("");
  const [syncedLyrics, setSyncedLyrics] = useState("");
  const [lyricist, setLyricist] = useState("");
  const [composer, setComposer] = useState("");
  const [arranger, setArranger] = useState("");
  const [publisher, setPublisher] = useState("");
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT" | "SCHEDULED">("PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);

  // Audio Qualities
  const [url320, setUrl320] = useState("");
  const [url128, setUrl128] = useState("");
  const [urlFlac, setUrlFlac] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Audio file drag & drop duration detection and upload helper
  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      if (!title) {
        setTitle(fileNameWithoutExt);
      }

      // Extract duration via Audio object
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio(objectUrl);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(Math.round(audio.duration));
        }
      };

      // Automatically extract embedded ID3 metadata & cover art from the audio file
      try {
        const headerSlice = file.slice(0, 3 * 1024 * 1024); // First 3MB contains ID3 header and APIC cover art
        const metaFormData = new FormData();
        metaFormData.append("file", headerSlice, file.name);
        fetch("/api/admin/songs/extract-metadata", {
          method: "POST",
          body: metaFormData,
        })
          .then((res) => res.json())
          .then((meta) => {
            if (meta?.success) {
              if (meta.coverUrl) {
                setCoverImage(meta.coverUrl);
                setSuccess("کاور پیش‌فرض فایل صوتی با موفقیت استخراج و تنظیم شد.");
                setTimeout(() => setSuccess(null), 4000);
              }
              if (meta.title && meta.title.length > 2) {
                setTitle(meta.title);
              }
              if (meta.artist) {
                const matched = artistList.find(
                  (a) =>
                    a.name.toLowerCase().includes(meta.artist.toLowerCase()) ||
                    meta.artist.toLowerCase().includes(a.name.toLowerCase())
                );
                if (matched) {
                  setArtistId(matched.id);
                }
              }
            }
          })
          .catch((err) => console.warn("Auto metadata extraction non-blocking error:", err));
      } catch (e) {
        console.warn("Could not initiate metadata extraction:", e);
      }

      // Upload file directly to cloud storage (bypassing server body size limits)
      try {
        setIsUploadingFile(true);
        setError(null);
        
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
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.url) {
            fileUrl = data.url;
          } else {
            throw new Error(data?.message || `خطای سرور (${res.status})`);
          }
        }

        if (fileUrl) {
          setUrl320(fileUrl);
          setSuccess("فایل صوتی با موفقیت در فضای ابری آپلود شد!");
          setTimeout(() => setSuccess(null), 4000);
        }
      } catch (uploadErr: any) {
        console.error("Audio upload error:", uploadErr);
        setError(`خطای آپلود: ${uploadErr?.message || "مشکل در آپلود فایل به فضای ابری"}`);
      } finally {
        setIsUploadingFile(false);
      }
    }
  };

  // Cover image upload helper
  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingCover(true);
        setError(null);
        
        let coverUrl = "";
        const safeCoverName = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        try {
          const newBlob = await upload(safeCoverName, file, {
            access: "public",
            handleUploadUrl: "/api/upload/client",
          });
          coverUrl = newBlob.url;
        } catch {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.url) {
            coverUrl = data.url;
          } else {
            throw new Error(data?.message || "خطا در آپلود تصویر");
          }
        }

        if (coverUrl) {
          setCoverImage(coverUrl);
          setSuccess("کاور با موفقیت آپلود شد!");
          setTimeout(() => setSuccess(null), 3000);
        }
      } catch (err: any) {
        setError(`خطا در آپلود کاور: ${err?.message || "مشکل در اتصال به سرور"}`);
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  const handleCreateArtist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newArtistName.trim()) return;

    try {
      setIsCreatingArtist(true);
      setError(null);
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newArtistName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.artist) {
        setArtistList((prev) => [...prev, { id: data.artist.id, name: data.artist.name }]);
        setArtistId(data.artist.id);
        setNewArtistName("");
        setIsAddingNewArtist(false);
        setSuccess(`هنرمند «${data.artist.name}» با موفقیت افزوده و انتخاب شد!`);
        setTimeout(() => setSuccess(null), 4000);
      } else {
        setError(data.message || "خطا در افزودن هنرمند جدید.");
      }
    } catch {
      setError("خطای سرور هنگام ایجاد هنرمند.");
    } finally {
      setIsCreatingArtist(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isUploadingFile || isUploadingCover) {
      setError("لطفاً تا اتمام آپلود فایل‌ها منتظر بمانید.");
      return;
    }

    if (!title.trim() || !artistId) {
      setError("نام آهنگ و انتخاب هنرمند الزامی است.");
      return;
    }

    try {
      setIsSubmitting(true);

      const final320 = (url320 && !url320.startsWith("blob:")) ? url320 : "/audio/sample.mp3";
      const final128 = (url128 && !url128.startsWith("blob:")) ? url128 : "";
      const finalFlac = (urlFlac && !urlFlac.startsWith("blob:")) ? urlFlac : "";

      const res = await fetch("/api/admin/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artistId,
          albumId: albumId || null,
          genreIds: selectedGenreIds,
          duration: Number(duration),
          coverImage: coverImage.trim() || null,
          lyrics: lyrics.trim() || null,
          syncedLyrics: syncedLyrics.trim() || null,
          lyricist: lyricist.trim() || null,
          composer: composer.trim() || null,
          arranger: arranger.trim() || null,
          publisher: publisher.trim() || null,
          status,
          isFeatured,
          isEditorPick,
          qualities: [
            { quality: "320", fileUrl: final320, isDefault: true },
            ...(final128 ? [{ quality: "128", fileUrl: final128, isDefault: false }] : []),
            ...(finalFlac ? [{ quality: "FLAC", fileUrl: finalFlac, isDefault: false }] : []),
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "خطا در ایجاد آهنگ.");
        return;
      }

      setSuccess("آهنگ با موفقیت در پایگاه داده ثبت و ذخیره شد!");
      setTimeout(() => {
        router.push("/admin/songs");
        router.refresh();
      }, 1500);
    } catch {
      setError("خطای اتصال به سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedArtistName = artists.find((a) => a.id === artistId)?.name || "بیتا";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: File Dropzone */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-brand" />
              <span>بارگذاری فایل صوتی و استخراج مشخصات</span>
            </h3>

            <label className="border-2 border-dashed border-surface-border hover:border-brand/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-surface-50/50 hover:bg-brand/5 transition-all group">
              <Upload className={`w-8 h-8 text-brand mb-2 group-hover:scale-110 transition-transform ${isUploadingFile ? "animate-bounce" : ""}`} />
              <p className="text-xs font-bold text-content-primary">
                {isUploadingFile ? "در حال آپلود و پردازش فایل صوتی در سرور..." : "فایل صوتی MP3 یا FLAC را اینجا رها کنید یا کلیک نمایید"}
              </p>
              <p className="text-[11px] text-content-muted mt-1">
                مدت زمان آهنگ و نام فایل به‌صورت خودکار تشخیص داده می‌شود
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                className="hidden"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  آدرس فایل کیفیت ۳۲۰ (kbps)
                </label>
                <input
                  type="text"
                  value={url320}
                  onChange={(e) => setUrl320(e.target.value)}
                  placeholder="https://.../song-320.mp3"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  آدرس فایل کیفیت ۱۲۸ (kbps)
                </label>
                <input
                  type="text"
                  value={url128}
                  onChange={(e) => setUrl128(e.target.value)}
                  placeholder="https://.../song-128.mp3"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  آدرس کیفیت بی‌نقص FLAC
                </label>
                <input
                  type="text"
                  value={urlFlac}
                  onChange={(e) => setUrlFlac(e.target.value)}
                  placeholder="https://.../song-flac.flac"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Basic Metadata */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Music className="w-4 h-4 text-brand" />
              <span>اطلاعات اصلی آهنگ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  عنوان آهنگ *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: یادگار بنفش"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-content-secondary">
                    نام هنرمند (پیش‌فرض: بیتا) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewArtist(!isAddingNewArtist)}
                    className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingNewArtist ? "انصراف" : "افزودن هنرمند جدید"}</span>
                  </button>
                </div>

                {isAddingNewArtist && (
                  <div className="mb-2 p-2.5 rounded-xl bg-brand/5 border border-brand/20 flex gap-2">
                    <input
                      type="text"
                      value={newArtistName}
                      onChange={(e) => setNewArtistName(e.target.value)}
                      placeholder="نام هنرمند جدید (مثلاً: شایان یو)..."
                      className="flex-1 p-2 rounded-lg bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateArtist()}
                      disabled={isCreatingArtist || !newArtistName.trim()}
                      className="px-3 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg disabled:opacity-50 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {isCreatingArtist ? "..." : <Check className="w-3.5 h-3.5" />}
                      <span>ثبت</span>
                    </button>
                  </div>
                )}

                <select
                  value={artistId}
                  onChange={(e) => {
                    if (e.target.value === "__NEW_ARTIST__") {
                      setIsAddingNewArtist(true);
                    } else {
                      setArtistId(e.target.value);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-medium"
                >
                  <option value="__NEW_ARTIST__">✨ + افزودن و تایپ نام هنرمند جدید...</option>
                  {artistList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  آلبوم (اختیاری)
                </label>
                <select
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                >
                  <option value="">بدون آلبوم (تک‌آهنگ)</option>
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      {alb.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  مدت زمان (ثانیه)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-content-secondary">
                      تصویر کاور آهنگ
                    </label>
                    <span className="text-[11px] text-content-muted">
                      (با انتخاب فایل صوتی، کاور پیش‌فرض داخل آهنگ خودکار استخراج می‌شود)
                    </span>
                  </div>
                  <label className="text-[11px] font-bold text-brand bg-brand/10 hover:bg-brand/20 border border-brand/20 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? "در حال آپلود کاور..." : "آپلود / تغییر کاور"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingCover}
                      onChange={handleCoverFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {coverImage ? (
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface-50 border border-surface-border">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-surface-border shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {coverImage === "/logo.png" ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            کاور پیش‌فرض رسانه آهنگام (در صورت تمایل از دکمه بالا عکس اختصاصی آپلود کنید)
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            کاور اختصاصی آهنگ (در دانلود کاربران نیز داخل فایل تعبیه می‌شود)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="آدرس اینترنتی کاور..."
                        className="w-full p-2 rounded-lg bg-surface-card border border-surface-border text-[11px] text-content-primary focus:outline-none focus:border-brand font-mono"
                      />
                    </div>
                    {coverImage !== "/logo.png" && (
                      <button
                        type="button"
                        onClick={() => setCoverImage("/logo.png")}
                        className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1 transition-colors cursor-pointer shrink-0"
                        title="بازگردانی به کاور پیش‌فرض"
                      >
                        کاور پیش‌فرض
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-surface-50/50 border border-dashed border-surface-border text-center space-y-1">
                    <p className="text-xs text-content-muted">
                      هنوز کاوری تنظیم نشده است. با انتخاب فایل صوتی، کاور پیش‌فرض داخل فایل قرار می‌گیرد، یا می‌توانید تصویر جدیدی انتخاب کنید.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2.5: Genres & Moods (سبک و دسته‌بندی موضوعی آهنگ) */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/50 pb-3">
              <div>
                <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand" />
                  <span>سبک و دسته‌بندی موضوعی آهنگ (سبک‌ها و حال‌وهوا) *</span>
                </h3>
                <p className="text-[11px] text-content-muted mt-0.5">
                  مشخص کنید این قطعه در کدام سبک یا حال‌وهوا قرار می‌گیرد (امکان انتخاب همزمان چند سبک وجود دارد).
                </p>
              </div>
              <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20 self-start sm:self-auto">
                {toPersianDigits(selectedGenreIds.length)} سبک انتخاب شده
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {genres.map((g) => {
                const isSelected = selectedGenreIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedGenreIds(selectedGenreIds.filter((id) => id !== g.id));
                      } else {
                        setSelectedGenreIds([...selectedGenreIds, g.id]);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-brand text-white border-brand shadow-md shadow-brand/25 scale-105"
                        : "bg-surface-50 hover:bg-surface-100 text-content-secondary hover:text-content-primary border-surface-border"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Credits */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              <span>عوامل تولید و نشر</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  ترانه‌سرا
                </label>
                <input
                  type="text"
                  value={lyricist}
                  onChange={(e) => setLyricist(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  آهنگساز
                </label>
                <input
                  type="text"
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  تنظیم‌کننده
                </label>
                <input
                  type="text"
                  value={arranger}
                  onChange={(e) => setArranger(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                  ناشر / اسپانسر
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lyrics */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
              <Music className="w-4 h-4 text-brand" />
              <span>متن ترانه و همگام‌سازی زمان</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  متن ساده ترانه
                </label>
                <textarea
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="متن کامل آهنگ را اینجا بنویسید..."
                  className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                  متن همگام‌سازی شده (LRC یا آرایه JSON)
                </label>
                <textarea
                  rows={3}
                  value={syncedLyrics}
                  onChange={(e) => setSyncedLyrics(e.target.value)}
                  placeholder="[00:10.50]متن خط اول..."
                  className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Live Preview */}
        <div className="space-y-6">
          {/* Status & Options */}
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-content-primary">وضعیت انتشار</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-pub"
                  name="status"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="accent-brand"
                />
                <label htmlFor="status-pub" className="text-xs font-bold text-content-primary cursor-pointer">
                  انتشار فوری در سایت
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="status-draft"
                  name="status"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="accent-brand"
                />
                <label htmlFor="status-draft" className="text-xs text-content-secondary cursor-pointer">
                  ذخیره به عنوان پیش‌نویس
                </label>
              </div>

              <div className="pt-3 border-t border-surface-border space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-brand rounded"
                  />
                  <span className="text-xs font-medium text-content-primary">
                    آهنگ ویژه (نمایش در بنرها)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEditorPick}
                    onChange={(e) => setIsEditorPick(e.target.checked)}
                    className="accent-brand rounded"
                  />
                  <span className="text-xs font-medium text-content-primary">
                    پیشنهاد سردبیر
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-brand text-white font-bold text-xs shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>در حال ذخیره در پایگاه داده...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ثبت و ذخیره نهایی آهنگ</span>
                </>
              )}
            </button>
          </div>

          {/* Live Mobile Card Preview */}
          <div className="p-5 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-content-muted flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand" />
              <span>پیش‌نمایش کارت در موبایل</span>
            </h4>

            <div className="rounded-2xl bg-surface-50 p-3 border border-surface-border max-w-xs mx-auto">
              <div className="aspect-square w-full rounded-xl bg-surface-100 overflow-hidden mb-2 relative">
                {coverImage ? (
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">
                    آهنگام
                  </div>
                )}
                {isEditorPick && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand text-white">
                    منتخب
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-content-primary truncate">
                {title || "عنوان آهنگ آزمایشی"}
              </p>
              <p className="text-[11px] text-content-muted truncate">
                {selectedArtistName}
              </p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-content-muted font-mono">
                <span>{formatDuration(duration)}</span>
                <span className="text-brand font-bold">320k</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
