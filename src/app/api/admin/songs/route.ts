import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission("SONGS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      artistId,
      albumId,
      genreIds,
      duration,
      coverImage,
      lyrics,
      syncedLyrics,
      lyricist,
      composer,
      arranger,
      publisher,
      status,
      isFeatured,
      isEditorPick,
      qualities,
    } = body;

    // Generate unique slug safely
    const cleanTitle = (title || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-");
    const slug = `${cleanTitle || "song"}-${Date.now().toString().slice(-4)}`;

    // Ensure valid artistId
    let finalArtistId = artistId;
    if (!finalArtistId) {
      const defaultArtist = await prisma.artist.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (defaultArtist) {
        finalArtistId = defaultArtist.id;
      } else {
        const createdArtist = await prisma.artist.create({
          data: { name: "بیتا", slug: "bita" },
        });
        finalArtistId = createdArtist.id;
      }
    }

    const song = await prisma.song.create({
      data: {
        title,
        slug,
        artistId: finalArtistId,
        albumId: albumId || null,
        duration: Number(duration) || 0,
        coverImage,
        lyrics,
        syncedLyrics,
        lyricist,
        composer,
        arranger,
        publisher,
        status: status || "PUBLISHED",
        isFeatured: !!isFeatured,
        isEditorPick: !!isEditorPick,
        qualities: {
          create:
            qualities && qualities.length > 0
              ? qualities.map((q: any) => ({
                  quality: q.quality || "320",
                  fileUrl:
                    q.fileUrl && !q.fileUrl.startsWith("blob:")
                      ? q.fileUrl
                      : "/audio/sample.mp3",
                  fileSize: q.fileSize || null,
                  isDefault: !!q.isDefault,
                }))
              : [
                  {
                    quality: "320",
                    fileUrl: "/audio/sample.mp3",
                    isDefault: true,
                  },
                ],
        },
      },
    });

    // Connect genres
    if (genreIds && Array.isArray(genreIds) && genreIds.length > 0) {
      for (const gId of genreIds) {
        await prisma.songGenre.create({
          data: {
            songId: song.id,
            genreId: gId,
          },
        });
      }
    }

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: user!.id,
        action: "CREATE_SONG",
        targetType: "Song",
        targetId: song.id,
        details: JSON.stringify({ title: song.title, slug: song.slug }),
      },
    });

    return NextResponse.json({ success: true, song });
  } catch (err: any) {
    console.error("Create song error:", err);
    return NextResponse.json(
      { message: "خطا در ثبت آهنگ در پایگاه داده." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      include: { artist: true, album: true, qualities: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ songs });
  } catch (err) {
    return NextResponse.json({ message: "خطا در بارگذاری آهنگ‌ها." }, { status: 500 });
  }
}
