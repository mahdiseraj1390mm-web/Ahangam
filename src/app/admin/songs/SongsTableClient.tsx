"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  Trash2,
  Eye,
  PlusCircle,
  Search,
  Sparkles,
  Music,
  Headphones,
  Download,
  Edit3,
  X,
  Check,
  Upload,
  FileAudio,
  Layers,
  FileText,
} from "lucide-react";
import { formatNumberPersian, formatDuration, formatPersianDate, toPersianDigits } from "@/lib/utils";

interface SongRow {
  id: string;
  title: string;
  slug: string;
  duration: number;
  coverImage: string | null;
  lyrics?: string | null;
  syncedLyrics?: string | null;
  lyricist?: string | null;
  composer?: string | null;
  arranger?: string | null;
  publisher?: string | null;
  artistId?: string;
  albumId?: string | null;
  playCount: number;
  downloadCount: number;
  status: string;
  isFeatured: boolean;
  isEditorPick: boolean;
  createdAt: string | Date;
  genres?: { genreId: string }[];
  artist: { id?: string; name: string };
  album?: { id?: string; title: string } | null;
  qualities?: { quality: string; fileUrl: string; isDefault?: boolean }[];
}

interface SongsTableClientProps {
  initialSongs: SongRow[];
  allArtists?: { id: string; name: string }[];
  allAlbums?: { id: string; title: string; artistId: string }[];
  allGenres?: { id: string; name: string }[];
}

export function SongsTableClient({
  initialSongs,
  allArtists = [],
  allAlbums = [],
  allGenres = [],
}: SongsTableClientProps) {
  const router = useRouter();
  const [songs, setSongs] = useState<SongRow[]>(initialSongs);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkRunning, setIsBulkRunning] = useState(false);

  // Comprehensive Edit song state
  const [editingSong, setEditingSong] = useState<SongRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editAlbumTitle, setEditAlbumTitle] = useState("");
  const [editDuration, setEditDuration] = useState<number>(0);
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editUrl320, setEditUrl320] = useState("");
  const [editUrl128, setEditUrl128] = useState("");
  const [editLyrics, setEditLyrics] = useState("");
  const [editLyricist, setEditLyricist] = useState("");
  const [editComposer, setEditComposer] = useState("");
  const [editArranger, setEditArranger] = useState("");
  const [editPublisher, setEditPublisher] = useState("");
  const [editStatus, setEditStatus] = useState("PUBLISHED");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editEditorPick, setEditEditorPick] = useState(false);
  const [editGenreIds, setEditGenreIds] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const startEditSong = (song: SongRow) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtistName(song.artist?.name || "");
    setEditAlbumTitle(song.album?.title || "");
    setEditDuration(song.duration || 0);
    setEditCoverImage(song.coverImage || "");
    setEditGenreIds(song.genres?.map((g) => g.genreId) || []);

    const q320 = song.qualities?.find((q) => q.quality === "320")?.fileUrl || "";
    const q128 = song.qualities?.find((q) => q.quality === "128")?.fileUrl || "";
    setEditUrl320(q320);
    setEditUrl128(q128);

    setEditLyrics(song.lyrics || "");
    setEditLyricist(song.lyricist || "");
    setEditComposer(song.composer || "");
    setEditArranger(song.arranger || "");
    setEditPublisher(song.publisher || "");
    setEditStatus(song.status);
    setEditFeatured(song.isFeatured);
    setEditEditorPick(song.isEditorPick);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAudio(true);
      // Detect duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setEditDuration(Math.round(audio.duration));
        }
      };

      let fileUrl = "";
      try {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });
        fileUrl = newBlob.url;
      } catch {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          fileUrl = data.url;
        } else {
          throw new Error(data?.message || "خطا در آپلود فایل صوتی.");
        }
      }

      if (fileUrl) {
        setEditUrl320(fileUrl);
      }
    } catch (err: any) {
      alert(`خطا در آپلود فایل صوتی: ${err?.message || "مشکل در اتصال"}`);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      let coverUrl = "";
      try {
        const newBlob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });
        coverUrl = newBlob.url;
      } catch {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.url) {
          coverUrl = data.url;
        } else {
          throw new Error(data?.message || "خطا در آپلود تصویر کاور.");
        }
      }

      if (coverUrl) {
        setEditCoverImage(coverUrl);
      }
    } catch (err: any) {
      alert(`خطا در آپلود کاور: ${err?.message || "مشکل در اتصال"}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editTitle.trim()) return;

    try {
      setIsSavingEdit(true);

      const qualitiesPayload = [
        ...(editUrl320 ? [{ quality: "320", fileUrl: editUrl320, isDefault: true }] : []),
        ...(editUrl128 ? [{ quality: "128", fileUrl: editUrl128, isDefault: false }] : []),
      ];

      const res = await fetch(`/api/admin/songs/${editingSong.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          artistName: editArtistName.trim() || undefined,
          albumTitle: editAlbumTitle.trim() || null,
          duration: Number(editDuration) || 0,
          coverImage: editCoverImage.trim() || null,
          lyrics: editLyrics.trim() || null,
          lyricist: editLyricist.trim() || null,
          composer: editComposer.trim() || null,
          arranger: editArranger.trim() || null,
          publisher: editPublisher.trim() || null,
          status: editStatus,
          isFeatured: editFeatured,
          isEditorPick: editEditorPick,
          genreIds: editGenreIds,
          qualities: qualitiesPayload.length > 0 ? qualitiesPayload : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.song) {
        setSongs((prev) =>
          prev.map((s) => (s.id === editingSong.id ? { ...s, ...data.song } : s))
        );
        setEditingSong(null);
        alert("تغییرات آهنگ با موفقیت ذخیره شد!");
      } else {
        alert(data.message || "خطا در ذخیره تغییرات آهنگ.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const [selectedGenreFilter, setSelectedGenreFilter] = useState("ALL");

  const filtered = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.name.toLowerCase().includes(search.toLowerCase());
    const matchesGenre =
      selectedGenreFilter === "ALL" ||
      s.genres?.some((g) => g.genreId === selectedGenreFilter);
    return matchesSearch && matchesGenre;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: "DELETE" | "CHANGE_STATUS", value?: string) => {
    if (selectedIds.length === 0) return;
    if (action === "DELETE" && !confirm(`آیا از حذف گروهی ${selectedIds.length} قطعه اطمینان دارید؟`)) {
      return;
    }

    try {
      setIsBulkRunning(true);
      const res = await fetch("/api/admin/songs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songIds: selectedIds, action, value }),
      });

      if (res.ok) {
        if (action === "DELETE") {
          setSongs((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
        } else if (action === "CHANGE_STATUS") {
          setSongs((prev) =>
            prev.map((s) => (selectedIds.includes(s.id) ? { ...s, status: value! } : s))
          );
        }
        setSelectedIds([]);
        alert("عملیات گروهی با موفقیت اعمال شد.");
      } else {
        alert("خطا در انجام عملیات گروهی.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsBulkRunning(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`آیا از حذف آهنگ «${title}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`)) {
      return;
    }
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("خطا در حذف آهنگ.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در آهنگ‌ها..."
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
            <Search className="w-4 h-4 text-content-muted absolute right-3 top-2.5" />
          </div>

          {/* Genre Filter */}
          {allGenres.length > 0 && (
            <select
              value={selectedGenreFilter}
              onChange={(e) => setSelectedGenreFilter(e.target.value)}
              className="w-full sm:w-auto bg-surface-card border border-surface-border rounded-xl px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand"
            >
              <option value="ALL">همه سبک‌ها و دسته‌ها</option>
              {allGenres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Link
          href="/admin/songs/new"
          className="w-full sm:w-auto px-4 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>افزودن آهنگ جدید</span>
        </Link>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-brand/10 border border-brand/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <span className="text-xs font-bold text-brand">
            {toPersianDigits(selectedIds.length)} قطعه انتخاب شده است
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("CHANGE_STATUS", "PUBLISHED")}
              disabled={isBulkRunning}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              تغییر وضعیت به منتشر شده
            </button>
            <button
              onClick={() => handleBulkAction("CHANGE_STATUS", "DRAFT")}
              disabled={isBulkRunning}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
            >
              تغییر وضعیت به پیش‌نویس
            </button>
            <button
              onClick={() => handleBulkAction("DELETE")}
              disabled={isBulkRunning}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              حذف قطعات انتخابی
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-50 border-b border-surface-border text-content-secondary font-bold">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    className="accent-brand rounded"
                  />
                </th>
                <th className="p-3.5">عنوان قطعه</th>
                <th className="p-3.5">هنرمند</th>
                <th className="p-3.5">مدت</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5">پخش / دانلود</th>
                <th className="p-3.5">تاریخ ثبت</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map((song) => {
                const isSelected = selectedIds.includes(song.id);
                return (
                  <tr
                    key={song.id}
                    className={`transition-colors ${
                      isSelected ? "bg-brand/5" : "hover:bg-surface-50/50"
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(song.id)}
                        className="accent-brand rounded"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-surface-100">
                        {song.coverImage && (
                          <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-content-primary">{song.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {song.isEditorPick && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand/10 text-brand font-bold">
                              سردبیر
                            </span>
                          )}
                          {song.isFeatured && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold">
                              ویژه
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-content-primary font-medium">{song.artist.name}</td>
                  <td className="p-3.5 font-mono text-content-muted">{formatDuration(song.duration)}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        song.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {song.status === "PUBLISHED" ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-content-muted">
                    {formatNumberPersian(song.playCount)} / {formatNumberPersian(song.downloadCount)}
                  </td>
                  <td className="p-3.5 text-content-muted">{formatPersianDate(song.createdAt)}</td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startEditSong(song)}
                        className="p-1.5 rounded-lg hover:bg-surface-100 text-content-muted hover:text-brand transition-colors"
                        title="ویرایش مشخصات آهنگ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/song/${song.slug || song.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg hover:bg-surface-100 text-content-muted hover:text-brand transition-colors"
                        title="مشاهده در سایت"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              `آیا می‌خواهید آهنگ «${song.title}» را به عنوان پیشنهاد ویژه روز در صفحه اصلی تنظیم کنید؟ این انتخاب تا زمان تعیین آهنگ بعدی ثابت می‌ماند.`
                            )
                          ) {
                            try {
                              const res = await fetch("/api/admin/daily-featured", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  songId: song.id,
                                  title: song.title,
                                  subtitle: `اثری شنیدنی و خاطره‌انگیز با صدای ${song.artist?.name || "بیتا"}`,
                                  bannerImage: song.coverImage || null,
                                  isEnabled: true,
                                }),
                              });
                              if (res.ok) {
                                alert(`آهنگ «${song.title}» به عنوان پیشنهاد ویژه روز در صفحه اصلی تنظیم شد!`);
                              }
                            } catch {
                              alert("خطا در تنظیم پیشنهاد ویژه روز.");
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-amber-500/10 text-content-muted hover:text-amber-400 transition-colors"
                        title="تنظیم به عنوان پیشنهاد ویژه روز در صفحه اول"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(song.id, song.title)}
                        disabled={isDeleting === song.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-content-muted hover:text-red-400 transition-colors"
                        title="حذف آهنگ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Edit Song Modal */}
      {editingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-content-primary">
                    ویرایش جامع آهنگ: «{editingSong.title}»
                  </h3>
                  <p className="text-[11px] text-content-muted">
                    ویرایش مشخصات، هنرمند، آلبوم، فایل‌های صوتی، کاور و متن ترانه
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSong(null)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Section 1: Basic Information */}
              <div className="p-4 rounded-2xl bg-surface-50/60 border border-surface-border space-y-3">
                <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5 text-brand">
                  <Music className="w-4 h-4" />
                  <span>مشخصات اصلی قطعه</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1">
                      عنوان آهنگ *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="مثال: جاده یک طرفه"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1">
                      نام هنرمند (انتخاب یا تایپ نام دلخواه) *
                    </label>
                    <input
                      type="text"
                      required
                      list="artists-datalist"
                      value={editArtistName}
                      onChange={(e) => setEditArtistName(e.target.value)}
                      placeholder="نام هنرمند..."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                    <datalist id="artists-datalist">
                      {allArtists.map((a) => (
                        <option key={a.id} value={a.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1">
                      عنوان آلبوم (اختیاری یا تک‌آهنگ)
                    </label>
                    <input
                      type="text"
                      list="albums-datalist"
                      value={editAlbumTitle}
                      onChange={(e) => setEditAlbumTitle(e.target.value)}
                      placeholder="بدون آلبوم یا نام آلبوم..."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                    <datalist id="albums-datalist">
                      {allAlbums.map((alb) => (
                        <option key={alb.id} value={alb.title} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-content-secondary mb-1">
                      مدت زمان (ثانیه)
                    </label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(Number(e.target.value))}
                      placeholder="180"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                {/* Genres & Moods Selection */}
                {allGenres.length > 0 && (
                  <div className="pt-2 border-t border-surface-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-content-secondary">
                        سبک و دسته‌بندی موضوعی آهنگ (سبک‌ها و حال‌وهوا):
                      </label>
                      <span className="text-[11px] font-bold text-brand">
                        {toPersianDigits(editGenreIds.length)} سبک انتخاب شده
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allGenres.map((g) => {
                        const isSelected = editGenreIds.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditGenreIds(editGenreIds.filter((id) => id !== g.id));
                              } else {
                                setEditGenreIds([...editGenreIds, g.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-brand text-white border-brand shadow-sm scale-105"
                                : "bg-surface-card hover:bg-surface-100 text-content-secondary border-surface-border"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                            <span>{g.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Audio File and Qualities */}
              <div className="p-4 rounded-2xl bg-surface-50/60 border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5 text-brand">
                    <FileAudio className="w-4 h-4" />
                    <span>فایل صوتی و کیفیت‌ها</span>
                  </h4>
                  <label className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingAudio ? "در حال آپلود و پردازش..." : "آپلود فایل جدید MP3"}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={isUploadingAudio}
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      آدرس فایل کیفیت ۳۲۰ (kbps)
                    </label>
                    <input
                      type="text"
                      value={editUrl320}
                      onChange={(e) => setEditUrl320(e.target.value)}
                      placeholder="/audio/... یا لینک مستقیم"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      آدرس فایل کیفیت ۱۲۸ (kbps)
                    </label>
                    <input
                      type="text"
                      value={editUrl128}
                      onChange={(e) => setEditUrl128(e.target.value)}
                      placeholder="/audio/... یا لینک ۱۲۸"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Cover Image */}
              <div className="p-4 rounded-2xl bg-surface-50/60 border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5 text-brand">
                    <Layers className="w-4 h-4" />
                    <span>تصویر کاور آهنگ</span>
                  </h4>
                  <label className="text-[11px] font-bold text-brand hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? "در حال آپلود کاور..." : "آپلود عکس از سیستم"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingCover}
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="https://... یا آپلود عکس با دکمه بالا"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                  />
                  {editCoverImage && (
                    <img
                      src={editCoverImage}
                      alt="Cover Preview"
                      className="w-11 h-11 rounded-xl object-cover border border-surface-border shrink-0 shadow-sm"
                    />
                  )}
                </div>
              </div>

              {/* Section 4: Lyrics and Credits */}
              <div className="p-4 rounded-2xl bg-surface-50/60 border border-surface-border space-y-3">
                <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5 text-brand">
                  <FileText className="w-4 h-4" />
                  <span>متن ترانه و شناسنامه اثر</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    متن ترانه (Lyrics)
                  </label>
                  <textarea
                    rows={4}
                    value={editLyrics}
                    onChange={(e) => setEditLyrics(e.target.value)}
                    placeholder="متن ترانه را اینجا بنویسید..."
                    className="w-full p-3 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      ترانه‌سرا
                    </label>
                    <input
                      type="text"
                      value={editLyricist}
                      onChange={(e) => setEditLyricist(e.target.value)}
                      placeholder="شاعر"
                      className="w-full p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      آهنگساز
                    </label>
                    <input
                      type="text"
                      value={editComposer}
                      onChange={(e) => setEditComposer(e.target.value)}
                      placeholder="آهنگساز"
                      className="w-full p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      تنظیم‌کننده
                    </label>
                    <input
                      type="text"
                      value={editArranger}
                      onChange={(e) => setEditArranger(e.target.value)}
                      placeholder="تنظیم"
                      className="w-full p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-content-secondary mb-1">
                      ناشر / کمپانی
                    </label>
                    <input
                      type="text"
                      value={editPublisher}
                      onChange={(e) => setEditPublisher(e.target.value)}
                      placeholder="ناشر"
                      className="w-full p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Status and Display Options */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-50/60 border border-surface-border">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    وضعیت انتشار
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-bold"
                  >
                    <option value="PUBLISHED">منتشر شده (عمومی)</option>
                    <option value="DRAFT">پیش‌نویس (مخفی)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="accent-brand rounded"
                    />
                    <span className="text-xs font-medium text-content-primary">
                      آهنگ ویژه بنر
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editEditorPick}
                      onChange={(e) => setEditEditorPick(e.target.checked)}
                      className="accent-brand rounded"
                    />
                    <span className="text-xs font-medium text-content-primary">
                      پیشنهاد سردبیر
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`آیا از حذف کامل آهنگ «${editingSong.title}» مطمئن هستید؟`)) {
                      handleDelete(editingSong.id, editingSong.title);
                      setEditingSong(null);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف این آهنگ</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSong(null)}
                    className="px-4 py-2.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-muted font-bold text-xs transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit || isUploadingAudio || isUploadingCover}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingEdit ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
