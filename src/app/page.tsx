import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StoriesTray } from "@/components/stories/StoriesTray";
import { SongCard } from "@/components/cards/SongCard";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { AlbumCard } from "@/components/cards/AlbumCard";
import {
  Sparkles,
  Flame,
  Compass,
  Headphones,
  ArrowLeft,
  ChevronLeft,
  Music2,
  Disc3,
  Coffee,
  Heart,
  Car,
  Zap,
} from "lucide-react";
import { SongItem, ArtistItem, AlbumItem, StoryItem } from "@/types";
import { toPersianDigits } from "@/lib/utils";

export const revalidate = 0; // Dynamic server rendering with real DB data
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Parallelize all DB queries with fallback for serverless safety
  let storiesRaw: any[] = [];
  let editorPicksRaw: any[] = [];
  let newSongsRaw: any[] = [];
  let popularSongsRaw: any[] = [];
  let artistsRaw: any[] = [];
  let albumsRaw: any[] = [];
  let genres: any[] = [];
  let dailySetting: any = null;
  let topSongsSetting: any = null;

  try {
    const results = await Promise.all([
      prisma.story.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }).catch(() => []),
      prisma.song.findMany({
        where: { status: "PUBLISHED", isEditorPick: true },
        include: { artist: true, album: true, qualities: true },
        take: 6,
      }).catch(() => []),
      prisma.song.findMany({
        where: { status: "PUBLISHED" },
        include: { artist: true, album: true, qualities: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }).catch(() => []),
      prisma.song.findMany({
        where: { status: "PUBLISHED" },
        include: { artist: true, album: true, qualities: true },
        orderBy: { playCount: "desc" },
        take: 6,
      }).catch(() => []),
      prisma.artist.findMany({
        orderBy: { followersCount: "desc" },
        take: 6,
      }).catch(() => []),
      prisma.album.findMany({
        include: { artist: true },
        take: 4,
      }).catch(() => []),
      prisma.genre.findMany({
        orderBy: { sortOrder: "asc" },
      }).catch(() => []),
      prisma.siteSetting.findUnique({
        where: { key: "FEATURED_SONG_OF_THE_DAY" },
      }).catch(() => null),
      prisma.siteSetting.findUnique({
        where: { key: "TOP_SONGS_CONFIG" },
      }).catch(() => null),
    ]);

    storiesRaw = results[0];
    editorPicksRaw = results[1];
    newSongsRaw = results[2];
    popularSongsRaw = results[3];
    artistsRaw = results[4];
    albumsRaw = results[5];
    genres = results[6];
    dailySetting = results[7];
    topSongsSetting = results[8];
  } catch (err) {
    console.error("Home page DB load warning:", err);
  }

  const stories: StoryItem[] = storiesRaw.map((s) => ({
    ...s,
    mediaType: s.mediaType as "IMAGE" | "VIDEO",
  }));

  const editorPicks: SongItem[] = editorPicksRaw as unknown as SongItem[];
  const newSongs: SongItem[] = newSongsRaw as unknown as SongItem[];
  const popularSongs: SongItem[] = popularSongsRaw as unknown as SongItem[];
  const artists: ArtistItem[] = artistsRaw as unknown as ArtistItem[];
  const albums: AlbumItem[] = albumsRaw as unknown as AlbumItem[];

  // Top Songs Configuration (Controlled by Admin)
  let topSongsTitle = "برترین آهنگ‌های این هفته در آهنگام";
  let topSongsSubtitle = "جدول رسمی پرشنونده‌ترین و محبوب‌ترین قطعات موسیقی";
  let topSongsList: SongItem[] = popularSongs;
  let isTopSongsVisible = true;

  if (topSongsSetting?.value) {
    try {
      const topConfig = JSON.parse(topSongsSetting.value);
      if (topConfig.isEnabled === false) {
        isTopSongsVisible = false;
      }
      if (topConfig.title) topSongsTitle = topConfig.title;
      if (topConfig.subtitle) topSongsSubtitle = topConfig.subtitle;
      if (
        topConfig.mode === "manual" &&
        Array.isArray(topConfig.songIds) &&
        topConfig.songIds.length > 0
      ) {
        const manualSongsRaw = await prisma.song.findMany({
          where: { id: { in: topConfig.songIds } },
          include: { artist: true, album: true, qualities: true },
        });
        const songMap = new Map(manualSongsRaw.map((s) => [s.id, s]));
        const ordered = topConfig.songIds
          .map((id: string) => songMap.get(id))
          .filter(Boolean) as unknown as SongItem[];
        if (ordered.length > 0) {
          topSongsList = ordered;
        }
      }
    } catch {}
  }

  let heroSong: any = null;
  let heroTitle = "";
  let heroSubtitle = "";
  let heroBadge = "پیشنهاد ویژه روز در آهنگام";
  let heroCover = "";
  let isHeroVisible = true;

  if (dailySetting && dailySetting.value) {
    try {
      const parsed = JSON.parse(dailySetting.value);
      if (parsed.isEnabled === false) {
        isHeroVisible = false;
      } else if (parsed.songId) {
        heroSong = await prisma.song.findUnique({
          where: { id: parsed.songId },
          include: { artist: true, album: true, qualities: true },
        });
        if (heroSong) {
          heroTitle = parsed.title || heroSong.title;
          heroSubtitle =
            parsed.subtitle ||
            `اثری شنیدنی و خاطره‌انگیز با صدای ${heroSong.artist?.name || "بیتا"}`;
          heroBadge = parsed.badgeTitle || "پیشنهاد ویژه روز در آهنگام";
          heroCover = parsed.bannerImage || heroSong.coverImage || "/logo.png";
        }
      }
    } catch {}
  }

  // Fallback if not specifically configured
  if (!heroSong && isHeroVisible) {
    heroSong = editorPicks[0] || newSongs[0];
    if (heroSong) {
      heroTitle = heroSong.title;
      heroSubtitle = `اثری شنیدنی و خاطره‌انگیز با صدای ${heroSong.artist?.name || "بیتا"}`;
      heroBadge = "پیشنهاد ویژه روز در آهنگام";
      heroCover = heroSong.coverImage || "/logo.png";
    }
  }

  return (
    <div className="space-y-12">
      {/* 1. Stories Tray */}
      {stories.length > 0 && <StoriesTray stories={stories} />}

      {/* 2. Hero Banner: پیشنهاد ویژه روز در آهنگام */}
      {isHeroVisible && heroSong && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand to-surface-card p-5 sm:p-8 md:p-10 text-white shadow-2xl border border-brand/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroBadge}</span>
              </div>

              {/* Mobile View: Image & Titles visible on phones */}
              <div className="flex items-center gap-4 md:hidden">
                {heroCover && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-xl border-2 border-white/25 shrink-0 bg-black/20">
                    <img
                      src={heroCover}
                      alt={heroTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    {heroTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 font-medium line-clamp-2">
                    {heroSubtitle}
                  </p>
                </div>
              </div>

              {/* Desktop View: Titles */}
              <div className="hidden md:block space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-base sm:text-lg text-white/80 font-medium">
                  {heroSubtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
                <Link
                  href={`/song/${heroSong.slug || heroSong.id}`}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white text-brand font-black text-xs sm:text-sm shadow-xl hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>پخش و متن ترانه</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/songs"
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-black/30 backdrop-blur-md hover:bg-black/40 text-white font-bold text-xs sm:text-sm transition-all"
                >
                  مرور آرشیو
                </Link>
              </div>
            </div>

            {/* Desktop / Tablet Large Cover Backdrop */}
            {heroCover && (
              <div className="hidden md:block w-60 h-60 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/15 shrink-0 bg-black/20">
                <img
                  src={heroCover}
                  alt={heroTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Moods & Quick Genres Tags */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-brand" />
            <h2 className="text-lg sm:text-xl font-bold text-content-primary">
              موسیقی بر اساس حال‌وهوا
            </h2>
          </div>
          <Link
            href="/songs"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            <span>همه سبک‌ها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/songs?genre=${g.slug}`}
              className="px-4 py-2 rounded-xl bg-surface-card hover:bg-brand/10 hover:border-brand/40 border border-surface-border text-content-secondary hover:text-brand font-bold text-xs shrink-0 transition-all shadow-sm active:scale-95"
            >
              <span>{g.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. New Releases */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="text-lg sm:text-xl font-black text-content-primary">
              تازه‌ترین آهنگ‌ها
            </h2>
          </div>
          <Link
            href="/songs?sort=newest"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            <span>مشاهده همه</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {newSongs.map((song) => (
            <SongCard key={song.id} song={song} queueContext={newSongs} />
          ))}
        </div>
      </section>

      {/* 5. Top Songs Section (Controlled by Admin) */}
      {isTopSongsVisible && topSongsList.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-content-primary">
                  {topSongsTitle}
                </h2>
                <p className="text-xs text-content-muted">{topSongsSubtitle}</p>
              </div>
            </div>
            <Link
              href="/songs?sort=popular"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              <span>مشاهده جدول کامل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topSongsList.map((song, idx) => (
              <div key={song.id} className="relative flex items-center gap-2">
                <span
                  className={`w-7 text-center font-black text-sm shrink-0 ${
                    idx === 0
                      ? "text-amber-400"
                      : idx === 1
                      ? "text-slate-300"
                      : idx === 2
                      ? "text-amber-600"
                      : "text-content-muted"
                  }`}
                >
                  {toPersianDigits(idx + 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <SongCard
                    song={song}
                    queueContext={topSongsList}
                    variant="horizontal"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Popular Artists */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-brand" />
            <h2 className="text-lg sm:text-xl font-black text-content-primary">
              هنرمندان محبوب
            </h2>
          </div>
          <Link
            href="/artists"
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
          >
            <span>همه هنرمندان</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* 7. Featured Albums */}
      {albums.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-brand" />
              <h2 className="text-lg sm:text-xl font-black text-content-primary">
                آلبوم‌های برگزیده
              </h2>
            </div>
            <Link
              href="/albums"
              className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
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
