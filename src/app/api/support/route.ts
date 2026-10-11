import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { name, contact, subject, category, message } = await req.json();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user?.id || null,
        name,
        contact,
        subject: subject || "درخواست پشتیبانی",
        category: category || "TECHNICAL",
        status: "OPEN",
        messages: {
          create: {
            senderId: user?.id || null,
            senderRole: user ? user.role : "USER",
            senderName: name,
            message,
          },
        },
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ثبت درخواست پشتیبانی." }, { status: 500 });
  }
}
