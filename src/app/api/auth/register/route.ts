import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, displayName, password } = await req.json();

    if (!phone || !displayName || !password) {
      return NextResponse.json(
        { message: "لطفاً تمامی فیلدهای الزامی را تکمیل کنید." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/^(\+98|0098)/, "0");
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { message: "فرمت شماره تلفن صحیح نیست. لطفاً شماره معتبر وارد کنید (مثال: 09123456789)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "طول رمز عبور باید حداقل ۶ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "حساب کاربری با این شماره همراه قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        displayName: displayName.trim(),
        passwordHash,
        role: "USER",
      },
    });

    const token = signSessionToken({
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set("ahangam_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ message: "خطای سرور در ثبت‌نام." }, { status: 500 });
  }
}
