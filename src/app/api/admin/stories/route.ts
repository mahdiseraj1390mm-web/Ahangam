import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission("STORIES_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { title, caption, mediaUrl, targetUrl, sortOrder } = await req.json();

    const story = await prisma.story.create({
      data: {
        title,
        caption: caption || null,
        mediaUrl,
        mediaType: "IMAGE",
        targetUrl: targetUrl || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, story });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ایجاد استوری." }, { status: 500 });
  }
}
