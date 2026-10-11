import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const guest = await prisma.user.findFirst({
        where: { phone: "09999999999" },
        select: { id: true },
      });
      userId = guest?.id;
    }

    if (!userId) {
      return NextResponse.json({ ids: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { songId: true },
    });

    const ids = favorites.map((f) => f.songId);
    return NextResponse.json({ ids });
  } catch (err) {
    return NextResponse.json({ ids: [] });
  }
}
