import React from "react";
import { getSiteUrl } from "@/lib/siteUrl";

export function VideoSchema({
  video,
}: {
  video: {
    title: string;
    slug: string;
    coverImage?: string | null;
    videoUrl?: string | null;
    description?: string | null;
    createdAt?: Date | string;
    duration?: number;
    artist?: { name: string } | null;
  };
}) {
  const baseUrl = getSiteUrl();
  const videoPageUrl = `${baseUrl}/video/${video.slug}`;
  const artistName = video.artist?.name || "بیتا";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        "@id": `${videoPageUrl}#video`,
        name: `${video.title} - ${artistName}`,
        description:
          video.description ||
          `تماشا و دانلود موزیک ویدیوی رسمی ${video.title} با صدای ${artistName} در رسانه آهنگام`,
        thumbnailUrl: [video.coverImage || `${baseUrl}/logo.png`],
        uploadDate: video.createdAt ? new Date(video.createdAt).toISOString() : new Date().toISOString(),
        contentUrl: video.videoUrl || undefined,
        embedUrl: videoPageUrl,
        ...(video.duration
          ? { duration: `PT${Math.floor(video.duration / 60)}M${video.duration % 60}S` }
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
            name: "موزیک‌ویدیوها",
            item: `${baseUrl}/videos`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: video.title,
            item: videoPageUrl,
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
