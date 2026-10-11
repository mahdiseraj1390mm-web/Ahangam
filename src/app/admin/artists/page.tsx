import React from "react";
import { prisma } from "@/lib/prisma";
import { ArtistsAdminClient } from "./ArtistsAdminClient";
import { ArtistItem } from "@/types";

export const revalidate = 0;

export default async function AdminArtistsPage() {
  const artistsRaw = await prisma.artist.findMany({
    orderBy: { createdAt: "desc" },
  });

  const artists: ArtistItem[] = artistsRaw as unknown as ArtistItem[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت هنرمندان</h1>
        <p className="text-xs text-content-muted">
          افزودن خواننده، بیوگرافی و تصویر برای استفاده در مشخصات قطعات
        </p>
      </div>

      <ArtistsAdminClient initialArtists={artists} />
    </div>
  );
}
