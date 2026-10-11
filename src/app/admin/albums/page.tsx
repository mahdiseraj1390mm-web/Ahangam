import React from "react";
import { prisma } from "@/lib/prisma";
import { AlbumsAdminClient } from "./AlbumsAdminClient";

export const revalidate = 0;

export default async function AdminAlbumsPage() {
  const [albumsRaw, artistsRaw, songsRaw] = await Promise.all([
    prisma.album.findMany({
      include: {
        artist: { select: { id: true, name: true } },
        songs: {
          select: { id: true, title: true, duration: true, coverImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artist.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.song.findMany({
      select: {
        id: true,
        title: true,
        coverImage: true,
        duration: true,
        albumId: true,
        artist: { select: { name: true } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <AlbumsAdminClient
      initialAlbums={albumsRaw as any}
      allArtists={artistsRaw}
      allSongs={songsRaw as any}
    />
  );
}
