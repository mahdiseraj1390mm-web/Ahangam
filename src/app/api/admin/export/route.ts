import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function GET() {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const [users, songs, artists, albums, auditLogs, siteSettings] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          phone: true,
          displayName: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.song.findMany({
        include: { artist: true, qualities: true },
      }),
      prisma.artist.findMany(),
      prisma.album.findMany(),
      prisma.adminAuditLog.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteSetting.findMany(),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      platform: "آهنگام (Ahangam)",
      version: "1.0.0",
      totalUsers: users.length,
      totalSongs: songs.length,
      data: {
        users,
        songs,
        artists,
        albums,
        auditLogs,
        siteSettings,
      },
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ahangam-backup-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "خطا در خروجی داده‌ها." }, { status: 500 });
  }
}
