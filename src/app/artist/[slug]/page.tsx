import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArtistDetailClient } from "./ArtistDetailClient";
import { ArtistItem, SongItem, AlbumItem } from "@/types";
import { getCurrentUser } from "@/lib/auth";

import { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { ArtistSchema } from "@/components/seo/ArtistSchema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = getSiteUrl();

  const artist = await prisma.artist.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
  });

  if (!artist) {
    return {
      title: "هنرمند یافت نشد | آهنگام",
    };
  }

  const name = artist.name;
  const pageTitle = `دانلود تمام آهنگ های ${name} جدید و قدیمی با متن ترانه`;
  const pageDescription = `فول آلبوم و دانلود تمام آهنگ‌های ${name} به همراه پخش آنلاین، متن آهنگ‌ها، آلبوم‌ها و موزیک ویدیوها در رسانه موسیقی آهنگام.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      `آهنگ های ${name}`,
      `دانلود آهنگ های ${name}`,
      `فول آلبوم ${name}`,
      `آهنگ جدید ${name}`,
      `بیوگرافی ${name}`,
      "آهنگام",
      "بیتا",
      "آهنگ",
      "دانلود آهنگ جدید",
    ],
    alternates: {
      canonical: `${baseUrl}/artist/${artist.slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${baseUrl}/artist/${artist.slug}`,
      siteName: "آهنگام",
      locale: "fa_IR",
      images: artist.image ? [{ url: artist.image, alt: name }] : [],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;

  const artistRaw = await prisma.artist.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      songs: {
        where: { status: "PUBLISHED" },
        include: {
          artist: true,
          album: true,
          qualities: true,
        },
        orderBy: { createdAt: "desc" },
      },
      albums: {
        include: {
          artist: true,
        },
      },
    },
  });

  if (!artistRaw) {
    notFound();
  }

  const user = await getCurrentUser();
  let isFollowing = false;
  if (user) {
    const follow = await prisma.follow.findUnique({
      where: {
        userId_artistId: {
          userId: user.id,
          artistId: artistRaw.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const artist = artistRaw as unknown as ArtistItem;
  const songs = artistRaw.songs as unknown as SongItem[];
  const albums = artistRaw.albums as unknown as AlbumItem[];


  return (
    <div className="py-4">
      <ArtistSchema artist={artist} songs={songs} />
      <Breadcrumbs
        items={[
          { label: "هنرمندان", href: "/artists" },
          { label: artist.name },
        ]}
      />
      <ArtistDetailClient
        artist={artist}
        songs={songs}
        albums={albums}
        isInitialFollowing={isFollowing}
      />
    </div>
  );
}
