import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission("SONGS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { songIds, action, value } = await req.json();

    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json({ message: "هیچ آهنگی انتخاب نشده است." }, { status: 400 });
    }

    if (action === "DELETE") {
      await prisma.song.deleteMany({
        where: { id: { in: songIds } },
      });
    } else if (action === "CHANGE_STATUS") {
      await prisma.song.updateMany({
        where: { id: { in: songIds } },
        data: { status: value as any },
      });
    } else if (action === "TOGGLE_FEATURED") {
      await prisma.song.updateMany({
        where: { id: { in: songIds } },
        data: { isFeatured: !!value },
      });
    }

    // Record audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: user!.id,
        action: `BULK_${action}`,
        targetType: "Song",
        details: JSON.stringify({ count: songIds.length, action, value }),
      },
    });

    return NextResponse.json({ success: true, count: songIds.length });
  } catch (err) {
    return NextResponse.json({ message: "خطا در انجام عملیات گروهی." }, { status: 500 });
  }
}
