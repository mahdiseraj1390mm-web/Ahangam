import React from "react";
import { ArtistItem, SongItem } from "@/types";
import { getSiteUrl } from "@/lib/siteUrl";

export function ArtistSchema({
  artist,
  songs = [],
}: {
  artist: ArtistItem;
  songs?: SongItem[];
}) {
  const baseUrl = getSiteUrl();
  const artistUrl = `${baseUrl}/artist/${artist.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicGroup",
        "@id": `${artistUrl}#artist`,
        name: artist.name,
        url: artistUrl,
        image: artist.image || `${baseUrl}/logo.png`,
        description:
          artist.bio ||
          `دانلود تمام آهنگ‌ها و بیوگرافی ${artist.name} در رسانه موسیقی آهنگام`,
        ...(songs.length > 0
          ? {
              track: songs.slice(0, 10).map((s) => ({
                "@type": "MusicRecording",
                name: s.title,
                url: `${baseUrl}/song/${s.slug}`,
              })),
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "صفحه اصلی",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "هنرمندان",
            item: `${baseUrl}/artists`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: artist.name,
            item: artistUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
