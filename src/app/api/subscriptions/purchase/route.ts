import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ subscription: null, pendingRequest: null });
    }

    const [activeSub, pendingSub] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: { userId: user.id, status: "ACTIVE", endsAt: { gt: new Date() } },
        include: { plan: true },
        orderBy: { endsAt: "desc" },
      }),
      prisma.userSubscription.findFirst({
        where: { userId: user.id, status: { in: ["PENDING", "REJECTED"] } },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Also get bank card settings
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ["BANK_CARD_NUMBER", "BANK_CARD_HOLDER", "BANK_NAME"] } },
    });

    const bankInfo = {
      cardNumber: settings.find((s) => s.key === "BANK_CARD_NUMBER")?.value || "۶۰۳۷-۹۹۷۵-۰۰۰۰-۰۰۰۰",
      cardHolder: settings.find((s) => s.key === "BANK_CARD_HOLDER")?.value || "بیتا",
      bankName: settings.find((s) => s.key === "BANK_NAME")?.value || "بانک ملی",
    };

    return NextResponse.json({
      activeSubscription: activeSub,
      pendingSubscription: pendingSub,
      bankInfo,
    });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت وضعیت اشتراک." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      );
    }

    const { planId, receiptImage, transactionRef } = await req.json();

    if (!planId) {
      return NextResponse.json({ message: "انتخاب پلن الزامی است." }, { status: 400 });
    }

    if (!receiptImage) {
      return NextResponse.json(
        { message: "لطفاً تصویر فیش واریزی خود را آپلود کنید." },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ message: "پلن انتخابی معتبر نیست." }, { status: 404 });
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        startsAt,
        endsAt,
        status: "PENDING",
        receiptImage,
        transactionRef: transactionRef?.trim() || null,
        amountPaid: plan.price,
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
      message: "فیش واریزی شما با موفقیت ثبت شد و در انتظار تایید مدیریت قرار گرفت.",
    });
  } catch (err: any) {
    console.error("Subscription purchase error:", err);
    return NextResponse.json({ message: "خطا در ثبت درخواست اشتراک." }, { status: 500 });
  }
}
