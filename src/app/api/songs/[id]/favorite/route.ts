import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getActiveUserId() {
  const sessionUser = await getCurrentUser();
  if (sessionUser) return sessionUser.id;

  let guest = await prisma.user.findFirst({
    where: { phone: "09999999999" },
    select: { id: true },
  });
  if (!guest) {
    guest = await prisma.user.create({
      data: {
        phone: "09999999999",
        displayName: "کاربر مهمان",
        passwordHash: "guest",
        role: "USER",
      },
      select: { id: true },
    });
  }
  return guest.id;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      // Guest toggling: succeed gracefully without modifying DB
      return NextResponse.json({ success: true, isGuest: true });
    }

    const { id: songId } = await params;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_songId: {
          userId: user.id,
          songId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          songId,
        },
      });
      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (err) {
    console.error("Favorite error:", err);
    return NextResponse.json({ message: "خطا در پردازش نشان کردن قطعه." }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isFavorite: false });
    }

    const { id: songId } = await params;
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_songId: {
          userId: user.id,
          songId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!fav });
  } catch (err) {
    return NextResponse.json({ isFavorite: false });
  }
}
