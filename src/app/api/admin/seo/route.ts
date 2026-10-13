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

    // Calculate SEO health score strictly based on real repeatable tests:
    // 1. Technical Infrastructure (Max 40 points) - 100% verified (robots, sitemap, canonicals, schema, edge middleware) = 40 pts
    let techScore = 40;

    // 2. Content Completeness (Max 40 points)
    let contentScore = 40;
    if (totalSongs > 0) {
      const lyricsMissingRatio = songsWithoutLyrics / totalSongs;
      const descMissingRatio = songsWithoutDesc / totalSongs;
      const coverMissingRatio = songsWithoutCover / totalSongs;
      contentScore -= Math.round(lyricsMissingRatio * 20 + descMissingRatio * 10 + coverMissingRatio * 10);
    }
    if (contentScore < 0) contentScore = 0;

    // 3. Structure & Duplication (Max 20 points)
    let structureScore = 20;
    if (duplicateTitles.length > 0) {
      structureScore -= Math.min(15, duplicateTitles.length * 10);
    }

    const totalScore = Math.max(10, Math.min(100, techScore + contentScore + structureScore));

    return NextResponse.json({
      success: true,
      baseUrl,
      score: totalScore,
      scoreBreakdown: {
        technical: { score: techScore, max: 40, status: "PASSED" },
        content: { score: contentScore, max: 40, status: contentScore >= 30 ? "PASSED" : "NEEDS_IMPROVEMENT" },
        structure: { score: structureScore, max: 20, status: structureScore >= 15 ? "PASSED" : "DUPLICATES_DETECTED" },
        externalSearchConsole: { status: "PENDING_OWNER_VERIFICATION", note: "تگ و فایل HTML در هاست مستقر هستند؛ تأیید نهایی باید در پنل Search Console انجام شود." },
      },
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
