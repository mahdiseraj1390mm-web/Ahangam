import React from "react";
import { prisma } from "@/lib/prisma";
import { SongUploadForm } from "./SongUploadForm";

export const revalidate = 0;

export default async function AdminNewSongPage() {
  const [artists, albums, genres] = await Promise.all([
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
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">افزودن آهنگ جدید</h1>
        <p className="text-xs text-content-muted">
          فرم جامع بارگذاری فایل صوتی، تعریف کیفیت‌ها، متن ترانه و مشخصات اثر
        </p>
      </div>

      <SongUploadForm artists={artists} albums={albums} genres={genres} />
    </div>
  );
}
