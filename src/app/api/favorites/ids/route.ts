import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ids: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { songId: true },
    });

    const ids = favorites.map((f) => f.songId);
    return NextResponse.json({ ids });
  } catch (err) {
    return NextResponse.json({ ids: [] });
  }
}
