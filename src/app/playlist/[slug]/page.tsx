import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SongCard } from "@/components/cards/SongCard";
import { SongItem } from "@/types";
import { ListMusic, User, Music } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface PlaylistPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlaylistDetailPage({ params }: PlaylistPageProps) {
  const { slug } = await params;

  const playlist = await prisma.playlist.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      user: { select: { displayName: true } },
      songs: {
        include: {
          song: {
            include: { artist: true, album: true, qualities: true },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!playlist) {
    notFound();
  }

  const songs: SongItem[] = playlist.songs.map((ps) => ps.song) as unknown as SongItem[];

  return (
    <div className="space-y-8 py-4">
      {/* Playlist Hero */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-xl">
        <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-surface-100 flex items-center justify-center text-brand">
          {playlist.coverImage ? (
            <img src={playlist.coverImage} alt={playlist.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand/20 flex items-center justify-center">
              <ListMusic className="w-12 h-12 text-brand" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-center sm:text-right flex-1 min-w-0">
          <div className="inline-block px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold border border-brand/20">
            {playlist.isSystem ? "پلی‌لیست رسمی آهنگام" : "پلی‌لیست کاربر"}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-content-primary">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-content-muted">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              سازنده: {playlist.user?.displayName || "سردبیر آهنگام"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5" />
              {toPersianDigits(songs.length)} قطعه
            </span>
          </div>
        </div>
      </div>

      {/* Playlist Tracks */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-content-primary">قطعات این پلی‌لیست</h2>

        {songs.length > 0 ? (
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
        ) : (
          <div className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center text-xs text-content-muted">
            هنوز قطعه‌ای به این پلی‌لیست افزوده نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
