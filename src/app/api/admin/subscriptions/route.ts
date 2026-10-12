import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission("USERS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: { select: { id: true, displayName: true, phone: true, role: true } },
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت لیست اشتراک‌ها." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, user: adminUser } = await checkAdminPermission("USERS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const { id, action, rejectReason } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ message: "شناسه و عملیات الزامی است." }, { status: 400 });
    }

    const sub = await prisma.userSubscription.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!sub) {
      return NextResponse.json({ message: "درخواست اشتراک یافت نشد." }, { status: 404 });
    }

    if (action === "APPROVE") {
      const now = new Date();
      const endsAt = new Date(now.getTime() + sub.plan.durationDays * 24 * 60 * 60 * 1000);

      // 1. Activate subscription
      const updatedSub = await prisma.userSubscription.update({
        where: { id },
        data: {
          status: "ACTIVE",
          startsAt: now,
          endsAt: endsAt,
          rejectReason: null,
        },
      });

      // 2. Upgrade user role to VIP (unless user is already an ADMIN or SUPER_ADMIN)
      const targetUser = await prisma.user.findUnique({
        where: { id: sub.userId },
        select: { role: true },
      });

      await prisma.user.update({
        where: { id: sub.userId },
        data: {
          role:
            targetUser?.role === "SUPER_ADMIN" || targetUser?.role === "ADMIN"
              ? targetUser.role
              : "VIP",
          subscriptionExpiresAt: endsAt,
        },
      });

      // 3. Audit log
      if (adminUser) {
        await prisma.adminAuditLog.create({
          data: {
            userId: adminUser.id,
            action: "APPROVE_SUBSCRIPTION",
            targetType: "UserSubscription",
            targetId: id,
            details: JSON.stringify({ userId: sub.userId, planName: sub.plan.name }),
          },
        });
      }

      return NextResponse.json({ success: true, status: "ACTIVE", subscription: updatedSub });
    } else if (action === "REJECT") {
      const reason = rejectReason?.trim() || "فیش واریزی معتبر نیست یا مبلغ واریز شده ناقص است.";

      // 1. Reject subscription
      const updatedSub = await prisma.userSubscription.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectReason: reason,
        },
      });

      // 2. Audit log
      if (adminUser) {
        await prisma.adminAuditLog.create({
          data: {
            userId: adminUser.id,
            action: "REJECT_SUBSCRIPTION",
            targetType: "UserSubscription",
            targetId: id,
            details: JSON.stringify({ userId: sub.userId, reason }),
          },
        });
      }

      return NextResponse.json({ success: true, status: "REJECTED", subscription: updatedSub });
    }

    return NextResponse.json({ message: "عملیات نامعتبر است." }, { status: 400 });
  } catch (err: any) {
    console.error("Admin subscription review error:", err);
    return NextResponse.json({ message: "خطا در بررسی اشتراک." }, { status: 500 });
  }
}
