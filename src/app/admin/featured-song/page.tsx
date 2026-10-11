import React from "react";
import { prisma } from "@/lib/prisma";
import { FeaturedSongAdminClient } from "./FeaturedSongAdminClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AdminFeaturedSongPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "FEATURED_SONG_OF_THE_DAY" },
  });

  let initialFeatured = null;
  let currentSong = null;
  if (setting && setting.value) {
    try {
      initialFeatured = JSON.parse(setting.value);
      if (initialFeatured.songId) {
        currentSong = await prisma.song.findUnique({
          where: { id: initialFeatured.songId },
          include: {
            artist: { select: { name: true } },
            qualities: true,
          },
        });
      }
    } catch {}
  }

  return (
    <FeaturedSongAdminClient
      initialFeatured={initialFeatured}
      currentSong={currentSong as any}
    />
  );
}
