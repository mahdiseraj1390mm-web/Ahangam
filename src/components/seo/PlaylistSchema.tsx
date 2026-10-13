import React from "react";
import { SongItem } from "@/types";
import { getSiteUrl } from "@/lib/siteUrl";

export function PlaylistSchema({
  playlist,
  songs = [],
}: {
  playlist: {
    title: string;
    slug: string;
    coverImage?: string | null;
    description?: string | null;
  };
  songs?: SongItem[];
}) {
  const baseUrl = getSiteUrl();
  const playlistUrl = `${baseUrl}/playlist/${playlist.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicPlaylist",
        "@id": `${playlistUrl}#playlist`,
        name: playlist.title,
        url: playlistUrl,
        image: playlist.coverImage || `${baseUrl}/logo.png`,
        description:
          playlist.description ||
          `مجموعه برگزیده پلی‌لیست ${playlist.title} شامل ${songs.length} قطعه موسیقی در رسانه آهنگام`,
        numTracks: songs.length,
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
            name: "پلی‌لیست‌ها",
            item: `${baseUrl}/playlists`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: playlist.title,
            item: playlistUrl,
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
