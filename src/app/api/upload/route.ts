import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز. لطفا وارد حساب مدیریت شوید." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "هیچ فایلی ارسال نشده است." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save under public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const cleanFilename = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const filePath = join(uploadDir, cleanFilename);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${cleanFilename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "خطا در آپلود فایل." }, { status: 500 });
  }
}
