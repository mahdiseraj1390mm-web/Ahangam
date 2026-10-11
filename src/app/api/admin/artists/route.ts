import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { name, bio, image, isFeatured, followersCount } = await req.json();

    const cleanName = name.trim();
    const slug = `${cleanName
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const artist = await prisma.artist.create({
      data: {
        name: cleanName,
        slug,
        bio: bio || null,
        image: image || null,
        isFeatured: !!isFeatured,
        followersCount: Number(followersCount) || 0,
      },
    });

    return NextResponse.json({ success: true, artist });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ثبت هنرمند." }, { status: 500 });
  }
}
