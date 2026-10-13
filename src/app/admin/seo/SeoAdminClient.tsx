"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  FileCode2,
  FileText,
  Save,
  Check,
  RefreshCw,
  HelpCircle,
  Smartphone,
  Monitor,
} from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface AuditStats {
  totalSongs: number;
  publishedSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalVideos: number;
  totalIndexable: number;
  songsWithoutLyrics: number;
  songsWithoutCover: number;
  songsWithoutDesc: number;
  duplicateTitlesCount: number;
}

interface SongItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  lyrics: string | null;
  description: string | null;
  status: string;
  artist: { id: string; name: string; slug: string } | null;
}

export function SeoAdminClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState(85);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [baseUrl, setBaseUrl] = useState("https://ahangam-b18n.vercel.app");
  const [duplicateTitles, setDuplicateTitles] = useState<{ title: string; count: number }[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});

  // SERP preview simulator state
  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDesc, setPreviewDesc] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("mobile");

  // Edit modal / inline editor
  const [editingSong, setEditingSong] = useState<SongItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editLyrics, setEditLyrics] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [filterSearch, setFilterSearch] = useState("");

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/seo");
      if (res.ok) {
        const data = await res.json();
        setScore(data.score || 80);
        setStats(data.stats);
        setBaseUrl(data.baseUrl);
        setDuplicateTitles(data.duplicateTitles || []);
        setSongs(data.songs || []);
        setSettings(data.settings || {});

        if (data.songs && data.songs.length > 0) {
          const first = data.songs[0];
          setSelectedSongId(first.id);
          const artistName = first.artist?.name || "بیتا";
          setPreviewTitle(`دانلود آهنگ ${first.title} از ${artistName} + متن ترانه و پخش آنلاین | آهنگام`);
          setPreviewDesc(`دانلود آهنگ جدید ${first.title} با صدای ${artistName} با دو کیفیت 320 و 128 به همراه متن کامل شعر و پخش آنلاین در رسانه آهنگام.`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleSelectSongForPreview = (songId: string) => {
    setSelectedSongId(songId);
    const s = songs.find((x) => x.id === songId);
    if (s) {
      const artistName = s.artist?.name || "بیتا";
      setPreviewTitle(`دانلود آهنگ ${s.title} از ${artistName} + متن ترانه و پخش آنلاین | آهنگام`);
      setPreviewDesc(
        s.description ||
          `دانلود آهنگ جدید ${s.title} با صدای ${artistName} با دو کیفیت 320 و 128 به همراه متن کامل شعر و پخش آنلاین در رسانه آهنگام.`
      );
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleOpenEdit = (song: SongItem) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditSlug(song.slug);
    setEditLyrics(song.lyrics || "");
    setEditDesc(song.description || "");
  };

  const handleSaveSongSeo = async () => {
    if (!editingSong) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SONG",
          songId: editingSong.id,
          title: editTitle,
          slug: editSlug,
          lyrics: editLyrics,
          description: editDesc,
        }),
      });

      if (res.ok) {
        alert("اطلاعات سئوی آهنگ با موفقیت به‌روزرسانی شد!");
        setEditingSong(null);
        fetchAuditData();
      } else {
        alert("خطا در به‌روزرسانی اطلاعات سئو.");
      }
    } catch {
      alert("خطای اتصال به سرور.");
    } finally {
      setSaving(false);
    }
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (s.artist?.name && s.artist.name.toLowerCase().includes(filterSearch.toLowerCase())) ||
      s.slug.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-content-primary">
              مرکز مدیریت و تحلیل سئو (SEO Control Center)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-content-muted">
            مدیریت فنی ایندکس، نظارت بر سلامت محتوا، شبیه‌ساز سرپ گوگل و اتصال به Search Console
          </p>
        </div>

        <button
          onClick={fetchAuditData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-secondary hover:text-content-primary border border-surface-border text-xs font-bold transition-all flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand" : ""}`} />
          <span>ارزیابی مجدد سئو</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-semibold">شاخص سلامت سئو</span>
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black ${
                score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500"
              }`}
            >
              {toPersianDigits(score)}%
            </span>
            <span className="text-xs text-content-muted">
              {score >= 80 ? "عالی و آماده رقابت" : score >= 60 ? "نیازمند بهینه‌سازی" : "هشدار محتوایی"}
            </span>
          </div>
          <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Indexable Pages */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-semibold">صفحات عمومی قابل ایندکس</span>
            <FileCode2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-content-primary">
              {stats ? toPersianDigits(stats.totalIndexable) : "..."}
            </span>
            <span className="text-xs text-content-muted">صفحه در Sitemap</span>
          </div>
          <p className="text-[11px] text-content-muted leading-tight">
            شامل {stats ? toPersianDigits(stats.publishedSongs) : 0} قطعه موسیقی، {stats ? toPersianDigits(stats.totalArtists) : 0} هنرمند و دسته‌بندی‌ها
          </p>
        </div>

        {/* Urgent Content Gaps */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-semibold">کمبودهای محتوایی</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">
              {stats ? toPersianDigits(stats.songsWithoutLyrics + stats.songsWithoutCover) : "..."}
            </span>
            <span className="text-xs text-content-muted">مورد اصلاحی</span>
          </div>
          <p className="text-[11px] text-content-muted leading-tight">
            {stats ? toPersianDigits(stats.songsWithoutLyrics) : 0} بدون متن ترانه | {stats ? toPersianDigits(stats.songsWithoutCover) : 0} بدون کاور اصلی
          </p>
        </div>

        {/* Google Verification Status */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-semibold">تأییدیه Google Search Console</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
              <Check className="w-4 h-4" />
              تگ متصل در کد قالب
            </span>
          </div>
          <p className="text-[10px] text-content-muted font-mono truncate" title="40WYMf4U5Bs8qH3ASIY69XDeGe2uNqOFPy3cqmLX6Tc">
            کد: 40WYMf4U5Bs...LX6Tc
          </p>
        </div>
      </div>

      {/* Crawl URLs & Infrastructure Bar */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand" />
          <span>آدرس‌های زیرساخت خزش موتورهای جستجو (خزنده گوگل و بینگ)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Sitemap */}
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-content-muted font-bold block">نقشه سایت پویا (Sitemap XML):</span>
              <span className="font-mono text-content-primary truncate block dir-ltr text-right" dir="ltr">
                {baseUrl}/sitemap.xml
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(`${baseUrl}/sitemap.xml`, "sitemap")}
                className="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:text-brand transition-colors text-content-secondary"
                title="کپی آدرس"
              >
                {copiedMap["sitemap"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`${baseUrl}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:text-brand transition-colors text-content-secondary"
                title="مشاهده زنده"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Robots.txt */}
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-content-muted font-bold block">فایل دسترسی خزنده‌ها (Robots.txt):</span>
              <span className="font-mono text-content-primary truncate block dir-ltr text-right" dir="ltr">
                {baseUrl}/robots.txt
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(`${baseUrl}/robots.txt`, "robots")}
                className="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:text-brand transition-colors text-content-secondary"
                title="کپی آدرس"
              >
                {copiedMap["robots"] ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`${baseUrl}/robots.txt`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-surface-card border border-surface-border hover:text-brand transition-colors text-content-secondary"
                title="مشاهده زنده"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Google SERP Snippet Simulator */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
              <Search className="w-4 h-4 text-brand" />
              <span>شبیه‌ساز زنده نمایش در سرپ گوگل (Google SERP Snippet Simulator)</span>
            </h3>
            <p className="text-xs text-content-muted">
              پیش‌نمایش دقیق نحوه ظاهر شدن صفحات آهنگام در صفحه اول نتایج جستجوی گوگل
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-surface-50 border border-surface-border rounded-xl self-start">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                previewDevice === "mobile" ? "bg-brand text-white shadow-sm" : "text-content-secondary hover:text-content-primary"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>موبایل</span>
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                previewDevice === "desktop" ? "bg-brand text-white shadow-sm" : "text-content-secondary hover:text-content-primary"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>دسکتاپ</span>
            </button>
          </div>
        </div>

        {/* Selector for song */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              انتخاب قطعه برای شبیه‌سازی:
            </label>
            <select
              value={selectedSongId}
              onChange={(e) => handleSelectSongForPreview(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            >
              {songs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.artist?.name || "بیتا"})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              توضیحات متای صفحه (Meta Description):
            </label>
            <input
              type="text"
              value={previewDesc}
              onChange={(e) => setPreviewDesc(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Live SERP Snippet Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#202124] text-white border border-[#303134] shadow-inner font-sans dir-rtl text-right">
          <div className="max-w-xl space-y-1">
            {/* SERP URL & Favicon */}
            <div className="flex items-center gap-2 text-xs text-[#bdc1c6] pb-1">
              <div className="w-6 h-6 rounded-full bg-surface-card flex items-center justify-center p-0.5 border border-surface-border">
                <img src="/logo.png" alt="Ahangam" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="font-bold text-[#e8eaed]">آهنگام</span>
                <span className="text-[#9aa0a6] font-mono text-[10px] dir-ltr text-right" dir="ltr">
                  {baseUrl}/song/{songs.find((x) => x.id === selectedSongId)?.slug || "bita-song"}
                </span>
              </div>
            </div>

            {/* SERP Title */}
            <h4 className="text-base sm:text-lg font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-snug pt-0.5">
              {previewTitle}
            </h4>

            {/* SERP Snippet */}
            <p className="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed pt-1 line-clamp-3">
              {previewDesc}
            </p>

            {/* SERP Rich Snippet Breadcrumbs & Rating */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#9aa0a6]">
              <span className="text-amber-400">★★★★★</span>
              <span>امتیاز: ۵٫۰ (۱۸ رأی)</span>
              <span>•</span>
              <span>فرمت: MP3 320/128</span>
              <span>•</span>
              <span>رسانه رسمی آهنگام</span>
            </div>
          </div>
        </div>
      </div>

      {/* Songs SEO Audit & Quick Editor Table */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-content-primary">
              فهرست قطعات و وضعیت فیلدهای سئو
            </h3>
            <p className="text-xs text-content-muted">
              بررسی پیوند یکتا (Slug)، کاور، توضیحات و متن ترانه به همراه امکان ویرایش مستقیم
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="جستجوی عنوان یا خواننده..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
            />
            <Search className="w-3.5 h-3.5 text-content-muted absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-surface-border text-content-muted font-bold">
                <th className="pb-3 pr-2">کاور</th>
                <th className="pb-3">عنوان آهنگ</th>
                <th className="pb-3">هنرمند</th>
                <th className="pb-3">پیوند یکتا (Slug)</th>
                <th className="pb-3">متن ترانه</th>
                <th className="pb-3">توضیحات</th>
                <th className="pb-3 text-left pl-2">عملیات سئو</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {filteredSongs.map((song) => {
                const hasCover = song.coverImage && song.coverImage !== "/logo.png";
                const hasLyrics = !!song.lyrics && song.lyrics.trim().length > 10;
                const hasDesc = !!song.description && song.description.trim().length > 10;

                return (
                  <tr key={song.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 border border-surface-border shrink-0">
                        <img
                          src={song.coverImage || "/logo.png"}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 font-bold text-content-primary max-w-[160px] truncate">
                      {song.title}
                    </td>
                    <td className="py-3 text-content-secondary">
                      {song.artist?.name || "بیتا"}
                    </td>
                    <td className="py-3 font-mono text-[11px] text-content-muted max-w-[140px] truncate dir-ltr text-right" dir="ltr">
                      {song.slug}
                    </td>
                    <td className="py-3">
                      {hasLyrics ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          ثبت شده
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                          فاقد متن
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {hasDesc ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                          تکمیل
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-content-muted font-bold text-[10px]">
                          پیش‌فرض
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-left pl-2">
                      <button
                        onClick={() => handleOpenEdit(song)}
                        className="px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand text-brand hover:text-white border border-brand/20 text-xs font-bold transition-all"
                      >
                        ویرایش سئو
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit SEO Modal */}
      {editingSong && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-black text-content-primary">
                ویرایش اطلاعات سئو: {editingSong.title}
              </h3>
              <button
                onClick={() => setEditingSong(null)}
                className="text-content-muted hover:text-content-primary text-xs"
              >
                انصراف
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  عنوان قطعه (Song Title)
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  پیوند یکتای سئو (URL Slug)
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  dir="ltr"
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary font-mono focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  توضیحات اختصاصی سئو (Meta Description)
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="توضیح مفید درباره این اثر جهت جذب کاربر از نتایج جستجو..."
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  متن کامل ترانه (Lyrics - کلیدی‌ترین فاکتور سئوی جستجوی شعر)
                </label>
                <textarea
                  rows={6}
                  value={editLyrics}
                  onChange={(e) => setEditLyrics(e.target.value)}
                  placeholder="متن کامل ترانه را وارد کنید..."
                  className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed whitespace-pre-line"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
              <button
                onClick={() => setEditingSong(null)}
                className="px-4 py-2 rounded-xl text-xs text-content-muted hover:text-content-primary"
              >
                لغو
              </button>
              <button
                onClick={handleSaveSongSeo}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "در حال ذخیره..." : "ذخیره تغییرات سئو"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
