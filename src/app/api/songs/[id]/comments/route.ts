import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getActiveUserId() {
  const sessionUser = await getCurrentUser();
  if (sessionUser) return sessionUser.id;

  let guest = await prisma.user.findFirst({
    where: { phone: "09999999999" },
    select: { id: true },
  });
  if (!guest) {
    guest = await prisma.user.create({
      data: {
        phone: "09999999999",
        displayName: "کاربر مهمان",
        passwordHash: "guest",
        role: "USER",
      },
      select: { id: true },
    });
  }
  return guest.id;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getActiveUserId();
    const { id } = await params;
    const body = await req.json();
    const text = body.text?.trim();

    if (!text || text.length < 2) {
      return NextResponse.json({ message: "متن نظر نمی‌تواند خالی باشد." }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        songId: id,
        userId,
        text,
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (err) {
    console.error("Comment error:", err);
    return NextResponse.json({ message: "خطا در ثبت نظر." }, { status: 500 });
  }
}
