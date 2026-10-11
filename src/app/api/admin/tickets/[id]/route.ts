import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id: ticketId } = await params;
    const { status } = await req.json();

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err) {
    return NextResponse.json({ message: "خطا در به‌روزرسانی تیکت." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id: ticketId } = await params;
    const { message } = await req.json();

    const createdMsg = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: user!.id,
        senderRole: user!.role,
        senderName: user!.displayName,
        message,
      },
    });

    // Also update ticket status to IN_PROGRESS and updatedAt
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS", updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: createdMsg });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ارسال پاسخ." }, { status: 500 });
  }
}
