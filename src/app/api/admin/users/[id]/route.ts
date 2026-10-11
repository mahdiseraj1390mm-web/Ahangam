import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await getCurrentUser();
    if (!currentAdmin || (currentAdmin.role !== "ADMIN" && currentAdmin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const body = await req.json();

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "کاربر یافت نشد." }, { status: 404 });
    }

    // Protection rule from Proposal Section 15:
    // Sub-admins cannot remove, ban, or alter Super Admin
    if (targetUser.role === "SUPER_ADMIN" && currentAdmin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "شما مجوز تغییر یا مسدودسازی مدیر ارشد را ندارید." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName.trim();
    if (body.role !== undefined) updateData.role = body.role;
    if (body.isBanned !== undefined) updateData.isBanned = body.isBanned;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
    });

    // Record audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: currentAdmin.id,
        action: "UPDATE_USER_ROLE",
        targetType: "User",
        targetId: targetUserId,
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return NextResponse.json({ message: "خطا در به‌روزرسانی کاربر." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await getCurrentUser();
    if (!currentAdmin || (currentAdmin.role !== "ADMIN" && currentAdmin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id: targetUserId } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "کاربر یافت نشد." }, { status: 404 });
    }

    // Protection rule from Proposal Section 15:
    // Sub-admins cannot remove Super Admin
    if (targetUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "حذف مدیر ارشد سیستم امکان‌پذیر نیست." },
        { status: 403 }
      );
    }

    // Prevent deleting oneself
    if (targetUser.id === currentAdmin.id) {
      return NextResponse.json(
        { message: "نمی‌توانید حساب کاربری خودتان را حذف کنید." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    await prisma.adminAuditLog.create({
      data: {
        userId: currentAdmin.id,
        action: "DELETE_USER",
        targetType: "User",
        targetId: targetUserId,
        details: JSON.stringify({ phone: targetUser.phone, displayName: targetUser.displayName }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف کاربر." }, { status: 500 });
  }
}
