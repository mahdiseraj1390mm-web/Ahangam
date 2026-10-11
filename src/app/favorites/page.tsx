import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoritesClient } from "./FavoritesClient";
import { SongItem } from "@/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  let userId = user?.id;

  if (!userId) {
    const guest = await prisma.user.findFirst({
      where: { phone: "09999999999" },
      select: { id: true },
    });
    userId = guest?.id;
  }

  let favoriteSongs: SongItem[] = [];
  let userPlaylists: any[] = [];

  if (userId) {
    const [favoritesRaw, playlistsRaw] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          song: {
            include: {
              artist: true,
              album: true,
              qualities: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.playlist.findMany({
        where: { userId },
        include: {
          songs: {
            include: {
              song: {
                include: {
                  artist: true,
                  album: true,
                  qualities: true,
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    favoriteSongs = favoritesRaw.map((f) => f.song) as unknown as SongItem[];
    userPlaylists = playlistsRaw;
  }

  return (
    <FavoritesClient
      initialFavoriteSongs={favoriteSongs}
      initialPlaylists={userPlaylists}
      isLoggedIn={!!user}
      userDisplayName={user?.displayName || "کاربر گرامی"}
    />
  );
}
