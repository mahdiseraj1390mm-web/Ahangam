import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoDetailClient } from "./VideoDetailClient";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { VideoSchema } from "@/components/seo/VideoSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getSiteUrl();

  const video = await prisma.musicVideo.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      artist: true,
    },
  });

  if (!video) {
    return {
      title: "موزیک‌ویدیو یافت نشد | آهنگام",
    };
  }

  const artistName = video.artist?.name || "بیتا";
  const pageTitle = `دانلود و تماشای موزیک ویدیو ${video.title} از ${artistName} با کیفیت عالی | آهنگام`;
  const pageDescription = `تماشای آنلاین و دانلود موزیک ویدیوی رسمی ${video.title} با صدای ${artistName} با کیفیت بالا در رسانه آهنگام.`;
  const canonicalUrl = `${baseUrl}/video/${video.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      `موزیک ویدیو ${video.title}`,
      `دانلود موزیک ویدیو ${video.title}`,
      `کلیپ ${video.title}`,
      `موزیک ویدیو ${artistName}`,
      "آهنگام",
      "پخش آنلاین ویدیو",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "آهنگام",
      locale: "fa_IR",
      images: video.coverImage
        ? [
            {
              url: video.coverImage,
              alt: `کاور موزیک ویدیو ${video.title} از ${artistName}`,
            },
          ]
        : [],
    },
  };
}

export default async function VideoDetailPage({ params }: VideoPageProps) {
  const { slug } = await params;

  const video = await prisma.musicVideo.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      artist: true,
    },
  });

  if (!video) {
    notFound();
  }

  const relatedVideos = await prisma.musicVideo.findMany({
    where: { id: { not: video.id } },
    include: { artist: true },
    take: 3,
  });

  return (
    <div className="space-y-4">
      <VideoSchema video={video} />
      <Breadcrumbs
        items={[
          { label: "موزیک‌ویدیوها", href: "/videos" },
          { label: video.title },
        ]}
      />
      <VideoDetailClient video={video} relatedVideos={relatedVideos} />
    </div>
  );
}
