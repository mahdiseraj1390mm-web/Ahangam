import React from "react";
import { prisma } from "@/lib/prisma";
import { GenresAdminClient } from "./GenresAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminGenresPage() {
  const [genresRaw, allSongsRaw] = await Promise.all([
    prisma.genre.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
        },
      },
    }),
    prisma.song.findMany({
      where: { status: "PUBLISHED" },
      include: {
        artist: true,
        album: true,
        genres: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const genres = genresRaw.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    isMood: g.isMood,
    songCount: g.songs.length,
    songs: g.songs.map((sg) => sg.song),
  }));

  const allSongs = allSongsRaw.map((s) => ({
    id: s.id,
    title: s.title,
    coverImage: s.coverImage,
    artistName: s.artist?.name || "بیتا",
    genreIds: s.genres.map((g) => g.genreId),
  }));

  return <GenresAdminClient initialGenres={genres} allSongs={allSongs} />;
}
