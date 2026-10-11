"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  ListMusic,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  FolderPlus,
  Music,
  Check,
  Download,
  Share2,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  X,
  LogIn,
} from "lucide-react";
import { SongItem } from "@/types";
import { usePlayer } from "@/components/player/PlayerContext";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDuration, formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface PlaylistRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage?: string | null;
  createdAt: string;
  songs: {
    id: string;
    orderIndex: number;
    song: SongItem;
  }[];
}

interface FavoritesClientProps {
  initialFavoriteSongs: SongItem[];
  initialPlaylists: any[];
  isLoggedIn: boolean;
  userDisplayName: string;
}

export function FavoritesClient({
  initialFavoriteSongs,
  initialPlaylists,
  isLoggedIn,
  userDisplayName,
}: FavoritesClientProps) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { toggleFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState<"favorites" | "playlists">("favorites");
  const [favoriteSongs, setFavoriteSongs] = useState<SongItem[]>(initialFavoriteSongs);
  const [playlists, setPlaylists] = useState<PlaylistRow[]>(initialPlaylists);

  // Sorting state for favorites
  const [sortBy, setSortBy] = useState<"custom" | "newest" | "oldest" | "title" | "artist">("custom");

  // Selected Playlist to view / edit songs inside
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Modal for creating playlist
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmittingPlaylist, setIsSubmittingPlaylist] = useState(false);

  // Modal for adding a song to a playlist
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState<SongItem | null>(null);

  // Notification message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load custom order from localStorage on mount
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("ahangam_favorites_custom_order");
      if (savedOrder && favoriteSongs.length > 0) {
        const orderIds: string[] = JSON.parse(savedOrder);
        const map = new Map(favoriteSongs.map((s) => [s.id, s]));
        const ordered: SongItem[] = [];
        orderIds.forEach((id) => {
          const s = map.get(id);
          if (s) {
            ordered.push(s);
            map.delete(id);
          }
        });
        // Append any new songs not yet in saved order
        map.forEach((s) => ordered.push(s));
        setFavoriteSongs(ordered);
      }
    } catch {}
  }, []);

  // Save custom order to localStorage whenever favoriteSongs changes
  const saveCustomOrder = (newList: SongItem[]) => {
    setFavoriteSongs(newList);
    setSortBy("custom");
    try {
      const ids = newList.map((s) => s.id);
      localStorage.setItem("ahangam_favorites_custom_order", JSON.stringify(ids));
    } catch {}
  };

  // Reordering functions for Favorite Songs ("بتواند آنها را به ترتیب بچیند")
  const moveFavoriteUp = (index: number) => {
    if (index === 0) return;
    const next = [...favoriteSongs];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    saveCustomOrder(next);
    showToast("ترتیب قطعه در لیست به بالا تغییر یافت.");
  };

  const moveFavoriteDown = (index: number) => {
    if (index === favoriteSongs.length - 1) return;
    const next = [...favoriteSongs];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    saveCustomOrder(next);
    showToast("ترتیب قطعه در لیست به پایین تغییر یافت.");
  };

  const handleRemoveFavorite = async (songId: string) => {
    await toggleFavorite(songId);
    const updated = favoriteSongs.filter((s) => s.id !== songId);
    saveCustomOrder(updated);
    showToast("قطعه از لیست نشان‌شده‌ها برداشته شد.");
  };

  // Sorting handlers
  const handleSortChange = (type: "custom" | "newest" | "oldest" | "title" | "artist") => {
    setSortBy(type);
    let sorted = [...favoriteSongs];
    if (type === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "fa"));
    } else if (type === "artist") {
      sorted.sort((a, b) =>
        (a.artist?.name || "").localeCompare(b.artist?.name || "", "fa")
      );
    } else if (type === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (type === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    setFavoriteSongs(sorted);
  };

  // Play All handler
  const handlePlayAllFavorites = () => {
    if (favoriteSongs.length === 0) return;
    playSong(favoriteSongs[0], favoriteSongs);
    showToast(`پخش ${toPersianDigits(favoriteSongs.length)} قطعه با کیفیت بالا آغاز شد.`);
  };

  // Create Playlist handler ("پلی لیست درست کند")
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmittingPlaylist(true);
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.playlist) {
        const created: PlaylistRow = {
          ...data.playlist,
          songs: [],
        };
        setPlaylists([created, ...playlists]);
        setNewTitle("");
        setNewDesc("");
        setIsCreateModalOpen(false);
        showToast(`پلی‌لیست «${created.title}» با موفقیت ایجاد شد.`);
      } else {
        alert(data.message || "خطا در ساخت پلی‌لیست.");
      }
    } catch {
      alert("خطای اتصال به سرور.");
    } finally {
      setIsSubmittingPlaylist(false);
    }
  };

  // Add song to playlist
  const handleAddSongToPlaylist = async (playlistId: string) => {
    if (!songToAddToPlaylist) return;

    try {
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: songToAddToPlaylist.id }),
      });

      if (res.ok) {
        // Update local state
        setPlaylists((prev) =>
          prev.map((pl) => {
            if (pl.id === playlistId) {
              const alreadyHas = pl.songs.some((s) => s.song.id === songToAddToPlaylist.id);
              if (alreadyHas) return pl;
              return {
                ...pl,
                songs: [
                  ...pl.songs,
                  {
                    id: `temp-${Date.now()}`,
                    orderIndex: pl.songs.length,
                    song: songToAddToPlaylist,
                  },
                ],
              };
            }
            return pl;
          })
        );
        showToast(`قطعه «${songToAddToPlaylist.title}» به پلی‌لیست اضافه شد.`);
        setSongToAddToPlaylist(null);
      } else {
        const data = await res.json();
        alert(data.message || "خطا در افزودن آهنگ به پلی‌لیست.");
      }
    } catch {
      alert("خطای ارتباط با سرور.");
    }
  };

  // Delete Playlist
  const handleDeletePlaylist = async (playlistId: string, title: string) => {
    if (!confirm(`آیا از حذف پلی‌لیست «${title}» اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPlaylists(playlists.filter((p) => p.id !== playlistId));
        if (selectedPlaylistId === playlistId) {
          setSelectedPlaylistId(null);
        }
        showToast("پلی‌لیست با موفقیت حذف شد.");
      }
    } catch {
      alert("خطا در حذف پلی‌لیست.");
    }
  };

  // Reorder Songs Inside Playlist
  const movePlaylistSong = async (playlistId: string, index: number, direction: "up" | "down") => {
    const pl = playlists.find((p) => p.id === playlistId);
    if (!pl) return;

    const songs = [...pl.songs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= songs.length) return;

    const temp = songs[targetIndex];
    songs[targetIndex] = songs[index];
    songs[index] = temp;

    // Optimistic update
    setPlaylists((prev) =>
      prev.map((item) => (item.id === playlistId ? { ...item, songs } : item))
    );

    // Persist to server
    try {
      const songIds = songs.map((s) => s.song.id);
      await fetch(`/api/playlists/${playlistId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songIds }),
      });
    } catch {}
  };

  // Remove song from playlist
  const handleRemoveSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });

      if (res.ok) {
        setPlaylists((prev) =>
          prev.map((pl) => {
            if (pl.id === playlistId) {
              return {
                ...pl,
                songs: pl.songs.filter((s) => s.song.id !== songId),
              };
            }
            return pl;
          })
        );
        showToast("قطعه از پلی‌لیست حذف شد.");
      }
    } catch {
      alert("خطا در حذف آهنگ از پلی‌لیست.");
    }
  };

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-surface-card border border-brand/40 shadow-2xl text-xs font-bold text-content-primary flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-brand" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand/15 via-surface-card to-surface-card border border-surface-border shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بخش اختصاصی کاربر: {userDisplayName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
            علاقه‌مندی‌ها و پلی‌لیست‌های من
          </h1>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            مدیریت کامل آهنگ‌های نشان‌شده، چیدمان و ترتیب دلخواه قطعات، و ساخت پلی‌لیست‌های اختصاصی
          </p>
        </div>

        {!isLoggedIn && (
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand text-white font-bold text-xs shadow-lg shadow-brand/25 hover:opacity-95 transition-all self-start md:self-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>ورود برای همگام‌سازی ابری</span>
          </Link>
        )}
      </div>

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-1">
        <button
          onClick={() => {
            setActiveTab("favorites");
            setSelectedPlaylistId(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "favorites"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-card"
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === "favorites" ? "fill-white" : "text-red-500"}`} />
          <span>آهنگ‌های مورد علاقه ({toPersianDigits(favoriteSongs.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab("playlists")}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer ${
            activeTab === "playlists"
              ? "bg-brand text-white shadow-lg shadow-brand/20"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-card"
          }`}
        >
          <ListMusic className="w-4 h-4" />
          <span>پلی‌لیست‌های من ({toPersianDigits(playlists.length)})</span>
        </button>
      </div>

      {/* TAB 1: FAVORITE SONGS */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card border border-surface-border">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayAllFavorites}
                disabled={favoriteSongs.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand/90 active:scale-95 text-white font-bold text-xs shadow-md shadow-brand/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>پخش تمام آهنگ‌ها</span>
              </button>

              <span className="text-xs text-content-muted">
                {toPersianDigits(favoriteSongs.length)} قطعه ذخیره‌شده
              </span>
            </div>

            {/* Reorder and Sort Options */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-content-muted" />
              <span className="text-xs font-bold text-content-secondary">ترتیب نمایش:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="p-2 rounded-xl bg-surface-50 border border-surface-border text-xs font-bold text-content-primary focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="custom">ترتیب دلخواه من (چیدمان دستی)</option>
                <option value="newest">جدیدترین‌های اضافه شده</option>
                <option value="oldest">قدیمی‌ترین‌ها</option>
                <option value="title">نام ترانه (الف تا ی)</option>
                <option value="artist">نام هنرمند و خواننده</option>
              </select>
            </div>
          </div>

          {/* Songs List with Up / Down Manual Reorder */}
          {favoriteSongs.length > 0 ? (
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] font-bold text-content-muted border-b border-surface-border/50">
                <span className="col-span-1 text-center">ترتیب</span>
                <span className="col-span-6">اطلاعات ترانه</span>
                <span className="col-span-2 text-center">مدت زمان</span>
                <span className="col-span-3 text-left">چیدمان و عملیات</span>
              </div>

              {favoriteSongs.map((song, index) => {
                const isThisPlaying = currentSong?.id === song.id && isPlaying;
                return (
                  <div
                    key={song.id}
                    className="flex flex-col sm:grid sm:grid-cols-12 gap-3 items-center p-3 sm:p-3.5 rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border transition-all group shadow-sm hover:shadow-md"
                  >
                    {/* Index & Reorder Arrows */}
                    <div className="w-full sm:w-auto sm:col-span-1 flex items-center justify-between sm:justify-center gap-1.5 shrink-0">
                      <span className="w-6 text-center text-xs font-mono font-bold text-content-muted">
                        {toPersianDigits(index + 1)}
                      </span>

                      {/* Up and Down Buttons for Custom Ordering */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveFavoriteUp(index)}
                          disabled={index === 0}
                          title="انتقال به ردیف بالاتر (چیدمان به بالا)"
                          aria-label="انتقال به بالا"
                          className="p-1 rounded-lg hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveFavoriteDown(index)}
                          disabled={index === favoriteSongs.length - 1}
                          title="انتقال به ردیف پایین‌تر (چیدمان به پایین)"
                          aria-label="انتقال به پایین"
                          className="p-1 rounded-lg hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Song Cover & Info */}
                    <div className="w-full sm:col-span-6 flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-100 shrink-0 shadow-sm">
                        {song.coverImage ? (
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                            آهنگام
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (currentSong?.id === song.id) togglePlay();
                            else playSong(song, favoriteSongs);
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-white text-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white text-white mr-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/song/${song.slug || song.id}`}
                          className="text-xs sm:text-sm font-bold text-content-primary hover:text-brand transition-colors block truncate"
                        >
                          {song.title}
                        </Link>
                        <Link
                          href={`/artist/${song.artist?.slug || song.artist?.id || ""}`}
                          className="text-[11px] text-content-muted hover:text-content-secondary transition-colors block truncate"
                        >
                          {song.artist?.name || "بیتا"}
                        </Link>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden sm:block sm:col-span-2 text-center text-xs font-mono text-content-muted">
                      {formatDuration(song.duration)}
                    </div>

                    {/* Actions */}
                    <div className="w-full sm:w-auto sm:col-span-3 flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-0 border-surface-border/40">
                      {/* Add to Playlist button */}
                      <button
                        onClick={() => setSongToAddToPlaylist(song)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface-50 hover:bg-brand/10 hover:text-brand text-content-secondary text-xs font-bold transition-colors flex items-center gap-1 border border-surface-border/60 cursor-pointer"
                        title="افزودن این ترانه به یکی از پلی‌لیست‌های من"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>پلی‌لیست</span>
                      </button>

                      {/* Download Direct */}
                      <a
                        href={`/api/songs/${song.id}/download?quality=320`}
                        download
                        className="p-1.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-muted hover:text-content-primary transition-colors border border-surface-border/60"
                        title="دانلود مستقیم آهنگ"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Remove Favorite */}
                      <button
                        onClick={() => handleRemoveFavorite(song.id)}
                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20 cursor-pointer"
                        title="حذف از آهنگ‌های مورد علاقه"
                        aria-label="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                <Heart className="w-8 h-8 fill-red-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-content-primary">
                  هنوز آهنگی در لیست علاقه‌مندی‌های شما نیست
                </h3>
                <p className="text-xs text-content-muted max-w-md mx-auto leading-relaxed">
                  با زدن آیکون قلب در کنار هر قطعه موسیقی در صفحه اصلی یا آرشیو، آهنگ‌ها بلافاصله به این بخش اضافه می‌شوند و می‌توانید چیدمان و ترتیب آن‌ها را تنظیم کنید.
                </p>
              </div>
              <Link
                href="/songs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand text-white text-xs font-bold shadow-md hover:bg-brand/90 transition-all"
              >
                <span>مرور و شنیدن آرشیو آهنگ‌ها</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLAYLISTS ("پلی لیست درست کند") */}
      {activeTab === "playlists" && (
        <div className="space-y-6">
          {/* Create Playlist Button & Header */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm">
            <div>
              <h2 className="text-base font-bold text-content-primary">پلی‌لیست‌های اختصاصی من</h2>
              <p className="text-xs text-content-muted mt-0.5">
                لیست‌های پخش سفارشی خود را بسازید و آهنگ‌ها را با ترتیب دلخواه درون آن‌ها بچینید
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-md shadow-brand/25 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>ساخت پلی‌لیست جدید</span>
            </button>
          </div>

          {/* List of Playlists */}
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((pl) => {
                const isSelected = selectedPlaylistId === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(isSelected ? null : pl.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "bg-brand/10 border-brand shadow-md"
                        : "bg-surface-card hover:bg-surface-50 border-surface-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-brand/15 text-brand flex items-center justify-center font-bold">
                        <ListMusic className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(pl.id, pl.title);
                          }}
                          className="p-1.5 rounded-lg text-content-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="حذف پلی‌لیست"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-content-primary truncate mb-1">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-content-muted line-clamp-2 min-h-[32px]">
                      {pl.description || "پلی‌لیست بدون توضیحات"}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-surface-border/50 text-xs font-bold text-brand">
                      <span>{toPersianDigits(pl.songs.length)} ترانه</span>
                      <span className="text-[11px] text-content-muted">
                        {isSelected ? "در حال مشاهده آهنگ‌ها ▲" : "مشاهده و چیدمان ترانه‌ها ▼"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
                <ListMusic className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-content-primary">
                  هنوز پلی‌لیستی نساخته‌اید!
                </h3>
                <p className="text-xs text-content-muted max-w-sm mx-auto">
                  با کلیک روی دکمه «ساخت پلی‌لیست جدید» می‌توانید آلبوم‌های شخصی خود را بسازید.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-brand text-white font-bold text-xs shadow-md cursor-pointer"
              >
                ایجاد اولین پلی‌لیست
              </button>
            </div>
          )}

          {/* Detailed View of Selected Playlist Songs with Ordering */}
          {selectedPlaylist && (
            <div className="p-6 rounded-3xl bg-surface-card border-2 border-brand/40 shadow-xl space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
                <div>
                  <h3 className="text-lg font-black text-content-primary flex items-center gap-2">
                    <ListMusic className="w-5 h-5 text-brand" />
                    <span>آهنگ‌های پلی‌لیست: {selectedPlaylist.title}</span>
                  </h3>
                  <p className="text-xs text-content-muted mt-1">
                    ترتیب ترانه‌ها را با کلیک روی فلش‌های بالا و پایین بچینید.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPlaylist.songs.length > 0 && (
                    <button
                      onClick={() => {
                        const playlistQueue = selectedPlaylist.songs.map((s) => s.song);
                        playSong(playlistQueue[0], playlistQueue);
                        showToast(`پخش پلی‌لیست «${selectedPlaylist.title}» آغاز شد.`);
                      }}
                      className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>پخش کل این پلی‌لیست</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPlaylistId(null)}
                    className="p-2 rounded-xl hover:bg-surface-50 text-content-muted hover:text-content-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedPlaylist.songs.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedPlaylist.songs.map((item, idx) => (
                    <div
                      key={item.song.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-border gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Order & Buttons */}
                        <div className="flex items-center gap-1">
                          <span className="w-5 text-xs font-mono font-bold text-content-muted text-center">
                            {toPersianDigits(idx + 1)}
                          </span>
                          <button
                            onClick={() => movePlaylistSong(selectedPlaylist.id, idx, "up")}
                            disabled={idx === 0}
                            className="p-1 hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                            title="انتقال ترانه به بالا"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => movePlaylistSong(selectedPlaylist.id, idx, "down")}
                            disabled={idx === selectedPlaylist.songs.length - 1}
                            className="p-1 hover:bg-brand/10 text-content-muted hover:text-brand disabled:opacity-20 transition-colors cursor-pointer"
                            title="انتقال ترانه به پایین"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Song Cover */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 shrink-0">
                          {item.song.coverImage ? (
                            <img
                              src={item.song.coverImage}
                              alt={item.song.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand/10 flex items-center justify-center text-[10px] text-brand font-bold">
                              آهنگام
                            </div>
                          )}
                        </div>

                        {/* Song Title & Artist */}
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-content-primary block truncate">
                            {item.song.title}
                          </span>
                          <span className="text-[11px] text-content-muted block truncate">
                            {item.song.artist?.name || "بیتا"}
                          </span>
                        </div>
                      </div>

                      {/* Play & Delete from Playlist */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const queue = selectedPlaylist.songs.map((s) => s.song);
                            playSong(item.song, queue);
                          }}
                          className="p-1.5 rounded-lg bg-surface-card hover:bg-brand hover:text-white text-content-secondary transition-all"
                          title="پخش"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveSongFromPlaylist(selectedPlaylist.id, item.song.id)
                          }
                          className="p-1.5 rounded-lg text-content-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="حذف از این پلی‌لیست"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-content-muted space-y-2">
                  <p>این پلی‌لیست خالی است.</p>
                  <p>در تب «آهنگ‌های مورد علاقه» با زدن دکمه «+ پلی‌لیست» می‌توانید به راحتی آهنگ اضافه کنید.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create New Playlist */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-base font-black text-content-primary flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-brand" />
                <span>ساخت پلی‌لیست جدید</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1.5">
                  عنوان پلی‌لیست *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثلاً: آهنگ‌های پاپ آرامش‌بخش، ترانه‌های جاده..."
                  className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-content-primary mb-1.5">
                  توضیحات اختیاری
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="توضیحی درباره سبک یا حال‌وهوای این پلی‌لیست..."
                  className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPlaylist || !newTitle.trim()}
                  className="flex-1 py-3 rounded-xl bg-brand text-white font-bold text-xs shadow-md shadow-brand/25 hover:bg-brand/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmittingPlaylist ? "در حال ایجاد..." : "ایجاد پلی‌لیست"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-secondary font-bold text-xs transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Song to Playlist Picker */}
      {songToAddToPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="text-sm font-black text-content-primary flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-brand" />
                <span>افزودن «{songToAddToPlaylist.title}» به پلی‌لیست</span>
              </h3>
              <button
                onClick={() => setSongToAddToPlaylist(null)}
                className="p-1 rounded-lg text-content-muted hover:text-content-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {playlists.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-content-muted mb-2">
                  پلی‌لیست مورد نظرتان را برای اضافه کردن این قطعه انتخاب کنید:
                </p>
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddSongToPlaylist(pl.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-brand/10 hover:border-brand/40 border border-surface-border text-right transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ListMusic className="w-4 h-4 text-brand" />
                      <span className="text-xs font-bold text-content-primary group-hover:text-brand">
                        {pl.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-content-muted">
                      {toPersianDigits(pl.songs.length)} ترانه
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-content-muted space-y-3">
                <p>شما هنوز پلی‌لیستی ایجاد نکرده‌اید.</p>
                <button
                  onClick={() => {
                    setSongToAddToPlaylist(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs"
                >
                  ابتدا یک پلی‌لیست بسازید
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
