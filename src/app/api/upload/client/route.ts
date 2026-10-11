import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminPermission } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => {
        const { authorized } = await checkAdminPermission();
        if (!authorized) {
          throw new Error("دسترسی غیرمجاز. لطفا وارد حساب مدیریت شوید.");
        }

        return {
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB per file
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("handleUpload error:", error);
    return NextResponse.json(
      { error: error?.message || "خطا در ایجاد توکن آپلود" },
      { status: 400 }
    );
  }
}
