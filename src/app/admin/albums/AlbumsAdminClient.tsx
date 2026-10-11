"use client";

import React, { useState } from "react";
import {
  Disc3,
  PlusCircle,
  Trash2,
  Edit3,
  X,
  Upload,
  Check,
  Music,
  ExternalLink,
  Calendar,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/utils";

interface SongOption {
  id: string;
  title: string;
  coverImage: string | null;
  duration: number;
  albumId?: string | null;
  artist: { name: string };
}

interface ArtistOption {
  id: string;
  name: string;
}

interface AlbumData {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artist: ArtistOption;
  coverImage: string | null;
  releaseYear: number | null;
  description: string | null;
  isFeatured: boolean;
  songs: { id: string; title: string; duration: number; coverImage: string | null }[];
}

interface AlbumsAdminClientProps {
  initialAlbums: AlbumData[];
  allArtists: ArtistOption[];
  allSongs: SongOption[];
}

export function AlbumsAdminClient({
  initialAlbums,
  allArtists,
  allSongs: initialSongs,
}: AlbumsAdminClientProps) {
  const [albums, setAlbums] = useState<AlbumData[]>(initialAlbums);
  const [songs, setSongs] = useState<SongOption[]>(initialSongs);
  const [searchQuery, setSearchQuery] = useState("");

  // Quick upload song in album form state
  const [uploadSongTitle, setUploadSongTitle] = useState("");
  const [uploadSongUrl, setUploadSongUrl] = useState("");
  const [uploadSongDuration, setUploadSongDuration] = useState(0);
  const [isUploadingSongAudio, setIsUploadingSongAudio] = useState(false);
  const [isCreatingSong, setIsCreatingSong] = useState(false);
  const [isQuickSongOpen, setIsQuickSongOpen] = useState(false);

  // Create form state
  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState(allArtists[0]?.id || "");
  const [coverImage, setCoverImage] = useState("");
  const [releaseYear, setReleaseYear] = useState<string>("1403");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Edit modal state
  const [editingAlbum, setEditingAlbum] = useState<AlbumData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistId, setEditArtistId] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editReleaseYear, setEditReleaseYear] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editSelectedSongIds, setEditSelectedSongIds] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingEditCover, setIsUploadingEditCover] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload Cover Helper
  const handleCoverUpload = async (file: File, isEdit: boolean) => {
    try {
      if (isEdit) setIsUploadingEditCover(true);
      else setIsUploadingCover(true);

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isEdit) setEditCoverImage(data.url);
        else setCoverImage(data.url);
      } else {
        alert(data.message || "خطا در آپلود تصویر کاور.");
      }
    } catch {
      alert("خطای سرور هنگام آپلود کاور.");
    } finally {
      if (isEdit) setIsUploadingEditCover(false);
      else setIsUploadingCover(false);
    }
  };

  // Quick upload audio file for album
  const handleSelectSongAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (!uploadSongTitle) {
      setUploadSongTitle(baseName);
    }

    try {
      setIsUploadingSongAudio(true);
      const audioObj = new Audio(URL.createObjectURL(file));
      audioObj.onloadedmetadata = () => {
        if (audioObj.duration && !isNaN(audioObj.duration)) {
          setUploadSongDuration(Math.round(audioObj.duration));
        }
      };

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setUploadSongUrl(data.url);
      } else {
        alert(data.message || "خطا در آپلود فایل صوتی.");
      }
    } catch {
      alert("خطای اتصال در آپلود فایل صوتی.");
    } finally {
      setIsUploadingSongAudio(false);
    }
  };

  // Submit quick song creation
  const handleCreateQuickSong = async (targetAlbumId?: string) => {
    if (!uploadSongTitle.trim() || !uploadSongUrl) {
      alert("لطفاً عنوان آهنگ را وارد کرده و فایل صوتی را انتخاب کنید.");
      return;
    }

    const currentArtistId = targetAlbumId
      ? editArtistId || allArtists[0]?.id
      : artistId || allArtists[0]?.id;

    const currentCover = targetAlbumId ? editCoverImage : coverImage;

    try {
      setIsCreatingSong(true);
      const res = await fetch("/api/admin/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadSongTitle.trim(),
          artistId: currentArtistId,
          albumId: targetAlbumId || null,
          duration: uploadSongDuration,
          coverImage: currentCover || null,
          status: "PUBLISHED",
          qualities: [
            {
              quality: "320",
              fileUrl: uploadSongUrl,
              isDefault: true,
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.song) {
        const newSongItem: SongOption = {
          id: data.song.id,
          title: data.song.title,
          coverImage: data.song.coverImage,
          duration: data.song.duration,
          albumId: targetAlbumId || null,
          artist: {
            name:
              allArtists.find((a) => a.id === currentArtistId)?.name || "بیتا",
          },
        };

        setSongs((prev) => [newSongItem, ...prev]);

        // Auto select this song
        if (targetAlbumId) {
          setEditSelectedSongIds((prev) => [...prev, data.song.id]);
        } else {
          setSelectedSongIds((prev) => [...prev, data.song.id]);
        }

        setUploadSongTitle("");
        setUploadSongUrl("");
        setUploadSongDuration(0);
        setIsQuickSongOpen(false);
        alert("آهنگ با موفقیت آپلود و به آلبوم متصل شد!");
      } else {
        alert(data.message || "خطا در ذخیره آهنگ.");
      }
    } catch {
      alert("خطای سرور در ایجاد آهنگ.");
    } finally {
      setIsCreatingSong(false);
    }
  };

  // Create Album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("لطفاً عنوان آلبوم را وارد کنید.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artistId: artistId || allArtists[0]?.id,
          coverImage: coverImage.trim() || null,
          releaseYear: releaseYear ? parseInt(releaseYear) : null,
          description: description.trim() || null,
          isFeatured,
          songIds: selectedSongIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.album) {
        setAlbums([data.album, ...albums]);
        setTitle("");
        setCoverImage("");
        setDescription("");
        setSelectedSongIds([]);
        setStatusMsg("آلبوم با موفقیت ثبت شد!");
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(data.message || "خطا در ایجاد آلبوم.");
      }
    } catch {
      alert("خطای سرور در ایجاد آلبوم.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Editing
  const startEditAlbum = (album: AlbumData) => {
    setEditingAlbum(album);
    setEditTitle(album.title);
    setEditArtistId(album.artistId);
    setEditCoverImage(album.coverImage || "");
    setEditReleaseYear(album.releaseYear ? String(album.releaseYear) : "");
    setEditDescription(album.description || "");
    setEditFeatured(album.isFeatured);
    setEditSelectedSongIds(album.songs?.map((s) => s.id) || []);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlbum || !editTitle.trim()) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/admin/albums/${editingAlbum.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          artistId: editArtistId,
          coverImage: editCoverImage.trim() || null,
          releaseYear: editReleaseYear ? parseInt(editReleaseYear) : null,
          description: editDescription.trim() || null,
          isFeatured: editFeatured,
          songIds: editSelectedSongIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.album) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === editingAlbum.id ? data.album : a))
        );
        setEditingAlbum(null);
      } else {
        alert(data.message || "خطا در به‌روزرسانی آلبوم.");
      }
    } catch {
      alert("خطای سرور هنگام ویرایش آلبوم.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Album
  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("آیا از حذف این آلبوم اطمینان دارید؟ آهنگ‌های این آلبوم حذف نخواهند شد و فقط از حالت آلبوم خارج می‌شوند.")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/albums/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlbums((prev) => prev.filter((a) => a.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "خطا در حذف آلبوم.");
      }
    } catch {
      alert("خطای سرور در حذف آلبوم.");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle song in creation form
  const toggleSongSelection = (songId: string) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  // Toggle song in edit modal
  const toggleEditSongSelection = (songId: string) => {
    setEditSelectedSongIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const filteredAlbums = albums.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-content-primary flex items-center gap-2">
            <Disc3 className="w-7 h-7 text-brand" />
            <span>مدیریت آلبوم‌ها</span>
          </h1>
          <p className="text-xs text-content-muted mt-1">
            ایجاد آلبوم جدید، ویرایش کاور و توضیحات، حذف و تعیین قطعات مربوط به هر آلبوم
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-surface-card border border-surface-border text-content-secondary">
          کل آلبوم‌ها: {toPersianDigits(albums.length)}
        </div>
      </div>

      {/* Create New Album Card */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-sm">
        <h2 className="text-base font-bold text-content-primary mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-brand" />
          <span>افزودن آلبوم جدید</span>
        </h2>

        {statusMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateAlbum} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                عنوان آلبوم *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: رگ خواب، یادگاری..."
                className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                required
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                هنرمند آلبوم *
              </label>
              <select
                value={artistId}
                onChange={(e) => setArtistId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
              >
                {allArtists.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                سال انتشار
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="مثال: 1403"
                className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Cover image upload & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                تصویر کاور آلبوم
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="آدرس اینترنتی کاور یا آپلود فایل"
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                />
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand/20">
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingCover ? "در حال آپلود..." : "آپلود"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverUpload(f, false);
                    }}
                    className="hidden"
                    disabled={isUploadingCover}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-content-primary">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-brand focus:ring-brand w-4 h-4"
                />
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>نمایش به عنوان آلبوم ویژه</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              توضیحات و متن معرفی آلبوم
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات، دست‌اندرکاران یا یادداشت معرفی آلبوم..."
              className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          {/* Song Selection & Direct Upload for Album */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-content-secondary flex items-center gap-1.5">
                <Music className="w-4 h-4 text-brand" />
                <span>تعیین و افزودن آهنگ‌های این آلبوم:</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickSongOpen(!isQuickSongOpen)}
                  className="px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isQuickSongOpen ? "بستن فرم آپلود آهنگ" : "آپلود مستقیم آهنگ برای این آلبوم"}</span>
                </button>
                <span className="text-brand font-bold text-xs">
                  {toPersianDigits(selectedSongIds.length)} آهنگ انتخاب شده
                </span>
              </div>
            </div>

            {/* Quick Upload Box */}
            {isQuickSongOpen && (
              <div className="p-4 rounded-xl bg-surface-50 border border-brand/30 space-y-3">
                <div className="text-xs font-bold text-content-primary flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brand" />
                  <span>آپلود آهنگ جدید و اتصال مستقیم به این آلبوم</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-content-muted mb-1">
                      عنوان آهنگ
                    </label>
                    <input
                      type="text"
                      value={uploadSongTitle}
                      onChange={(e) => setUploadSongTitle(e.target.value)}
                      placeholder="عنوان قطعه موسیقی..."
                      className="w-full px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-content-muted mb-1">
                      فایل صوتی MP3 (کیفیت ۳۲۰)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={uploadSongUrl}
                        onChange={(e) => setUploadSongUrl(e.target.value)}
                        placeholder="آدرس یا فایل را انتخاب کنید"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                      />
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-brand/90 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingSongAudio ? "..." : "انتخاب فایل"}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleSelectSongAudioFile}
                          className="hidden"
                          disabled={isUploadingSongAudio}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleCreateQuickSong()}
                    disabled={isCreatingSong || isUploadingSongAudio || !uploadSongUrl}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isCreatingSong ? "در حال ثبت آهنگ..." : "افزودن قطعه به آلبوم"}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-surface-50 border border-surface-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {songs.map((s) => {
                const isSelected = selectedSongIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSongSelection(s.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-right transition-all border ${
                      isSelected
                        ? "bg-brand/10 border-brand text-brand font-bold shadow-sm"
                        : "bg-surface-card border-surface-border/60 text-content-primary hover:border-surface-border"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-brand border-brand text-white"
                          : "border-surface-border bg-surface-50"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    {s.coverImage ? (
                      <img
                        src={s.coverImage}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4 text-content-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{s.title}</p>
                      <p className="text-[10px] text-content-muted truncate">{s.artist?.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? "در حال ثبت آلبوم..." : "ثبت آلبوم"}</span>
          </button>
        </form>
      </div>

      {/* Albums List Table */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-base font-bold text-content-primary flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-brand" />
            <span>فهرست آلبوم‌های ثبت‌شده ({toPersianDigits(filteredAlbums.length)})</span>
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-3 text-content-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی آلبوم یا هنرمند..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-surface-border text-content-muted">
                <th className="p-3">کاور</th>
                <th className="p-3">عنوان آلبوم</th>
                <th className="p-3">هنرمند</th>
                <th className="p-3">سال</th>
                <th className="p-3">تعداد قطعات</th>
                <th className="p-3">توضیحات</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredAlbums.map((album) => (
                <tr key={album.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 shrink-0 border border-surface-border">
                      {album.coverImage ? (
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-content-muted">
                          <Disc3 className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-content-primary">{album.title}</div>
                    <div className="text-[10px] text-content-muted font-mono">{album.slug}</div>
                  </td>
                  <td className="p-3 font-semibold text-content-secondary">
                    {album.artist?.name || "بیتا"}
                  </td>
                  <td className="p-3 font-mono text-content-muted">
                    {album.releaseYear ? toPersianDigits(album.releaseYear) : "-"}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand/10 text-brand font-bold">
                      <Music className="w-3 h-3" />
                      <span>{toPersianDigits(album.songs?.length || 0)} قطعه</span>
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-content-muted" title={album.description || ""}>
                    {album.description || <span className="opacity-40">-</span>}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/album/${album.slug || album.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-content-secondary hover:text-content-primary transition-colors"
                        title="مشاهده صفحه عمومی آلبوم"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => startEditAlbum(album)}
                        className="p-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 text-brand transition-colors"
                        title="ویرایش آلبوم و آهنگ‌های آن"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        disabled={deletingId === album.id}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-50"
                        title="حذف آلبوم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAlbums.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-content-muted">
                    هیچ آلبومی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Album Modal */}
      {editingAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="text-lg font-bold text-content-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand" />
                <span>ویرایش آلبوم: {editingAlbum.title}</span>
              </h3>
              <button
                onClick={() => setEditingAlbum(null)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    عنوان آلبوم *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    هنرمند آلبوم
                  </label>
                  <select
                    value={editArtistId}
                    onChange={(e) => setEditArtistId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                  >
                    {allArtists.map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    سال انتشار
                  </label>
                  <input
                    type="number"
                    value={editReleaseYear}
                    onChange={(e) => setEditReleaseYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-content-primary">
                    <input
                      type="checkbox"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                      className="rounded text-brand focus:ring-brand w-4 h-4"
                    />
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>آلبوم ویژه</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  تصویر کاور آلبوم
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="آدرس اینترنتی کاور یا آپلود"
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand/20">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingEditCover ? "در حال آپلود..." : "آپلود کاور"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverUpload(f, true);
                      }}
                      className="hidden"
                      disabled={isUploadingEditCover}
                    />
                  </label>
                </div>
                {editCoverImage && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-surface-border">
                    <img src={editCoverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">
                  توضیحات و متن معرفی آلبوم
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-50 border border-surface-border text-sm text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              {/* Edit Songs in Album */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-brand" />
                    <span>مدیریت آهنگ‌های این آلبوم (تیک بزنید تا اضافه شوند یا تیک بردارید تا حذف شوند):</span>
                  </span>
                  <span className="text-brand font-bold text-xs">
                    {toPersianDigits(editSelectedSongIds.length)} آهنگ انتخاب شده
                  </span>
                </label>
                <div className="max-h-52 overflow-y-auto p-3 rounded-xl bg-surface-50 border border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {songs.map((s) => {
                    const isSelected = editSelectedSongIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleEditSongSelection(s.id)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-right transition-all border ${
                          isSelected
                            ? "bg-brand/10 border-brand text-brand font-bold shadow-sm"
                            : "bg-surface-card border-surface-border/60 text-content-primary hover:border-surface-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-brand border-brand text-white"
                              : "border-surface-border bg-surface-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        {s.coverImage ? (
                          <img
                            src={s.coverImage}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0">
                            <Music className="w-4 h-4 text-content-muted" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs truncate">{s.title}</p>
                          <p className="text-[10px] text-content-muted truncate">{s.artist?.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  className="px-5 py-2.5 rounded-xl bg-surface-50 text-content-secondary hover:text-content-primary text-xs font-bold transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingEdit ? "در حال ذخیره تغییرات..." : "ذخیره تغییرات آلبوم"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
