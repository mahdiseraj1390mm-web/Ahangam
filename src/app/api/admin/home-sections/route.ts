import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { sections } = await req.json();

    if (Array.isArray(sections)) {
      for (const sec of sections) {
        await prisma.homeSection.update({
          where: { id: sec.id },
          data: {
            title: sec.title,
            sortOrder: Number(sec.sortOrder),
            isEnabled: !!sec.isEnabled,
            showOnMobile: !!sec.showOnMobile,
            showOnDesktop: !!sec.showOnDesktop,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ذخیره چیدمان." }, { status: 500 });
  }
}
