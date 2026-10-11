import React from "react";
import Link from "next/link";
import { Disc3 } from "lucide-react";
import { AlbumItem } from "@/types";
import { toPersianDigits } from "@/lib/utils";

export function AlbumCard({ album }: { album: AlbumItem }) {
  return (
    <Link
      href={`/album/${album.slug || album.id}`}
      className="group relative rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border p-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-100 mb-3 shadow-md">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand">
            <Disc3 className="w-8 h-8" />
          </div>
        )}

        {album.releaseYear && (
          <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white">
            {toPersianDigits(album.releaseYear)}
          </span>
        )}
      </div>

      <h4 className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors truncate">
        {album.title}
      </h4>
      <p className="text-xs text-content-muted truncate mt-0.5">
        {album.artist?.name || "بیتا"}
      </p>
    </Link>
  );
}
