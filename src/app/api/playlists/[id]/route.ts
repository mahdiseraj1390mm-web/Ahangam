import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "احراز هویت الزامی است." }, { status: 401 });
    }

    const { id: playlistId } = await params;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json({ message: "پلی‌لیست یافت نشد." }, { status: 404 });
    }

    if (playlist.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    // Delete playlist songs and playlist
    await prisma.playlistSong.deleteMany({ where: { playlistId } });
    await prisma.playlist.delete({ where: { id: playlistId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف پلی‌لیست." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "احراز هویت الزامی است." }, { status: 401 });
    }

    const { id: playlistId } = await params;
    const { title, description } = await req.json();

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        title: title?.trim() || playlist.title,
        description: description?.trim() || playlist.description,
      },
    });

    return NextResponse.json({ success: true, playlist: updated });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ویرایش پلی‌لیست." }, { status: 500 });
  }
}
