import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { message: "شماره تلفن و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/^(\+98|0098)/, "0");

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      return NextResponse.json(
        { message: "شماره تلفن یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { message: "حساب کاربری شما توسط مدیریت مسدود شده است." },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "شماره تلفن یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    let permissions: string[] = [];
    if (user.permissions) {
      try {
        permissions = JSON.parse(user.permissions);
      } catch {}
    }

    const token = signSessionToken({
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      role: user.role,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
        permissions,
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
    console.error("Login error:", err);
    return NextResponse.json({ message: "خطای سرور در ورود." }, { status: 500 });
  }
}
