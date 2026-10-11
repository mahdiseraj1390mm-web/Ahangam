import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentSongId = searchParams.get("currentSongId") || "";
    const artistId = searchParams.get("artistId") || "";
    const excludeIds = (searchParams.get("exclude") || "")
      .split(",")
      .filter(Boolean);

    if (currentSongId && !excludeIds.includes(currentSongId)) {
      excludeIds.push(currentSongId);
    }

    // 1. Try to find songs from the same artist first
    let recommendations: any[] = [];
    if (artistId) {
      recommendations = await prisma.song.findMany({
        where: {
          status: "PUBLISHED",
          artistId: artistId,
          id: { notIn: excludeIds },
        },
        include: {
          artist: true,
          album: true,
          qualities: true,
        },
        take: 4,
        orderBy: { playCount: "desc" },
      });
    }

    // 2. If we need more songs, fill up with popular or newest songs
    if (recommendations.length < 4) {
      const needed = 4 - recommendations.length;
      const alreadyFoundIds = [...excludeIds, ...recommendations.map((s) => s.id)];

      const moreSongs = await prisma.song.findMany({
        where: {
          status: "PUBLISHED",
          id: { notIn: alreadyFoundIds },
        },
        include: {
          artist: true,
          album: true,
          qualities: true,
        },
        take: needed,
        orderBy: { playCount: "desc" },
      });

      recommendations = [...recommendations, ...moreSongs];
    }

    return NextResponse.json({ success: true, songs: recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ success: false, songs: [] }, { status: 500 });
  }
}
