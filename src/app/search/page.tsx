import React from "react";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./SearchClient";
import { SongItem, ArtistItem, AlbumItem } from "@/types";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "جستجوی موسیقی و آهنگ‌ها | آهنگام",
  description: "جستجوی سریع در آرشیو قطعات، متن ترانه‌ها و هنرمندان رسانه آهنگام.",
  robots: {
    index: false,
    follow: true,
  },
};

export const revalidate = 0;

export default async function SearchPage() {
  const [songsRaw, artistsRaw, albumsRaw] = await Promise.all([
    prisma.song.findMany({
      where: { status: "PUBLISHED" },
      include: {
        artist: true,
        album: true,
        qualities: true,
      },
    }),
    prisma.artist.findMany(),
    prisma.album.findMany({
      include: { artist: true },
    }),
  ]);

  const songs: SongItem[] = songsRaw as unknown as SongItem[];
  const artists: ArtistItem[] = artistsRaw as unknown as ArtistItem[];
  const albums: AlbumItem[] = albumsRaw as unknown as AlbumItem[];

  return (
    <div className="py-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-content-primary">
          جستجوی آهنگام
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          جستجوی سریع متنی، صوتی، متن ترانه‌ها و هنرمندان در سراسر آرشیو
        </p>
      </div>

      <SearchClient
        initialSongs={songs}
        initialArtists={artists}
        initialAlbums={albums}
      />
    </div>
  );
}
