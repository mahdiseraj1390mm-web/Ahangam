import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "احراز هویت الزامی است." }, { status: 401 });
    }

    const { id: playlistId } = await params;
    const { songId } = await req.json();

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ message: "پلی‌لیست یافت نشد یا متعلق به شما نیست." }, { status: 403 });
    }

    const count = await prisma.playlistSong.count({ where: { playlistId } });

    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
      update: {},
      create: {
        playlistId,
        songId,
        orderIndex: count + 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در افزودن آهنگ به پلی‌لیست." }, { status: 500 });
  }
}

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
    const { songId } = await req.json();

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف آهنگ از پلی‌لیست." }, { status: 500 });
  }
}
