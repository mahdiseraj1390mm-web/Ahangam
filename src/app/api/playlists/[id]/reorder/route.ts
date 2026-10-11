import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "احراز هویت الزامی است." }, { status: 401 });
    }

    const { id: playlistId } = await params;
    const { songIds } = await req.json();

    if (!Array.isArray(songIds)) {
      return NextResponse.json({ message: "آرایه شناسه‌های آهنگ نامعتبر است." }, { status: 400 });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json({ message: "دسترسی غیرمجاز به این پلی‌لیست." }, { status: 403 });
    }

    // Update orderIndex for each song sequentially or via transaction
    const updates = songIds.map((songId, index) =>
      prisma.playlistSong.updateMany({
        where: { playlistId, songId },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در چیدمان و ترتیب آهنگ‌ها." }, { status: 500 });
  }
}
