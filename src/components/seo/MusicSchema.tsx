import React from "react";
import { SongItem } from "@/types";

export function MusicSchema({
  song,
  averageRating,
  totalRatings,
}: {
  song: SongItem;
  averageRating?: number;
  totalRatings?: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const songUrl = `${baseUrl}/song/${song.slug}`;
  const artistName = song.artist?.name || "بیتا";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicRecording",
        "@id": `${songUrl}#recording`,
        name: song.title,
        url: songUrl,
        image: song.coverImage || `${baseUrl}/logo.png`,
        duration: `PT${Math.floor(song.duration / 60)}M${song.duration % 60}S`,
        datePublished: song.createdAt ? new Date(song.createdAt).toISOString() : undefined,
        inLanguage: "fa-IR",
        genre: song.genres?.map((g) => g.genre?.name).filter(Boolean) || ["پاپ"],
        byArtist: {
          "@type": "MusicGroup",
          "@id": `${baseUrl}/artist/${song.artist?.slug || "bita"}#artist`,
          name: artistName,
          url: `${baseUrl}/artist/${song.artist?.slug || "bita"}`,
        },
        inAlbum: song.album
          ? {
              "@type": "MusicAlbum",
              name: song.album.title,
              url: `${baseUrl}/album/${song.album.slug}`,
            }
          : undefined,
        ...(song.lyrics
          ? {
              lyrics: {
                "@type": "MusicComposition",
                lyrics: song.lyrics,
                text: song.lyrics,
              },
            }
          : {}),
        ...(song.composer ? { composer: { "@type": "Person", name: song.composer } } : {}),
        ...(song.lyricist ? { lyricist: { "@type": "Person", name: song.lyricist } } : {}),
        ...(totalRatings && totalRatings > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: Number((averageRating || 5).toFixed(1)),
                ratingCount: totalRatings,
                bestRating: "5",
                worstRating: "1",
              },
            }
          : {}),
      },
      {
        "@type": "AudioObject",
        "@id": `${songUrl}#audio`,
        name: `${song.title} - ${artistName}`,
        contentUrl: song.qualities?.[0]?.fileUrl
          ? song.qualities[0].fileUrl.startsWith("http")
            ? song.qualities[0].fileUrl
            : `${baseUrl}${song.qualities[0].fileUrl}`
          : `${baseUrl}/audio/sample.mp3`,
        encodingFormat: "audio/mpeg",
        duration: `PT${Math.floor(song.duration / 60)}M${song.duration % 60}S`,
        description: `دانلود و پخش آنلاین آهنگ ${song.title} از ${artistName} در رسانه آهنگام`,
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
            name: "آهنگ‌ها",
            item: `${baseUrl}/songs`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: song.title,
            item: songUrl,
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
