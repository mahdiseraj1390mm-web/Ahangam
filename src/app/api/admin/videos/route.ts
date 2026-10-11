import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const videos = await prisma.musicVideo.findMany({
      include: {
        artist: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ videos });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت موزیک‌ویدیوها." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      artistId,
      artistName,
      videoUrl,
      coverImage,
      duration = 0,
      description,
      isFeatured = false,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ message: "عنوان موزیک‌ویدیو الزامی است." }, { status: 400 });
    }

    if (!videoUrl || !videoUrl.trim()) {
      return NextResponse.json({ message: "فایل یا آدرس موزیک‌ویدیو الزامی است." }, { status: 400 });
    }

    // Resolve or create artist
    let finalArtistId = artistId;
    if (artistName && typeof artistName === "string" && artistName.trim()) {
      let targetArtist = await prisma.artist.findFirst({
        where: { name: artistName.trim() },
      });
      if (!targetArtist) {
        const cleanSlug = artistName.trim().replace(/[^\w\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-");
        targetArtist = await prisma.artist.create({
          data: {
            name: artistName.trim(),
            slug: `${cleanSlug || "artist"}-${Date.now().toString().slice(-4)}`,
            bio: "هنرمند آهنگام",
          },
        });
      }
      finalArtistId = targetArtist.id;
    }

    if (!finalArtistId) {
      const defaultArtist = await prisma.artist.findFirst();
      finalArtistId = defaultArtist?.id;
      if (!finalArtistId) {
        const created = await prisma.artist.create({
          data: { name: "بیتا", slug: "bita" },
        });
        finalArtistId = created.id;
      }
    }

    const cleanTitle = title.trim();
    const slug = `${cleanTitle
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const createdVideo = await prisma.musicVideo.create({
      data: {
        title: cleanTitle,
        slug,
        artistId: finalArtistId,
        videoUrl: videoUrl.trim(),
        coverImage: coverImage?.trim() || "/logo.png",
        duration: Number(duration) || 0,
        description: description?.trim() || null,
        isFeatured: !!isFeatured,
      },
      include: {
        artist: { select: { id: true, name: true } },
      },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_MUSIC_VIDEO",
          targetType: "MusicVideo",
          targetId: createdVideo.id,
          details: JSON.stringify({ title: createdVideo.title }),
        },
      });
    }

    return NextResponse.json({ success: true, video: createdVideo });
  } catch (err) {
    console.error("Create video error:", err);
    return NextResponse.json({ message: "خطا در ایجاد موزیک‌ویدیو." }, { status: 500 });
  }
}
