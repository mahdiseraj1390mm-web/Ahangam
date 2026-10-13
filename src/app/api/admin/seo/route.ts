import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET() {
  const { authorized, user } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  try {
    const baseUrl = getSiteUrl();

    const [
      totalSongs,
      publishedSongs,
      totalArtists,
      totalAlbums,
      totalPlaylists,
      totalVideos,
      songsWithoutLyrics,
      songsWithoutCover,
      songsWithoutDesc,
      allSongs,
      allArtists,
      siteSettings,
    ] = await Promise.all([
      prisma.song.count(),
      prisma.song.count({ where: { status: "PUBLISHED" } }),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.playlist.count({ where: { isPublic: true } }),
      prisma.musicVideo.count(),
      prisma.song.count({ where: { OR: [{ lyrics: null }, { lyrics: "" }] } }),
      prisma.song.count({ where: { OR: [{ coverImage: null }, { coverImage: "" }, { coverImage: "/logo.png" }] } }),
      prisma.song.count({ where: { OR: [{ description: null }, { description: "" }] } }),
      prisma.song.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          lyrics: true,
          description: true,
          status: true,
          updatedAt: true,
          artist: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      prisma.artist.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          bio: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              "SITE_NAME",
              "SITE_TAGLINE",
              "GOOGLE_VERIFICATION_CODE",
              "DEFAULT_ARTIST_NAME",
            ],
          },
        },
      }),
    ]);

    const totalIndexable =
      publishedSongs + totalArtists + totalAlbums + totalPlaylists + totalVideos + 10; // 10 static routes

    // Check duplicate song titles
    const duplicateTitlesRaw = await prisma.song.groupBy({
      by: ["title"],
      _count: {
        title: true,
      },
      having: {
        title: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    const duplicateTitles = duplicateTitlesRaw.map((d) => ({
      title: d.title,
      count: d._count.title,
    }));

    // Calculate SEO health score (0 - 100)
    let score = 100;
    if (totalSongs > 0) {
      const lyricsMissingPercent = (songsWithoutLyrics / totalSongs) * 20;
      const descMissingPercent = (songsWithoutDesc / totalSongs) * 15;
      const coverMissingPercent = (songsWithoutCover / totalSongs) * 25;
      score -= Math.round(lyricsMissingPercent + descMissingPercent + coverMissingPercent);
      if (duplicateTitles.length > 0) score -= 10;
    }
    if (score < 30) score = 30;

    return NextResponse.json({
      success: true,
      baseUrl,
      score,
      stats: {
        totalSongs,
        publishedSongs,
        totalArtists,
        totalAlbums,
        totalPlaylists,
        totalVideos,
        totalIndexable,
        songsWithoutLyrics,
        songsWithoutCover,
        songsWithoutDesc,
        duplicateTitlesCount: duplicateTitles.length,
      },
      duplicateTitles,
      songs: allSongs,
      artists: allArtists,
      settings: siteSettings.reduce((acc, s) => {
        acc[s.key] = s.value;
        return acc;
      }, {} as Record<string, string>),
    });
  } catch (error: any) {
    console.error("SEO Audit API Error:", error);
    return NextResponse.json({ message: "خطا در ارزیابی وضعیت سئو" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { authorized, user } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, songId, artistId, title, slug, lyrics, description, settings } = body;

    // Action 1: Update Song SEO
    if (action === "UPDATE_SONG" && songId) {
      const updated = await prisma.song.update({
        where: { id: songId },
        data: {
          ...(title ? { title: title.trim() } : {}),
          ...(slug ? { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") } : {}),
          ...(lyrics !== undefined ? { lyrics: lyrics.trim() } : {}),
          ...(description !== undefined ? { description: description.trim() } : {}),
        },
      });

      return NextResponse.json({ success: true, song: updated });
    }

    // Action 2: Update Artist SEO
    if (action === "UPDATE_ARTIST" && artistId) {
      const updated = await prisma.artist.update({
        where: { id: artistId },
        data: {
          ...(title ? { name: title.trim() } : {}),
          ...(slug ? { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") } : {}),
          ...(description !== undefined ? { bio: description.trim() } : {}),
        },
      });

      return NextResponse.json({ success: true, artist: updated });
    }

    // Action 3: Update Global SEO Settings
    if (action === "UPDATE_SETTINGS" && settings) {
      for (const [key, val] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          create: {
            key,
            value: String(val),
            group: "SEO",
            description: "تنظیمات سئو",
          },
          update: {
            value: String(val),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "عملیات نامعتبر" }, { status: 400 });
  } catch (error: any) {
    console.error("SEO Update API Error:", error);
    return NextResponse.json({ message: "خطا در به‌روزرسانی تنظیمات سئو" }, { status: 500 });
  }
}
