"use client";

import React, { useState } from "react";
import { SongItem } from "@/types";
import { SongCard } from "@/components/cards/SongCard";
import { LayoutGrid, List, Filter, Search, X } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface SongsArchiveClientProps {
  initialSongs: SongItem[];
  genres: { id: string; name: string; slug: string; isMood: boolean }[];
  artists: { id: string; name: string; slug: string }[];
}

export function SongsArchiveClient({
  initialSongs,
  genres,
  artists,
}: SongsArchiveClientProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedArtist, setSelectedArtist] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "plays">("newest");

  // Client-side filtering & sorting
  const filteredSongs = initialSongs
    .filter((song) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchArtist = (song.artist?.name || "").toLowerCase().includes(q);
        const matchLyrics = (song.lyrics || "").toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchLyrics) return false;
      }
      if (selectedGenre !== "all") {
        const hasGenre = song.genres?.some((g) => g.genre.slug === selectedGenre);
        if (!hasGenre) return false;
      }
      if (selectedArtist !== "all") {
        if (song.artistId !== selectedArtist && song.artist?.slug !== selectedArtist) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.playCount || 0) - (a.playCount || 0);
      if (sortBy === "plays") return (b.playCount || 0) - (a.playCount || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Filters and Controls Bar */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام قطعه یا خواننده..."
              className="w-full pl-8 pr-10 py-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand"
            />
            <Search className="w-4 h-4 text-content-muted absolute right-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-2.5 text-content-muted hover:text-content-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode & Sort Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-medium"
            >
              <option value="newest">جدیدترین‌ها</option>
              <option value="popular">محبوب‌ترین‌ها</option>
              <option value="plays">بیشترین پخش</option>
            </select>

            {/* Grid / List toggle */}
            <div className="flex items-center bg-surface-50 p-1 rounded-xl border border-surface-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-brand text-white shadow-sm" : "text-content-muted"
                }`}
                title="نمایش شبکه‌ای"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-brand text-white shadow-sm" : "text-content-muted"
                }`}
                title="نمایش فهرستی"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-border text-xs">
          <button
            onClick={() => setSelectedGenre("all")}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedGenre === "all"
                ? "bg-brand text-white border-brand font-bold shadow-sm"
                : "bg-surface-50 border-surface-border text-content-secondary hover:border-brand/40"
            }`}
          >
            همه سبک‌ها
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.slug)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedGenre === g.slug
                  ? "bg-brand text-white border-brand font-bold shadow-sm"
                  : "bg-surface-50 border-surface-border text-content-secondary hover:border-brand/40"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-content-muted px-1">
        <span>نمایش {toPersianDigits(filteredSongs.length)} قطعه موسیقی</span>
      </div>

      {/* Songs Display */}
      {filteredSongs.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} queueContext={filteredSongs} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                queueContext={filteredSongs}
                variant="horizontal"
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-surface-card border border-surface-border rounded-3xl p-8 space-y-3">
          <p className="text-base font-bold text-content-primary">
            هیچ قطعه‌ای مطابق با فیلترهای انتخابی یافت نشد!
          </p>
          <p className="text-xs text-content-muted">
            می‌توانید عبارت جستجو را تغییر دهید یا سبک دیگری را انتخاب کنید.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGenre("all");
              setSelectedArtist("all");
            }}
            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90"
          >
            پاک کردن فیلترها
          </button>
        </div>
      )}
    </div>
  );
}
