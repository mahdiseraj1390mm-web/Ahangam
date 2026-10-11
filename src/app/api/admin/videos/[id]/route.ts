import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      artistId,
      artistName,
      videoUrl,
      coverImage,
      duration,
      description,
      viewsCount,
      isFeatured,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl.trim();
    if (coverImage !== undefined) updateData.coverImage = coverImage.trim();
    if (duration !== undefined) updateData.duration = Number(duration);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (viewsCount !== undefined) updateData.viewsCount = Number(viewsCount);
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;

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
      updateData.artistId = targetArtist.id;
    } else if (artistId !== undefined) {
      updateData.artistId = artistId;
    }

    const updated = await prisma.musicVideo.update({
      where: { id },
      data: updateData,
      include: {
        artist: { select: { id: true, name: true } },
      },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_MUSIC_VIDEO",
          targetType: "MusicVideo",
          targetId: id,
          details: JSON.stringify(updateData),
        },
      });
    }

    return NextResponse.json({ success: true, video: updated });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ویرایش موزیک‌ویدیو." }, { status: 500 });
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

    await prisma.musicVideo.delete({
      where: { id },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_MUSIC_VIDEO",
          targetType: "MusicVideo",
          targetId: id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف موزیک‌ویدیو." }, { status: 500 });
  }
}
