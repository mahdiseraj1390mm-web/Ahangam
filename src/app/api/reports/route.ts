import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const { contentType, contentId, reason, description } = body;

    const report = await prisma.contentReport.create({
      data: {
        contentType: contentType || "SONG",
        contentId: contentId || "unknown",
        reason: reason || "سایر موارد",
        description: description || "",
        reporterUserId: user?.id || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ثبت گزارش." }, { status: 500 });
  }
}
