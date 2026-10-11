import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/admin/genres/[id]/songs - Add a song to this genre
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const { songId } = await request.json();
    if (!songId) {
      return NextResponse.json({ error: "شناسه آهنگ الزامی است" }, { status: 400 });
    }

    const genreId = params.id;

    // Check if already in genre
    const existing = await prisma.songGenre.findUnique({
      where: {
        songId_genreId: {
          songId,
          genreId,
        },
      },
    });

    if (!existing) {
      await prisma.songGenre.create({
        data: {
          songId,
          genreId,
        },
      });
    }

    return NextResponse.json({ success: true, message: "آهنگ به این سبک اضافه شد" });
  } catch (error) {
    console.error("Add song to genre error:", error);
    return NextResponse.json({ error: "خطا در افزودن آهنگ به سبک" }, { status: 500 });
  }
}

// DELETE /api/admin/genres/[id]/songs?songId=... - Remove a song from this genre
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const songId = searchParams.get("songId");
    if (!songId) {
      return NextResponse.json({ error: "شناسه آهنگ الزامی است" }, { status: 400 });
    }

    const genreId = params.id;

    await prisma.songGenre.deleteMany({
      where: {
        songId,
        genreId,
      },
    });

    return NextResponse.json({ success: true, message: "آهنگ از این سبک حذف شد" });
  } catch (error) {
    console.error("Remove song from genre error:", error);
    return NextResponse.json({ error: "خطا در حذف آهنگ از سبک" }, { status: 500 });
  }
}
