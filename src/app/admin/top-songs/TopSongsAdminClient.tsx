"use client";

import React, { useState } from "react";
import {
  Flame,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
  Music,
} from "lucide-react";
import { toPersianDigits, formatNumberPersian } from "@/lib/utils";

interface SongSummary {
  id: string;
  title: string;
  coverImage: string | null;
  playCount: number;
  artist: { id: string; name: string };
}

interface TopSongsConfig {
  title: string;
  subtitle: string;
  mode: string; // "manual" | "auto"
  songIds: string[];
  isEnabled: boolean;
  limitCount: number;
}

interface TopSongsAdminClientProps {
  initialConfig: TopSongsConfig;
  allSongs: SongSummary[];
}

export function TopSongsAdminClient({
  initialConfig,
  allSongs,
}: TopSongsAdminClientProps) {
  const [title, setTitle] = useState(initialConfig.title || "برترین آهنگ‌های این هفته در آهنگام");
  const [subtitle, setSubtitle] = useState(
    initialConfig.subtitle || "جدول رسمی پرشنونده‌ترین و محبوب‌ترین قطعات موسیقی"
  );
  const [mode, setMode] = useState<"manual" | "auto">((initialConfig.mode as any) || "manual");
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>(initialConfig.songIds || []);
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled ?? true);
  const [limitCount, setLimitCount] = useState(initialConfig.limitCount || 8);

  const [addSongId, setAddSongId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const songMap = new Map(allSongs.map((s) => [s.id, s]));

  // Selected songs objects in order
  const rankedSongs: SongSummary[] = selectedSongIds
    .map((id) => songMap.get(id))
    .filter(Boolean) as SongSummary[];

  // Reorder rankings
  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedSongIds];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedSongIds(next);
  };

  const moveDown = (index: number) => {
    if (index === selectedSongIds.length - 1) return;
    const next = [...selectedSongIds];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedSongIds(next);
  };

  const handleRemove = (id: string) => {
    setSelectedSongIds(selectedSongIds.filter((item) => item !== id));
  };

  const handleAddSong = () => {
    if (!addSongId) return;
    if (selectedSongIds.includes(addSongId)) {
      alert("این قطعه در حال حاضر در جدول برترین‌ها وجود دارد.");
      return;
    }
    setSelectedSongIds([...selectedSongIds, addSongId]);
    setAddSongId("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMsg(null);

      const res = await fetch("/api/admin/top-songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          mode,
          songIds: selectedSongIds,
          isEnabled,
          limitCount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({
          text: "تنظیمات و چیدمان برترین آهنگ‌ها با موفقیت ذخیره شد و در صفحه اصلی اعمال گردید.",
          type: "success",
        });
        setTimeout(() => setMsg(null), 5000);
      } else {
        setMsg({ text: data.message || "خطا در ذخیره تنظیمات.", type: "error" });
      }
    } catch {
      setMsg({ text: "خطای سرور.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Visibility & Mode */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-content-primary">
                  تنظیمات بخش برترین آهنگ‌ها (Top Charts)
                </h2>
                <p className="text-xs text-content-muted mt-0.5">
                  کنترل فعال‌سازی و شیوه گزینش ترانه‌ها در جدول برترین‌های سایت
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border ${
                  isEnabled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isEnabled ? "بخش در حال نمایش" : "بخش مخفی شده"}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5">
                عنوان بخش در صفحه اصلی *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="برترین آهنگ‌های این هفته در آهنگام"
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5">
                زیرعنوان و توضیحات بخش
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="جدول رسمی پرشنونده‌ترین و محبوب‌ترین قطعات موسیقی"
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Selection Mode */}
            <div>
              <label className="block text-xs font-bold text-content-primary mb-2">
                نحوه گزینش و چینش ترانه‌ها:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    mode === "manual"
                      ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                      : "bg-surface-50 text-content-secondary hover:text-content-primary border-surface-border"
                  }`}
                >
                  چیدمان دستی و انتخابی مدیر
                </button>
                <button
                  type="button"
                  onClick={() => setMode("auto")}
                  className={`p-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    mode === "auto"
                      ? "bg-brand text-white border-brand shadow-md shadow-brand/20"
                      : "bg-surface-50 text-content-secondary hover:text-content-primary border-surface-border"
                  }`}
                >
                  خودکار (بیشترین پخش)
                </button>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-content-primary">
                تنظیمات نمایش:
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-content-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="accent-brand rounded"
                />
                <span>نمایش این بخش در صفحه اصلی سایت</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Manual Ranking Table */}
        {mode === "manual" && (
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
              <div>
                <h3 className="text-sm font-black text-content-primary flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>جدول رتبه‌بندی آهنگ‌ها (رتبه‌های ۱، ۲، ۳...)</span>
                </h3>
                <p className="text-[11px] text-content-muted mt-0.5">
                  ترتیب رتبه‌ها را با دکمه‌های بالا و پایین تعیین کنید. رتبه ۱ در صدر جدول قرار می‌گیرد.
                </p>
              </div>

              {/* Add Song Picker */}
              <div className="flex items-center gap-2">
                <select
                  value={addSongId}
                  onChange={(e) => setAddSongId(e.target.value)}
                  className="p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand sm:w-60"
                >
                  <option value="">انتخاب آهنگ برای افزودن به جدول...</option>
                  {allSongs
                    .filter((s) => !selectedSongIds.includes(s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — {s.artist?.name || "بیتا"}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddSong}
                  disabled={!addSongId}
                  className="px-3.5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs disabled:opacity-50 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن</span>
                </button>
              </div>
            </div>

            {/* Ranked Songs List */}
            {rankedSongs.length > 0 ? (
              <div className="space-y-2.5">
                {rankedSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface-50 border border-surface-border gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${
                          index === 0
                            ? "bg-amber-400 text-amber-950 font-black"
                            : index === 1
                            ? "bg-slate-300 text-slate-800"
                            : index === 2
                            ? "bg-amber-700/80 text-white"
                            : "bg-surface-card text-content-muted border border-surface-border"
                        }`}
                      >
                        {toPersianDigits(index + 1)}
                      </div>

                      {/* Cover */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-card shrink-0 shadow-sm">
                        {song.coverImage ? (
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand/10 flex items-center justify-center text-[10px] text-brand font-bold">
                            آهنگام
                          </div>
                        )}
                      </div>

                      {/* Title & Artist */}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-content-primary block truncate">
                          {song.title}
                        </span>
                        <span className="text-[11px] text-content-muted block truncate">
                          {song.artist?.name || "بیتا"}
                        </span>
                      </div>
                    </div>

                    {/* Play count */}
                    <span className="hidden sm:inline text-xs text-content-muted font-mono">
                      {formatNumberPersian(song.playCount || 0)} پخش
                    </span>

                    {/* Up / Down & Remove */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                        title="افزایش رتبه (انتقال به بالا)"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDown(index)}
                        disabled={index === rankedSongs.length - 1}
                        className="p-1.5 rounded-lg hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                        title="کاهش رتبه (انتقال به پایین)"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(song.id)}
                        className="p-1.5 rounded-lg text-content-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="حذف از جدول برترین‌ها"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-content-muted space-y-1">
                <p>هیچ ترانه‌ای در جدول برترین‌ها انتخاب نشده است.</p>
                <p>از منوی بالای جدول، ترانه‌های مورد نظر را اضافه کنید.</p>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-lg shadow-brand/25 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "در حال ذخیره‌سازی..." : "ذخیره تنظیمات جدول برترین آهنگ‌ها"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
