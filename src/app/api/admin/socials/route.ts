import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function GET() {
  try {
    const socials = await prisma.socialLink.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ socials });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت لینک‌ها." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { platform, title, url, isEnabled, sortOrder } = await req.json();

    const social = await prisma.socialLink.create({
      data: {
        platform: platform || "CUSTOM",
        title: title.trim(),
        url: url.trim(),
        isEnabled: isEnabled !== undefined ? !!isEnabled : true,
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return NextResponse.json({ success: true, social });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ثبت لینک شبکه اجتماعی." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "شناسه الزامی است." }, { status: 400 });

    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف لینک." }, { status: 500 });
  }
}
