import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      );
    }

    const { planId } = await req.json();
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ message: "پلن انتخابی معتبر نیست." }, { status: 404 });
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Create user subscription record
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        startsAt,
        endsAt,
        status: "ACTIVE",
        transactionRef: `AHANGAM-TX-${Date.now()}`,
        amountPaid: plan.price,
      },
    });

    // Upgrade user to VIP with expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "VIP",
        subscriptionExpiresAt: endsAt,
      },
    });

    return NextResponse.json({ success: true, planName: plan.name, endsAt });
  } catch (err) {
    return NextResponse.json({ message: "خطا در پردازش خرید اشتراک." }, { status: 500 });
  }
}
