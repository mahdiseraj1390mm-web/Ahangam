import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ playlists: [] });
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ playlists });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت پلی‌لیست‌ها." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "برای ساخت پلی‌لیست لطفاً ابتدا وارد حساب خود شوید." },
        { status: 401 }
      );
    }

    const { title, description } = await req.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ message: "عنوان پلی‌لیست الزامی است." }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const slug = `${cleanTitle
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const playlist = await prisma.playlist.create({
      data: {
        title: cleanTitle,
        slug,
        description: description?.trim() || null,
        userId: user.id,
        isSystem: false,
        isPublic: true,
      },
    });

    return NextResponse.json({ success: true, playlist });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ایجاد پلی‌لیست." }, { status: 500 });
  }
}
