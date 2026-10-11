import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { settings } = await req.json();

    if (settings && typeof settings === "object") {
      for (const [key, val] of Object.entries(settings)) {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: String(val) },
          create: {
            key,
            value: String(val),
            group: key.includes("THEME") ? "THEME" : "GENERAL",
          },
        });
      }
    }

    await prisma.adminAuditLog.create({
      data: {
        userId: user!.id,
        action: "UPDATE_SETTINGS",
        targetType: "SiteSetting",
        details: JSON.stringify(settings),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ذخیره تنظیمات." }, { status: 500 });
  }
}
