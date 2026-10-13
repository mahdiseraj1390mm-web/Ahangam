import React from "react";
import { AlbumItem, SongItem } from "@/types";
import { getSiteUrl } from "@/lib/siteUrl";

export function AlbumSchema({
  album,
  songs = [],
}: {
  album: AlbumItem;
  songs?: SongItem[];
}) {
  const baseUrl = getSiteUrl();
  const albumUrl = `${baseUrl}/album/${album.slug}`;
  const artistName = album.artist?.name || "بیتا";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicAlbum",
        "@id": `${albumUrl}#album`,
        name: album.title,
        url: albumUrl,
        image: album.coverImage || `${baseUrl}/logo.png`,
        description:
          album.description ||
          `دانلود و پخش آنلاین آلبوم ${album.title} از ${artistName} در رسانه آهنگام`,
        byArtist: {
          "@type": "MusicGroup",
          name: artistName,
          url: album.artist?.slug ? `${baseUrl}/artist/${album.artist.slug}` : undefined,
        },
        numTracks: songs.length,
        ...(album.releaseYear ? { datePublished: String(album.releaseYear) } : {}),
        ...(songs.length > 0
          ? {
              track: songs.map((s, idx) => ({
                "@type": "MusicRecording",
                position: idx + 1,
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
            name: "آلبوم‌ها",
            item: `${baseUrl}/albums`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: album.title,
            item: albumUrl,
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
