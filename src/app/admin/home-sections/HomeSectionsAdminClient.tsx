"use client";

import React, { useState } from "react";
import {
  Layers,
  Check,
  ArrowUp,
  ArrowDown,
  Smartphone,
  Monitor,
  Sparkles,
  Trash2,
  Upload,
  Music,
  ChevronLeft,
} from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface HomeSectionRow {
  id: string;
  key: string;
  title: string;
  sortOrder: number;
  isEnabled: boolean;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  limitCount: number;
}

interface SongSummary {
  id: string;
  title: string;
  coverImage: string | null;
  artist: { name: string };
}

interface HomeSectionsAdminClientProps {
  initialSections: HomeSectionRow[];
  allSongs?: SongSummary[];
  initialDailyFeatured?: {
    songId: string;
    title: string;
    subtitle: string;
    bannerImage: string | null;
    isEnabled: boolean;
  } | null;
}

export function HomeSectionsAdminClient({
  initialSections,
  allSongs = [],
  initialDailyFeatured = null,
}: HomeSectionsAdminClientProps) {
  const [sections, setSections] = useState<HomeSectionRow[]>(initialSections);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Daily Featured Song state
  const [dailySongId, setDailySongId] = useState(
    initialDailyFeatured?.songId || allSongs[0]?.id || ""
  );
  const [dailyTitle, setDailyTitle] = useState(initialDailyFeatured?.title || "");
  const [dailySubtitle, setDailySubtitle] = useState(initialDailyFeatured?.subtitle || "");
  const [dailyBannerImage, setDailyBannerImage] = useState(
    initialDailyFeatured?.bannerImage || ""
  );
  const [dailyEnabled, setDailyEnabled] = useState(
    initialDailyFeatured?.isEnabled ?? true
  );
  const [isSavingDaily, setIsSavingDaily] = useState(false);
  const [dailyMsg, setDailyMsg] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const selectedSongObj = allSongs.find((s) => s.id === dailySongId);

  const handleSelectSong = (id: string) => {
    setDailySongId(id);
    const s = allSongs.find((item) => item.id === id);
    if (s) {
      if (!dailyTitle || allSongs.some((item) => item.title === dailyTitle)) {
        setDailyTitle(s.title);
      }
      if (!dailySubtitle || dailySubtitle.includes("اثری شنیدنی")) {
        setDailySubtitle(`اثری شنیدنی و خاطره‌انگیز با صدای ${s.artist?.name || "بیتا"}`);
      }
      if (!dailyBannerImage) {
        setDailyBannerImage(s.coverImage || "");
      }
    }
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingBanner(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setDailyBannerImage(data.url);
      } else {
        alert(data.message || "خطا در آپلود تصویر بنر.");
      }
    } catch {
      alert("خطای اتصال در آپلود بنر.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSaveDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailySongId) {
      alert("لطفاً یک آهنگ را انتخاب کنید.");
      return;
    }
    try {
      setIsSavingDaily(true);
      setDailyMsg(null);
      const res = await fetch("/api/admin/daily-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songId: dailySongId,
          title: dailyTitle.trim() || selectedSongObj?.title,
          subtitle:
            dailySubtitle.trim() ||
            `اثری شنیدنی و خاطره‌انگیز با صدای ${selectedSongObj?.artist?.name || "بیتا"}`,
          bannerImage: dailyBannerImage.trim() || selectedSongObj?.coverImage || null,
          isEnabled: dailyEnabled,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDailyMsg("پیشنهاد ویژه روز ذخیره شد و تا زمان تغییر بعدی ثابت می‌ماند!");
        setTimeout(() => setDailyMsg(null), 4000);
      } else {
        alert(data.message || "خطا در ذخیره پیشنهاد ویژه روز.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingDaily(false);
    }
  };

  const handleDeleteDaily = async () => {
    if (!confirm("آیا از حذف پیشنهاد ویژه روز اطمینان دارید؟")) return;
    try {
      setIsSavingDaily(true);
      const res = await fetch("/api/admin/daily-featured", { method: "DELETE" });
      if (res.ok) {
        setDailyEnabled(false);
        setDailyMsg("پیشنهاد ویژه روز با موفقیت حذف/غیرفعال شد.");
        setTimeout(() => setDailyMsg(null), 4000);
      } else {
        alert("خطا در حذف پیشنهاد ویژه روز.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingDaily(false);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const updated = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate sortOrder
    const reordered = updated.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    setSections(reordered);
  };

  const toggleField = (id: string, field: "isEnabled" | "showOnMobile" | "showOnDesktop") => {
    setSections(
      sections.map((sec) => (sec.id === id ? { ...sec, [field]: !sec[field] } : sec))
    );
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setSections(
      sections.map((sec) => (sec.id === id ? { ...sec, title: newTitle } : sec))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatusMsg(null);
      const res = await fetch("/api/admin/home-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (res.ok) {
        setStatusMsg("چیدمان و تنظیمات بخش‌های صفحه اصلی در پایگاه داده ذخیره شد.");
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert("خطا در ذخیره تنظیمات.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {dailyMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{dailyMsg}</span>
        </div>
      )}

      {/* 1. Daily Featured Song Management Card */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-content-primary">
                مدیریت پیشنهاد ویژه روز (بنر اصلی صفحه اول)
              </h2>
              <p className="text-xs text-content-muted">
                هر روز می‌توانید یک آهنگ را انتخاب کنید. اگر انتخاب نکنید، آهنگ قبلی تا زمان تغییر ثابت می‌ماند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold ${
                dailyEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {dailyEnabled ? "بنر فعال و در حال نمایش" : "بنر غیرفعال / مخفی"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveDaily} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                انتخاب آهنگ روز از آرشیو *
              </label>
              <select
                value={dailySongId}
                onChange={(e) => handleSelectSong(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              >
                {allSongs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {s.artist?.name || "بیتا"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                عنوان آهنگ در بنر (اختیاری)
              </label>
              <input
                type="text"
                value={dailyTitle}
                onChange={(e) => setDailyTitle(e.target.value)}
                placeholder={selectedSongObj?.title || "عنوان نمایشی آهنگ..."}
                className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                زیرعنوان و توضیحات بنر
              </label>
              <input
                type="text"
                value={dailySubtitle}
                onChange={(e) => setDailySubtitle(e.target.value)}
                placeholder="مثال: اثری شنیدنی و خاطره‌انگیز با صدای..."
                className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-content-secondary">
                  تصویر بنر / کاور آهنگ در بنر
                </label>
                <label className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingBanner ? "در حال آپلود..." : "آپلود تصویر اختصاصی بنر"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingBanner}
                    onChange={handleUploadBanner}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={dailyBannerImage}
                  onChange={(e) => setDailyBannerImage(e.target.value)}
                  placeholder="https://... یا آپلود از دکمه بالا (در صورت خالی بودن از کاور آهنگ استفاده می‌شود)"
                  className="flex-1 p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />
                {dailyBannerImage && (
                  <img
                    src={dailyBannerImage}
                    alt="Banner Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-surface-border shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-content-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={dailyEnabled}
                onChange={(e) => setDailyEnabled(e.target.checked)}
                className="accent-brand rounded"
              />
              <span>نمایش فعال این بنر در صفحه اصلی</span>
            </label>
          </div>

          {/* Live Preview of Hero Banner */}
          <div className="pt-2">
            <span className="block text-[11px] font-bold text-content-muted mb-2">
              پیش‌نمایش زنده بنر صفحه اول:
            </span>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand/90 to-purple-950 p-5 text-white shadow-lg border border-brand/20">
              <div className="relative z-10 max-w-md space-y-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>پیشنهاد ویژه روز در آهنگام</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {dailyTitle || selectedSongObj?.title || "عنوان آهنگ"}
                </h3>
                <p className="text-xs text-white/80">
                  {dailySubtitle ||
                    `اثری شنیدنی و خاطره‌انگیز با صدای ${selectedSongObj?.artist?.name || "بیتا"}`}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="px-3 py-1.5 rounded-xl bg-white text-brand font-bold text-xs flex items-center gap-1">
                    <span>پخش و متن ترانه</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-black/30 text-white font-medium text-xs">
                    مرور آرشیو
                  </div>
                </div>
              </div>

              {(dailyBannerImage || selectedSongObj?.coverImage) && (
                <div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-2xl overflow-hidden shadow-xl rotate-6 border-2 border-white/20 opacity-90 hidden sm:block">
                  <img
                    src={dailyBannerImage || selectedSongObj?.coverImage || ""}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={handleDeleteDaily}
              disabled={isSavingDaily}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف / غیرفعال‌سازی پیشنهاد ویژه</span>
            </button>

            <button
              type="submit"
              disabled={isSavingDaily}
              className="px-6 py-2.5 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingDaily ? "در حال ثبت..." : "ثبت و ماندگار کردن پیشنهاد ویژه روز"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Sections Order Table */}
      <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-50 border-b border-surface-border text-content-secondary font-bold">
              <tr>
                <th className="p-3.5">ترتیب</th>
                <th className="p-3.5">شناسه بخش</th>
                <th className="p-3.5">عنوان نمایشی</th>
                <th className="p-3.5 text-center">وضعیت فعال</th>
                <th className="p-3.5 text-center">نمایش در موبایل</th>
                <th className="p-3.5 text-center">نمایش در دسکتاپ</th>
                <th className="p-3.5 text-center">جابه‌جایی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {sections.map((sec, idx) => (
                <tr key={sec.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="p-3.5 font-bold font-mono text-content-muted">
                    {toPersianDigits(idx + 1)}
                  </td>
                  <td className="p-3.5 font-mono text-content-muted">{sec.key}</td>
                  <td className="p-3.5">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleTitleChange(sec.id, e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-bold w-full max-w-xs"
                    />
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => toggleField(sec.id, "isEnabled")}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        sec.isEnabled
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-surface-100 text-content-muted"
                      }`}
                    >
                      {sec.isEnabled ? "فعال" : "غیرفعال"}
                    </button>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => toggleField(sec.id, "showOnMobile")}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        sec.showOnMobile
                          ? "border-brand/30 bg-brand/10 text-brand"
                          : "border-surface-border text-content-muted"
                      }`}
                      title="موبایل"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => toggleField(sec.id, "showOnDesktop")}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        sec.showOnDesktop
                          ? "border-brand/30 bg-brand/10 text-brand"
                          : "border-surface-border text-content-muted"
                      }`}
                      title="دسکتاپ"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-surface-100 text-content-muted hover:text-content-primary disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-surface-100 text-content-muted hover:text-content-primary disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? "در حال ذخیره..." : "ذخیره تغییرات چیدمان"}</span>
        </button>
      </div>
    </div>
  );
}
