import { NextRequest, NextResponse } from "next/server";
import { checkAdminPermission } from "@/lib/auth";
import { put } from "@vercel/blob";
// @ts-ignore
import NodeID3 from "node-id3";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminPermission("SONGS_MANAGE");
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "هیچ فایلی ارسال نشده است." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read ID3 tags
    const tags = NodeID3.read(buffer);

    let extractedTitle = "";
    let extractedArtist = "";
    let extractedAlbum = "";
    let coverUrl: string | null = null;
    let hasCover = false;

    if (tags) {
      if (tags.title) {
        // Clean competitor watermarks (e.g., UpMusics, Nex1Music, etc.)
        extractedTitle = tags.title
          .replace(/~.*$/g, "")
          .replace(/[-_]\s*(UpMusics|Nex1Music|MusicFa|PopMusic|TabanMusic|GolsarMusic).*$/gi, "")
          .trim();
      }

      if (tags.artist) {
        extractedArtist = tags.artist.trim();
      }

      if (tags.album) {
        extractedAlbum = tags.album.trim();
      }

      // Check for embedded APIC cover image
      const rawImage = tags.image as any;
      if (rawImage && rawImage.imageBuffer && Buffer.isBuffer(rawImage.imageBuffer)) {
        try {
          // Convert embedded image to optimized square JPEG using Sharp
          const optimizedCoverBuffer = await sharp(rawImage.imageBuffer)
            .resize(600, 600, { fit: "cover" })
            .jpeg({ quality: 90 })
            .toBuffer();

          const safeFilename = `cover-extracted-${Date.now()}.jpg`;

          // 1. Try uploading to Vercel Blob
          if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
              const blob = await put(safeFilename, optimizedCoverBuffer, {
                access: "public",
                contentType: "image/jpeg",
                token: process.env.BLOB_READ_WRITE_TOKEN,
              });
              coverUrl = blob.url;
              hasCover = true;
            } catch (blobErr) {
              console.warn("Vercel blob put failed for extracted cover:", blobErr);
            }
          }

          // 2. Fallback to local storage
          if (!coverUrl) {
            const uploadDir = join(process.cwd(), "public", "uploads");
            await mkdir(uploadDir, { recursive: true });
            const filePath = join(uploadDir, safeFilename);
            await writeFile(filePath, optimizedCoverBuffer);
            coverUrl = `/uploads/${safeFilename}`;
            hasCover = true;
          }
        } catch (imgErr) {
          console.error("Failed to process extracted cover art:", imgErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      title: extractedTitle,
      artist: extractedArtist,
      album: extractedAlbum,
      coverUrl,
      hasCover,
    });
  } catch (error: any) {
    console.error("Metadata extraction error:", error);
    return NextResponse.json(
      { message: `خطا در استخراج متادیتا: ${error?.message || "خطای نامشخص"}` },
      { status: 500 }
    );
  }
}
