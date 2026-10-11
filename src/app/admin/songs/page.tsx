import React from "react";
import { prisma } from "@/lib/prisma";
import { SongsTableClient } from "./SongsTableClient";

export const revalidate = 0;

export default async function AdminSongsListPage() {
  const [songs, artists, albums, genres] = await Promise.all([
    prisma.song.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        coverImage: true,
        lyrics: true,
        syncedLyrics: true,
        lyricist: true,
        composer: true,
        arranger: true,
        publisher: true,
        artistId: true,
        albumId: true,
        playCount: true,
        downloadCount: true,
        status: true,
        isFeatured: true,
        isEditorPick: true,
        createdAt: true,
        genres: { select: { genreId: true } },
        artist: { select: { id: true, name: true } },
        album: { select: { id: true, title: true } },
        qualities: {
          select: {
            quality: true,
            fileUrl: true,
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artist.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.album.findMany({
      select: { id: true, title: true, artistId: true },
      orderBy: { title: "asc" },
    }),
    prisma.genre.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت آهنگ‌ها</h1>
        <p className="text-xs text-content-muted">
          فهرست تمام قطعات، وضعیت انتشار، آمار پخش، دانلود و ویرایش جامع
        </p>
      </div>

      <SongsTableClient
        initialSongs={songs as any}
        allArtists={artists}
        allAlbums={albums}
        allGenres={genres}
      />
    </div>
  );
}
