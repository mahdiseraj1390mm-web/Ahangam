import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "TOP_SONGS_CONFIG" },
    });

    let config = {
      title: "برترین آهنگ‌های این هفته در آهنگام",
      subtitle: "جدول رسمی پرشنونده‌ترین و محبوب‌ترین قطعات موسیقی پاپ و سنتی",
      mode: "manual", // "manual" or "auto"
      songIds: [] as string[],
      isEnabled: true,
      limitCount: 8,
    };

    if (setting?.value) {
      try {
        config = { ...config, ...JSON.parse(setting.value) };
      } catch {}
    }

    return NextResponse.json({ config });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت تنظیمات برترین آهنگ‌ها." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title = "برترین آهنگ‌های این هفته در آهنگام",
      subtitle = "جدول رسمی پرشنونده‌ترین قطعات موسیقی",
      mode = "manual",
      songIds = [],
      isEnabled = true,
      limitCount = 8,
    } = body;

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      mode,
      songIds,
      isEnabled: !!isEnabled,
      limitCount: Number(limitCount) || 8,
      updatedAt: new Date().toISOString(),
    };

    await prisma.siteSetting.upsert({
      where: { key: "TOP_SONGS_CONFIG" },
      update: { value: JSON.stringify(payload) },
      create: {
        key: "TOP_SONGS_CONFIG",
        value: JSON.stringify(payload),
        group: "APPEARANCE",
        description: "تنظیمات و چیدمان بخش برترین آهنگ‌ها در صفحه اصلی",
      },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_TOP_SONGS_CONFIG",
          targetType: "SiteSetting",
          details: JSON.stringify(payload),
        },
      });
    }

    return NextResponse.json({ success: true, config: payload });
  } catch (err) {
    console.error("Save top songs error:", err);
    return NextResponse.json({ message: "خطا در ذخیره تنظیمات برترین آهنگ‌ها." }, { status: 500 });
  }
}
