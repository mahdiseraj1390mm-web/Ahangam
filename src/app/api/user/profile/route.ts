import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ message: "احراز هویت الزامی است." }, { status: 401 });
    }

    const { displayName, password } = await req.json();

    const updateData: any = {};
    if (displayName && displayName.trim()) {
      updateData.displayName = displayName.trim();
    }
    if (password && password.length >= 6) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ویرایش اطلاعات پروفایل." }, { status: 500 });
  }
}
