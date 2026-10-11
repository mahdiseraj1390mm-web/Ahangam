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
    const { name, bio, image, isFeatured, followersCount } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
    if (image !== undefined) updateData.image = image ? image.trim() : null;
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;
    if (followersCount !== undefined) updateData.followersCount = Math.max(0, Number(followersCount));

    const artist = await prisma.artist.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, artist });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ویرایش هنرمند." }, { status: 500 });
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

    // Check if artist has songs
    const songsCount = await prisma.song.count({ where: { artistId: id } });
    if (songsCount > 0) {
      return NextResponse.json(
        { message: `این هنرمند دارای ${songsCount} قطعه موسیقی است. ابتدا قطعات او را حذف یا به هنرمند دیگر منتقل کنید.` },
        { status: 400 }
      );
    }

    await prisma.artist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف هنرمند." }, { status: 500 });
  }
}
