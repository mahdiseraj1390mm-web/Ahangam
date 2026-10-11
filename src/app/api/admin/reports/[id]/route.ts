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

    const { id } = await params;
    const { status } = await req.json();

    const updated = await prisma.contentReport.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (err) {
    return NextResponse.json({ message: "خطا در ویرایش وضعیت گزارش." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.contentReport.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف گزارش." }, { status: 500 });
  }
}
