import React from "react";
import Link from "next/link";
import { ArtistItem } from "@/types";
import { formatNumberPersian } from "@/lib/utils";
import { UserCheck } from "lucide-react";

export function ArtistCard({ artist }: { artist: ArtistItem }) {
  return (
    <Link
      href={`/artist/${artist.slug || artist.id}`}
      className="group flex flex-col items-center text-center p-3 rounded-2xl bg-surface-card hover:bg-surface-50 border border-surface-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-surface-100 mb-3 shadow-md border-2 border-transparent group-hover:border-brand transition-all">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-black text-xl">
            {artist.name[0]}
          </div>
        )}
      </div>

      <h4 className="text-sm font-bold text-content-primary group-hover:text-brand transition-colors truncate max-w-full">
        {artist.name}
      </h4>
      <p className="text-[11px] text-content-muted mt-0.5">
        {formatNumberPersian(artist.followersCount || 0)} دنبال‌کننده
      </p>
    </Link>
  );
}
