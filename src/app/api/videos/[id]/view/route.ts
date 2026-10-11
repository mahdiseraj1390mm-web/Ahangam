import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.musicVideo.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در به‌روزرسانی بازدید." }, { status: 500 });
  }
}
