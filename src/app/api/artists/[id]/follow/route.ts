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
      return NextResponse.json(
        { message: "برای دنبال کردن هنرمند لطفاً ابتدا وارد حساب خود شوید." },
        { status: 401 }
      );
    }

    const { id: artistId } = await params;

    const existing = await prisma.follow.findUnique({
      where: {
        userId_artistId: {
          userId: user.id,
          artistId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: { id: existing.id },
      });
      await prisma.artist.update({
        where: { id: artistId },
        data: { followersCount: { decrement: 1 } },
      });
      return NextResponse.json({ success: true, isFollowing: false });
    } else {
      await prisma.follow.create({
        data: {
          userId: user.id,
          artistId,
        },
      });
      await prisma.artist.update({
        where: { id: artistId },
        data: { followersCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true, isFollowing: true });
    }
  } catch (err) {
    return NextResponse.json({ message: "خطا در عملیات دنبال کردن." }, { status: 500 });
  }
}
