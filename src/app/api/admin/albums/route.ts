import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        artist: true,
        songs: {
          select: { id: true, title: true, duration: true, coverImage: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ albums });
  } catch {
    return NextResponse.json({ message: "خطا در دریافت آلبوم‌ها." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const {
      title,
      artistId,
      coverImage,
      releaseYear,
      description,
      isFeatured,
      songIds, // Optional array of song IDs to assign to this album
    } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ message: "عنوان آلبوم الزامی است." }, { status: 400 });
    }

    let finalArtistId = artistId;
    if (!finalArtistId) {
      const defaultArtist = await prisma.artist.findFirst();
      if (!defaultArtist) {
        return NextResponse.json({ message: "لطفاً ابتدا یک هنرمند تعریف کنید." }, { status: 400 });
      }
      finalArtistId = defaultArtist.id;
    }

    const cleanTitle = title.trim();
    const slug = `${cleanTitle
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const album = await prisma.album.create({
      data: {
        title: cleanTitle,
        slug,
        artistId: finalArtistId,
        coverImage: coverImage ? coverImage.trim() : null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        description: description ? description.trim() : null,
        isFeatured: !!isFeatured,
      },
    });

    // If songIds provided, connect them to this album
    if (Array.isArray(songIds) && songIds.length > 0) {
      await prisma.song.updateMany({
        where: { id: { in: songIds } },
        data: { albumId: album.id },
      });
    }

    const createdAlbum = await prisma.album.findUnique({
      where: { id: album.id },
      include: {
        artist: true,
        songs: {
          select: { id: true, title: true, duration: true, coverImage: true },
        },
      },
    });

    return NextResponse.json({ success: true, album: createdAlbum });
  } catch (err: any) {
    console.error("Error creating album:", err);
    return NextResponse.json({ message: "خطا در ایجاد آلبوم." }, { status: 500 });
  }
}
