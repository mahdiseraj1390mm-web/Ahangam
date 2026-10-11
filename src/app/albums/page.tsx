import React from "react";
import { prisma } from "@/lib/prisma";
import { AlbumCard } from "@/components/cards/AlbumCard";
import { AlbumItem } from "@/types";

export const revalidate = 0;

export default async function AlbumsArchivePage() {
  const albumsRaw = await prisma.album.findMany({
    include: { artist: true },
    orderBy: { releaseYear: "desc" },
  });

  const albums: AlbumItem[] = albumsRaw as unknown as AlbumItem[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          آلبوم‌های موسیقی
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          مجموعه کامل آلبوم‌های رسمی منتشرشده در آهنگام
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
