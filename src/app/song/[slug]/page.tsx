import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SongDetailClient } from "./SongDetailClient";
import { SongItem, CommentItem } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { MusicSchema } from "@/components/seo/MusicSchema";

import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

interface SongPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SongPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getSiteUrl();

  const song = await prisma.song.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
      status: "PUBLISHED",
    },
    include: {
      artist: true,
      album: true,
    },
  });

  if (!song) {
    return {
      title: "آهنگ یافت نشد | آهنگام",
      description: "قطعه موسیقی مورد نظر در رسانه آهنگام یافت نشد.",
    };
  }

  const artistName = song.artist?.name || "بیتا";
  const songTitle = song.title;
  const albumName = song.album?.title ? ` از آلبوم ${song.album.title}` : "";
  const lyricsSnippet = song.lyrics
    ? ` | بخشی از متن ترانه: "${song.lyrics.slice(0, 120).replace(/\n/g, " ")}..."`
    : "";

  const pageTitle = `دانلود آهنگ ${songTitle} از ${artistName} + متن آهنگ و پخش آنلاین 320 و 128 | آهنگام`;
  const pageDescription = `دانلود آهنگ جدید ${songTitle} با صدای ${artistName}${albumName} با دو کیفیت 320 و 128 به همراه متن کامل شعر و پخش آنلاین اختصاصی در رسانه آهنگام.${lyricsSnippet}`;

  const keywords = [
    `آهنگ ${songTitle}`,
    `دانلود آهنگ ${songTitle}`,
    `دانلود آهنگ ${songTitle} از ${artistName}`,
    `متن آهنگ ${songTitle}`,
    `تکست آهنگ ${songTitle}`,
    `آهنگ ${artistName} ${songTitle}`,
    `دانلود آهنگ های ${artistName}`,
    `اهنگ جدید ${artistName}`,
    "آهنگام",
    "آهنگ",
    "اهنگام",
    "بیتا",
    "دانلود آهنگ جدید",
    "پخش آنلاین آهنگ",
    "متن ترانه",
    songTitle,
    artistName,
  ];

  const canonicalUrl = `${baseUrl}/song/${song.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "آهنگام",
      locale: "fa_IR",
      type: "music.song",
      images: song.coverImage
        ? [
            {
              url: song.coverImage,
              width: 600,
              height: 600,
              alt: `کاور آهنگ ${songTitle} از ${artistName}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: song.coverImage ? [song.coverImage] : [],
    },
  };
}

export default async function SongPage({ params }: SongPageProps) {
  const { slug } = await params;

  const songRaw = await prisma.song.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
      status: "PUBLISHED",
    },
    include: {
      artist: true,
      album: true,
      qualities: true,
      comments: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      ratings: true,
    },
  });

  if (!songRaw) {
    notFound();
  }

  const user = await getCurrentUser();

  // Ratings calculation
  const totalRatings = songRaw.ratings.length;
  const avgRating =
    totalRatings > 0
      ? songRaw.ratings.reduce((acc, r) => acc + r.score, 0) / totalRatings
      : 5;

  const userRating = user
    ? songRaw.ratings.find((r) => r.userId === user.id)?.score || 0
    : 0;

  const song = songRaw as unknown as SongItem;
  const comments = songRaw.comments as unknown as CommentItem[];

  return (
    <div className="py-4">
      <MusicSchema
        song={song}
        averageRating={avgRating}
        totalRatings={totalRatings}
      />
      <SongDetailClient
        song={song}
        initialComments={comments}
        userRating={userRating}
        averageRating={avgRating}
        totalRatings={totalRatings}
      />
    </div>
  );
}
