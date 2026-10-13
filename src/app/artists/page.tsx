import React from "react";
import { prisma } from "@/lib/prisma";
import { ArtistCard } from "@/components/cards/ArtistCard";
import { ArtistItem } from "@/types";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "هنرمندان و خوانندگان | بیوگرافی و فول آلبوم کامل",
  description:
    "فهرست کامل خوانندگان و هنرمندان محبوب در رسانه موسیقی آهنگام به همراه بیوگرافی، دانلود تمام آثار و پلی‌لیست‌های اختصاصی.",
  keywords: [
    "خوانندگان",
    "هنرمندان موسیقی",
    "فول آلبوم خوانندگان",
    "بیتا",
    "آهنگام",
    "دانلود آهنگ های خوانندگان",
  ],
  alternates: {
    canonical: `${getSiteUrl()}/artists`,
  },
  openGraph: {
    title: "هنرمندان آهنگام | آرشیو کامل خوانندگان",
    description: "فهرست کامل و اختصاصی خوانندگان و هنرمندان در رسانه آهنگام.",
    url: `${getSiteUrl()}/artists`,
    siteName: "آهنگام",
    locale: "fa_IR",
  },
};

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
