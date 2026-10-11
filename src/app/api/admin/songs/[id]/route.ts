import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminPermission("SONGS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
        genres: { include: { genre: true } },
        qualities: true,
      },
    });

    if (!song) {
      return NextResponse.json({ message: "آهنگ یافت نشد." }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت اطلاعات آهنگ." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user } = await checkAdminPermission("SONGS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const {
      title,
      artistId,
      artistName,
      albumId,
      albumTitle,
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

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    
    // Handle artist selection or new artist name
    if (artistName && typeof artistName === "string" && artistName.trim()) {
      let art = await prisma.artist.findFirst({
        where: { name: artistName.trim() },
      });
      if (!art) {
        const cleanSlug = artistName.trim().replace(/[^\w\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
        art = await prisma.artist.create({
          data: {
            name: artistName.trim(),
            slug: `${cleanSlug || "artist"}-${Date.now().toString().slice(-4)}`,
          },
        });
      }
      updateData.artistId = art.id;
    } else if (artistId !== undefined) {
      updateData.artistId = artistId;
    }

    // Handle album selection or new album name
    if (albumTitle !== undefined) {
      if (typeof albumTitle === "string" && albumTitle.trim()) {
        let alb = await prisma.album.findFirst({
          where: { title: albumTitle.trim() },
        });
        if (!alb) {
          const currentArtistId = updateData.artistId || (await prisma.song.findUnique({ where: { id } }))?.artistId;
          const cleanSlug = albumTitle.trim().replace(/[^\w\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
          alb = await prisma.album.create({
            data: {
              title: albumTitle.trim(),
              slug: `${cleanSlug || "album"}-${Date.now().toString().slice(-4)}`,
              artistId: currentArtistId || (await prisma.artist.findFirst())?.id || "",
            },
          });
        }
        updateData.albumId = alb.id;
      } else {
        updateData.albumId = null;
      }
    } else if (albumId !== undefined) {
      updateData.albumId = albumId || null;
    }

    if (duration !== undefined) updateData.duration = Number(duration) || 0;
    if (coverImage !== undefined) updateData.coverImage = coverImage || null;
    if (lyrics !== undefined) updateData.lyrics = lyrics || null;
    if (syncedLyrics !== undefined) updateData.syncedLyrics = syncedLyrics || null;
    if (lyricist !== undefined) updateData.lyricist = lyricist || null;
    if (composer !== undefined) updateData.composer = composer || null;
    if (arranger !== undefined) updateData.arranger = arranger || null;
    if (publisher !== undefined) updateData.publisher = publisher || null;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isEditorPick !== undefined) updateData.isEditorPick = isEditorPick;

    const updatedSong = await prisma.song.update({
      where: { id },
      data: updateData,
      include: {
        artist: true,
        album: true,
        qualities: true,
      },
    });

    // If qualities provided, replace them
    if (qualities && Array.isArray(qualities)) {
      await prisma.songQuality.deleteMany({ where: { songId: id } });
      if (qualities.length > 0) {
        await prisma.songQuality.createMany({
          data: qualities.map((q: any) => ({
            songId: id,
            quality: q.quality || "320",
            fileUrl:
              q.fileUrl && !q.fileUrl.startsWith("blob:")
                ? q.fileUrl
                : "/audio/sample.mp3",
            fileSize: q.fileSize || null,
            isDefault: !!q.isDefault,
          })),
        });
      }
    }

    // If genreIds provided, replace them
    if (body.genreIds && Array.isArray(body.genreIds)) {
      await prisma.songGenre.deleteMany({ where: { songId: id } });
      for (const gId of body.genreIds) {
        await prisma.songGenre.create({
          data: { songId: id, genreId: gId },
        });
      }
    }

    // Record audit log
    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_SONG",
          targetType: "Song",
          targetId: id,
          details: JSON.stringify(updateData),
        },
      });
    }

    return NextResponse.json({ success: true, song: updatedSong });
  } catch (err) {
    console.error("Update song error:", err);
    return NextResponse.json({ message: "خطا در ویرایش آهنگ." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    
    // Safely delete relational items first
    await prisma.songQuality.deleteMany({ where: { songId: id } });
    await prisma.songGenre.deleteMany({ where: { songId: id } });
    await prisma.playlistSong.deleteMany({ where: { songId: id } });
    await prisma.favorite.deleteMany({ where: { songId: id } });
    await prisma.rating.deleteMany({ where: { songId: id } });
    await prisma.playHistory.deleteMany({ where: { songId: id } });
    await prisma.comment.deleteMany({ where: { songId: id } });

    const song = await prisma.song.delete({
      where: { id },
    });

    // Record audit log
    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_SONG",
          targetType: "Song",
          targetId: id,
          details: JSON.stringify({ title: song.title }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete song error:", err);
    return NextResponse.json({ message: "خطا در حذف آهنگ." }, { status: 500 });
  }
}
