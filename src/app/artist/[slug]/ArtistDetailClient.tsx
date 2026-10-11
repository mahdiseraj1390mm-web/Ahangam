"use client";

import React, { useState } from "react";
import { ArtistItem, SongItem, AlbumItem } from "@/types";
import { SongCard } from "@/components/cards/SongCard";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { UserPlus, UserCheck, Music, Disc3, Sparkles } from "lucide-react";
import { formatNumberPersian, toPersianDigits } from "@/lib/utils";

interface ArtistDetailClientProps {
  artist: ArtistItem;
  songs: SongItem[];
  albums: AlbumItem[];
  isInitialFollowing?: boolean;
}

export function ArtistDetailClient({
  artist,
  songs,
  albums,
  isInitialFollowing = false,
}: ArtistDetailClientProps) {
  const [isFollowing, setIsFollowing] = useState(isInitialFollowing);
  const [followers, setFollowers] = useState(artist.followersCount);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsFollowLoading(true);
      const res = await fetch(`/api/artists/${artist.id}/follow`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowers((prev) => (data.isFollowing ? prev + 1 : prev - 1));
      } else {
        alert(data.message || "برای دنبال کردن هنرمند باید وارد حساب خود شوید.");
      }
    } catch {
      alert("خطا در برقراری ارتباط.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-xl">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shrink-0 shadow-2xl border-4 border-surface-border bg-surface-100">
          {artist.image ? (
            <img
              src={artist.image}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-black text-4xl">
              {artist.name[0]}
            </div>
          )}
        </div>

        <div className="space-y-3 text-center sm:text-right flex-1 min-w-0">
          <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
            هنرمند رسمی آهنگام
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-content-primary">
            {artist.name}
          </h1>
          {artist.bio && (
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            <span className="text-xs text-content-muted">
              {formatNumberPersian(followers)} دنبال‌کننده
            </span>
            <span className="text-xs text-content-muted">•</span>
            <span className="text-xs text-content-muted">
              {toPersianDigits(songs.length)} اثر منتشرشده
            </span>

            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md mr-auto sm:mr-0 ${
                isFollowing
                  ? "bg-surface-50 border border-surface-border text-content-secondary hover:bg-surface-100"
                  : "bg-brand text-white shadow-brand/30 hover:opacity-90 active:scale-95"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>دنبال می‌کنید</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>دنبال کردن</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-brand" />
          <h2 className="text-lg sm:text-xl font-bold text-content-primary">
            آهنگ‌های {artist.name}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} queueContext={songs} />
          ))}
        </div>
      </section>

      {/* Albums Section */}
      {albums.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-brand" />
            <h2 className="text-lg sm:text-xl font-bold text-content-primary">
              آلبوم‌های {artist.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
