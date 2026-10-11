import { NextRequest, NextResponse } from "next/server";
import { checkAdminPermission } from "@/lib/auth";
import { put } from "@vercel/blob";

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

    const cleanFilename = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;

    // Upload directly to Vercel Blob cloud storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(cleanFilename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ success: true, url: blob.url });
    }

    // Fallback: try default put without explicit token (Vercel auto-injects it)
    try {
      const blob = await put(cleanFilename, file, {
        access: "public",
      });
      return NextResponse.json({ success: true, url: blob.url });
    } catch (blobErr) {
      console.warn("Direct blob put failed, checking local filesystem:", blobErr);
    }

    // Fallback for local development
    const { writeFile, mkdir } = await import("fs/promises");
    const { join } = await import("path");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, cleanFilename);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${cleanFilename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ message: "خطا در آپلود فایل." }, { status: 500 });
  }
}
