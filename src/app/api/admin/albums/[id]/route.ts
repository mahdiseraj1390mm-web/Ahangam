import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      artistId,
      coverImage,
      releaseYear,
      description,
      isFeatured,
      songIds, // Array of song IDs that belong to this album
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (artistId !== undefined) updateData.artistId = artistId;
    if (coverImage !== undefined) updateData.coverImage = coverImage ? coverImage.trim() : null;
    if (releaseYear !== undefined) {
      updateData.releaseYear = releaseYear ? parseInt(releaseYear) : null;
    }
    if (description !== undefined) {
      updateData.description = description ? description.trim() : null;
    }
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;

    const updatedAlbum = await prisma.album.update({
      where: { id },
      data: updateData,
    });

    // If songIds is provided, sync songs for this album
    if (Array.isArray(songIds)) {
      // 1. Remove albumId from songs that were previously in this album but not in songIds
      await prisma.song.updateMany({
        where: {
          albumId: id,
          id: { notIn: songIds },
        },
        data: { albumId: null },
      });

      // 2. Add albumId to selected songs
      if (songIds.length > 0) {
        await prisma.song.updateMany({
          where: { id: { in: songIds } },
          data: { albumId: id },
        });
      }
    }

    const fullAlbum = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: true,
        songs: {
          select: { id: true, title: true, duration: true, coverImage: true },
        },
      },
    });

    return NextResponse.json({ success: true, album: fullAlbum });
  } catch (err: any) {
    console.error("Error updating album:", err);
    return NextResponse.json({ message: "خطا در ویرایش آلبوم." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;

    // Disconnect any songs belonging to this album first (so songs aren't deleted)
    await prisma.song.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    await prisma.album.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting album:", err);
    return NextResponse.json({ message: "خطا در حذف آلبوم." }, { status: 500 });
  }
}
