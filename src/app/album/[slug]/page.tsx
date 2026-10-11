import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SongCard } from "@/components/cards/SongCard";
import { SongItem } from "@/types";
import { Disc3, Calendar, Music } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;

  const album = await prisma.album.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      artist: true,
      songs: {
        where: { status: "PUBLISHED" },
        include: {
          artist: true,
          album: true,
          qualities: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!album) {
    notFound();
  }

  const songs: SongItem[] = album.songs as unknown as SongItem[];

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-xl">
        <div className="relative w-44 h-44 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-surface-100">
          {album.coverImage ? (
            <img
              src={album.coverImage}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand">
              <Disc3 className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-center sm:text-right flex-1 min-w-0">
          <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
            آلبوم موسیقی
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-content-primary">
            {album.title}
          </h1>
          <p className="text-base font-bold text-brand">
            اثری از {album.artist?.name || "بیتا"}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-content-muted">
            {album.releaseYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                سال انتشار: {toPersianDigits(album.releaseYear)}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5" />
              {toPersianDigits(songs.length)} قطعه
            </span>
          </div>

          {album.description && (
            <div className="pt-2">
              <p className="text-sm text-content-secondary leading-relaxed whitespace-pre-line bg-surface-50/50 p-3.5 rounded-xl border border-surface-border/50">
                {album.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracklist */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-content-primary">قطعات این آلبوم</h2>
        <div className="space-y-2.5">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              queueContext={songs}
              variant="horizontal"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
