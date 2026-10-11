import React from "react";
import { prisma } from "@/lib/prisma";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { ArtistItem } from "@/types";

export const revalidate = 0;

export default async function ArtistsDirectoryPage() {
  const artistsRaw = await prisma.artist.findMany({
    orderBy: { followersCount: "desc" },
  });
  const artists: ArtistItem[] = artistsRaw as unknown as ArtistItem[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary">
          هنرمندان آهنگام
        </h1>
        <p className="text-xs sm:text-sm text-content-muted">
          آرشیو کامل خوانندگان، آهنگسازان و نوازندگان برجسته
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
