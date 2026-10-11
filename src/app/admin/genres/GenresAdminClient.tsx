"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Music,
  PlusCircle,
  Search,
  Trash2,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Upload,
  FolderPlus,
  Edit2,
  Tag,
} from "lucide-react";
import { toPersianDigits, formatNumberPersian } from "@/lib/utils";

interface SongSimple {
  id: string;
  title: string;
  coverImage: string | null;
  playCount?: number;
  downloadCount?: number;
  artist?: { name: string } | null;
  album?: { title: string } | null;
}

interface GenreData {
  id: string;
  name: string;
  slug: string;
  isMood: boolean;
  songCount: number;
  description?: string | null;
  songs: SongSimple[];
}

interface AllSongItem {
  id: string;
  title: string;
  coverImage: string | null;
  artistName: string;
  genreIds: string[];
}

interface GenresAdminClientProps {
  initialGenres: GenreData[];
  allSongs: AllSongItem[];
}

export function GenresAdminClient({
  initialGenres,
  allSongs,
}: GenresAdminClientProps) {
  const router = useRouter();
  const [genres, setGenres] = useState<GenreData[]>(initialGenres);
  const [selectedGenreId, setSelectedGenreId] = useState<string>(
    initialGenres[0]?.id || ""
  );
  const [searchSong, setSearchSong] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Create New Genre State
  const [isCreateGenreModalOpen, setIsCreateGenreModalOpen] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreSlug, setNewGenreSlug] = useState("");
  const [newGenreIsMood, setNewGenreIsMood] = useState(false);
  const [newGenreDescription, setNewGenreDescription] = useState("");
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);

  // Edit Genre State
  const [editingGenre, setEditingGenre] = useState<GenreData | null>(null);
  const [editGenreName, setEditGenreName] = useState("");
  const [editGenreSlug, setEditGenreSlug] = useState("");
  const [editGenreIsMood, setEditGenreIsMood] = useState(false);
  const [isSavingEditGenre, setIsSavingEditGenre] = useState(false);

  const selectedGenre = genres.find((g) => g.id === selectedGenreId) || genres[0];

  // 1. Create a brand new genre
  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) {
      alert("لطفاً نام سبک را وارد کنید");
      return;
    }

    setIsCreatingGenre(true);
    try {
      const res = await fetch("/api/admin/genres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGenreName.trim(),
          slug: newGenreSlug.trim() || undefined,
          isMood: newGenreIsMood,
          description: newGenreDescription.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ایجاد سبک");

      setGenres((prev) => [...prev, data.genre]);
      setSelectedGenreId(data.genre.id);
      setIsCreateGenreModalOpen(false);
      setNewGenreName("");
      setNewGenreSlug("");
      setNewGenreIsMood(false);
      setNewGenreDescription("");
      router.refresh();
      alert("سبک جدید با موفقیت به سایت اضافه شد.");
    } catch (err: any) {
      alert(err.message || "خطا در ایجاد سبک");
    } finally {
      setIsCreatingGenre(false);
    }
  };

  // 2. Delete an entire genre
  const handleDeleteGenre = async (genreId: string, genreName: string) => {
    if (!confirm(`آیا از حذف کامل سبک «${genreName}» اطمینان دارید؟ تمامی ارتباط‌های این سبک حذف خواهد شد.`)) {
      return;
    }

    setLoadingAction(genreId);
    try {
      const res = await fetch(`/api/admin/genres/${genreId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در حذف سبک");

      const remaining = genres.filter((g) => g.id !== genreId);
      setGenres(remaining);
      if (selectedGenreId === genreId && remaining.length > 0) {
        setSelectedGenreId(remaining[0].id);
      }
      router.refresh();
      alert("سبک با موفقیت حذف شد.");
    } catch (err: any) {
      alert(err.message || "خطا در حذف سبک");
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Edit genre
  const handleStartEditGenre = (genre: GenreData) => {
    setEditingGenre(genre);
    setEditGenreName(genre.name);
    setEditGenreSlug(genre.slug);
    setEditGenreIsMood(genre.isMood);
  };

  const handleSaveEditGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !editGenreName.trim()) return;

    setIsSavingEditGenre(true);
    try {
      const res = await fetch(`/api/admin/genres/${editingGenre.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGenreName.trim(),
          slug: editGenreSlug.trim() || undefined,
          isMood: editGenreIsMood,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ویرایش سبک");

      setGenres((prev) =>
        prev.map((g) =>
          g.id === editingGenre.id
            ? {
                ...g,
                name: editGenreName.trim(),
                slug: editGenreSlug.trim() || g.slug,
                isMood: editGenreIsMood,
              }
            : g
        )
      );
      setEditingGenre(null);
      router.refresh();
      alert("سبک با موفقیت به‌روزرسانی شد.");
    } catch (err: any) {
      alert(err.message || "خطا در ویرایش سبک");
    } finally {
      setIsSavingEditGenre(false);
    }
  };

  // 4. Remove a single song from genre
  const handleRemoveSongFromGenre = async (songId: string) => {
    if (!selectedGenre) return;
    if (!confirm("آیا از حذف این آهنگ از این سبک اطمینان دارید؟")) return;

    setLoadingAction(songId);
    try {
      const res = await fetch(
        `/api/admin/genres/${selectedGenre.id}/songs?songId=${songId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در حذف");

      // Update state locally
      setGenres((prev) =>
        prev.map((g) => {
          if (g.id === selectedGenre.id) {
            return {
              ...g,
              songCount: Math.max(0, g.songCount - 1),
              songs: g.songs.filter((s) => s.id !== songId),
            };
          }
          return g;
        })
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "خطا در حذف");
    } finally {
      setLoadingAction(null);
    }
  };

  // 5. Add a song to selected genre
  const handleAddSongToGenre = async (song: AllSongItem) => {
    if (!selectedGenre) return;

    setLoadingAction(song.id);
    try {
      const res = await fetch(`/api/admin/genres/${selectedGenre.id}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در افزودن");

      // Update state locally
      setGenres((prev) =>
        prev.map((g) => {
          if (g.id === selectedGenre.id) {
            const alreadyIn = g.songs.some((s) => s.id === song.id);
            if (alreadyIn) return g;
            return {
              ...g,
              songCount: g.songCount + 1,
              songs: [
                {
                  id: song.id,
                  title: song.title,
                  coverImage: song.coverImage,
                  artist: { name: song.artistName },
                  playCount: 0,
                  downloadCount: 0,
                },
                ...g.songs,
              ],
            };
          }
          return g;
        })
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || "خطا در افزودن");
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredCurrentSongs = (selectedGenre?.songs || []).filter(
    (s) =>
      s.title.toLowerCase().includes(searchSong.toLowerCase()) ||
      (s.artist?.name || "").toLowerCase().includes(searchSong.toLowerCase())
  );

  const filteredModalSongs = allSongs.filter(
    (s) =>
      s.title.toLowerCase().includes(modalSearch.toLowerCase()) ||
      s.artistName.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-card p-6 rounded-3xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand" />
            <h1 className="text-xl sm:text-2xl font-black text-content-primary">
              مدیریت سبک‌ها و دسته‌بندی‌های موسیقی
            </h1>
          </div>
          <p className="text-xs text-content-muted mt-1.5">
            ایجاد سبک جدید، مشاهده آهنگ‌های موجود در هر سبک و افزودن آهنگ به سبک‌های دلخواه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create New Genre Button */}
          <button
            onClick={() => setIsCreateGenreModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ ایجاد سبک جدید</span>
          </button>

          {/* Add Song to Current Genre Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>افزودن آهنگ به این سبک</span>
          </button>

          {/* Upload New Song Button */}
          <Link
            href="/admin/songs/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-content-secondary font-bold text-xs border border-surface-border transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>آپلود آهنگ جدید</span>
          </Link>
        </div>
      </div>

      {/* Genre Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => {
          const isSelected = g.id === selectedGenreId;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGenreId(g.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? "bg-brand text-white border-brand shadow-lg shadow-brand/25 scale-102"
                  : "bg-surface-card hover:bg-surface-100 text-content-secondary border-surface-border"
              }`}
            >
              <span>{g.name}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-surface-100 text-content-muted"
                }`}
              >
                {toPersianDigits(g.songCount)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Songs in Selected Genre */}
      {selectedGenre && (
        <div className="bg-surface-card rounded-3xl border border-surface-border p-5 sm:p-6 space-y-4">
          {/* Subheader and controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-surface-border">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-content-primary">
                  آهنگ‌های سبک «{selectedGenre.name}»
                </span>
                <span className="text-xs text-content-muted">
                  ({toPersianDigits(filteredCurrentSongs.length)} قطعه)
                </span>
              </div>

              {/* Genre management actions */}
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={() => handleStartEditGenre(selectedGenre)}
                  className="p-1.5 rounded-lg text-content-muted hover:text-brand hover:bg-brand/10 text-xs font-bold transition-colors flex items-center gap-1"
                  title="ویرایش نام و مشخصات این سبک"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>ویرایش سبک</span>
                </button>
                <button
                  onClick={() => handleDeleteGenre(selectedGenre.id, selectedGenre.name)}
                  disabled={loadingAction === selectedGenre.id}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold transition-colors flex items-center gap-1"
                  title="حذف کامل این سبک"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف سبک</span>
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-content-muted absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در این سبک..."
                value={searchSong}
                onChange={(e) => setSearchSong(e.target.value)}
                className="w-full bg-surface-50 border border-surface-border rounded-xl pr-9 pl-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Table / List of Songs */}
          {filteredCurrentSongs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Music className="w-10 h-10 text-content-muted mx-auto opacity-50" />
              <p className="text-sm font-bold text-content-muted">
                هنوز آهنگی در سبک «{selectedGenre.name}» قرار نگرفته است.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand/10 text-brand font-bold text-xs hover:bg-brand/20 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>انتخاب و افزودن آهنگ از آرشیو</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-surface-border text-content-muted font-bold">
                    <th className="pb-3 pr-3">#</th>
                    <th className="pb-3">عنوان آهنگ و خواننده</th>
                    <th className="pb-3">آلبوم</th>
                    <th className="pb-3 text-center">پخش / دانلود</th>
                    <th className="pb-3 text-left pl-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredCurrentSongs.map((song, idx) => (
                    <tr
                      key={song.id}
                      className="hover:bg-surface-50 transition-colors"
                    >
                      <td className="py-3 pr-3 text-content-muted font-mono font-bold w-10">
                        {toPersianDigits(idx + 1)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface-100 shrink-0 border border-surface-border">
                            {song.coverImage ? (
                              <img
                                src={song.coverImage}
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand font-bold text-xs">
                                🎵
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-content-primary block text-sm">
                              {song.title}
                            </span>
                            <span className="text-content-muted text-xs">
                              {song.artist?.name || "بیتا"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-content-muted">
                        {song.album?.title || "تک‌آهنگ"}
                      </td>
                      <td className="py-3 text-center text-content-muted font-mono">
                        {toPersianDigits(song.playCount || 0)} /{" "}
                        {toPersianDigits(song.downloadCount || 0)}
                      </td>
                      <td className="py-3 text-left pl-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/song/${song.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
                            title="مشاهده صفحه آهنگ"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveSongFromGenre(song.id)}
                            disabled={loadingAction === song.id}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="حذف از این سبک"
                          >
                            {loadingAction === song.id ? (
                              <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Create New Genre */}
      {isCreateGenreModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-3xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-black text-content-primary">
                  ایجاد سبک / دسته‌بندی جدید
                </h3>
              </div>
              <button
                onClick={() => setIsCreateGenreModalOpen(false)}
                className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGenre} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  نام سبک (فارسی) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جاز، ریمیکس، کودکانه..."
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  شناسه انگلیسی (اسلاگ برای آدرس اینترنتی)
                </label>
                <input
                  type="text"
                  placeholder="مثال: jazz, remix, kids (اختیاری)"
                  value={newGenreSlug}
                  onChange={(e) => setNewGenreSlug(e.target.value)}
                  dir="ltr"
                  className="w-full bg-surface-50 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-content-primary focus:outline-none focus:border-brand font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  نوع دسته‌بندی
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGenreIsMood(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !newGenreIsMood
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-surface-50 border-surface-border text-content-secondary"
                    }`}
                  >
                    سبک اصلی موسیقی
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGenreIsMood(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newGenreIsMood
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-surface-50 border-surface-border text-content-secondary"
                    }`}
                  >
                    حال‌وهوا و موقعیت (مود)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  توضیحات کوتاه (اختیاری)
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیحات درباره این سبک موسیقی..."
                  value={newGenreDescription}
                  onChange={(e) => setNewGenreDescription(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-border rounded-xl px-3.5 py-2 text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsCreateGenreModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-content-secondary text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGenre}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreatingGenre ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FolderPlus className="w-4 h-4" />
                  )}
                  <span>ثبت و ذخیره سبک</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Existing Genre */}
      {editingGenre && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-md rounded-3xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-brand" />
                <h3 className="text-base font-black text-content-primary">
                  ویرایش مشخصات سبک
                </h3>
              </div>
              <button
                onClick={() => setEditingGenre(null)}
                className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGenre} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  نام سبک <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editGenreName}
                  onChange={(e) => setEditGenreName(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  شناسه انگلیسی (اسلاگ)
                </label>
                <input
                  type="text"
                  value={editGenreSlug}
                  onChange={(e) => setEditGenreSlug(e.target.value)}
                  dir="ltr"
                  className="w-full bg-surface-50 border border-surface-border rounded-xl px-3.5 py-2.5 text-xs text-content-primary focus:outline-none focus:border-brand font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-secondary mb-1.5">
                  نوع دسته‌بندی
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditGenreIsMood(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !editGenreIsMood
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-surface-50 border-surface-border text-content-secondary"
                    }`}
                  >
                    سبک اصلی
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGenreIsMood(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      editGenreIsMood
                        ? "bg-brand text-white border-brand shadow-sm"
                        : "bg-surface-50 border-surface-border text-content-secondary"
                    }`}
                  >
                    حال‌وهوا (مود)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setEditingGenre(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-content-secondary text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditGenre}
                  className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-md shadow-brand/30 hover:opacity-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingEditGenre ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Select Song from Library to Add to Current Genre */}
      {isAddModalOpen && selectedGenre && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-xl rounded-3xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <div>
                <h3 className="text-base font-black text-content-primary">
                  افزودن آهنگ به سبک «{selectedGenre.name}»
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  یک یا چند آهنگ را برای اضافه کردن به این سبک انتخاب کنید
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-4 border-b border-surface-border">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-content-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی نام آهنگ یا خواننده در کل سایت..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-border rounded-xl pr-10 pl-3 py-2.5 text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Modal Song List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredModalSongs.length === 0 ? (
                <div className="text-center py-10 text-content-muted text-xs">
                  هیچ آهنگی یافت نشد.
                </div>
              ) : (
                filteredModalSongs.map((s) => {
                  const isAlreadyInGenre = selectedGenre.songs.some(
                    (item) => item.id === s.id
                  );
                  const isProcessing = loadingAction === s.id;

                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-50 border border-surface-border hover:border-brand/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-100 shrink-0">
                          {s.coverImage ? (
                            <img
                              src={s.coverImage}
                              alt={s.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand text-xs font-bold">
                              🎵
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-content-primary truncate">
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-content-muted truncate">
                            {s.artistName}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isAlreadyInGenre ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            <span>در این سبک هست</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddSongToGenre(s)}
                            disabled={isProcessing}
                            className="flex items-center gap-1 text-xs font-bold text-white bg-brand hover:opacity-90 px-3 py-1.5 rounded-xl shadow-md shadow-brand/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <PlusCircle className="w-3.5 h-3.5" />
                            )}
                            <span>افزودن</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-50 border-t border-surface-border flex items-center justify-between">
              <span className="text-xs text-content-muted">
                تعداد کل آهنگ‌های آرشیو: {toPersianDigits(allSongs.length)}
              </span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-100 text-content-primary text-xs font-bold border border-surface-border transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
