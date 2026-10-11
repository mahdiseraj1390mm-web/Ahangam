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
    const userId = await getActiveUserId();
    const { id } = await params;
    const body = await req.json();
    const score = Number(body.score);

    if (isNaN(score) || score < 1 || score > 5) {
      return NextResponse.json({ message: "امتیاز نامعتبر است." }, { status: 400 });
    }

    // Upsert rating for this user and song (prevents duplicates)
    await prisma.rating.upsert({
      where: {
        userId_songId: {
          userId,
          songId: id,
        },
      },
      update: { score },
      create: {
        userId,
        songId: id,
        score,
      },
    });

    // Recalculate average
    const ratings = await prisma.rating.findMany({
      where: { songId: id },
    });

    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((acc, curr) => acc + curr.score, 0) / totalRatings
        : score;

    return NextResponse.json({
      success: true,
      score,
      averageRating,
      totalRatings,
    });
  } catch (err) {
    console.error("Rating error:", err);
    return NextResponse.json({ message: "خطا در پردازش امتیاز." }, { status: 500 });
  }
}
