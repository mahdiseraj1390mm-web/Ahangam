import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
// @ts-ignore
import NodeID3 from "node-id3";
import sharp from "sharp";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const qualityReq = searchParams.get("quality") || "320";

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: true,
        album: true,
        qualities: true,
      },
    });

    if (!song) {
      return NextResponse.json({ message: "آهنگ یافت نشد." }, { status: 404 });
    }

    // Increment download count in background
    prisma.song
      .update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      })
      .catch(() => {});

    // Find requested or best quality
    const targetQuality =
      song.qualities.find((q) => q.quality === qualityReq) ||
      song.qualities.find((q) => q.quality === "320") ||
      song.qualities[0];

    if (!targetQuality?.fileUrl) {
      return NextResponse.json({ message: "فایل صوتی یافت نشد." }, { status: 404 });
    }

    // 1. Get raw audio buffer
    let audioBuffer: Buffer | null = null;
    const fileUrl = targetQuality.fileUrl;

    if (fileUrl.startsWith("/uploads/") || fileUrl.startsWith("/audio/")) {
      const localFilePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
      if (fs.existsSync(localFilePath)) {
        audioBuffer = fs.readFileSync(localFilePath);
      }
    }

    // If not local or file not found locally, fetch via HTTP
    if (!audioBuffer) {
      let fetchUrl = fileUrl;
      if (fileUrl.startsWith("/")) {
        fetchUrl = `${req.nextUrl.origin}${fileUrl}`;
      }
      const resp = await fetch(fetchUrl);
      if (!resp.ok) {
        return NextResponse.json({ message: "خطا در دریافت فایل صوتی." }, { status: 500 });
      }
      const arrayBuf = await resp.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuf);
    }

    // 2. Determine cover image:
    // Use the song's official cover image (whether auto-extracted or overridden by admin)
    let coverSource: string | null = song.coverImage;

    // Fallback to the site's default logo if no cover is set
    if (!coverSource || coverSource.trim() === "") {
      coverSource = "/logo.png";
    }

    let imageBuffer: Buffer | null = null;
    let imageMime = "image/jpeg";

    if (coverSource) {
      try {
        if (coverSource.startsWith("/")) {
          const localCoverPath = path.join(
            process.cwd(),
            "public",
            coverSource.replace(/^\//, "")
          );
          if (fs.existsSync(localCoverPath)) {
            imageBuffer = fs.readFileSync(localCoverPath);
          }
        }
        if (!imageBuffer) {
          let coverFetchUrl = coverSource;
          if (coverSource.startsWith("/")) {
            coverFetchUrl = `${getSiteUrl()}${coverSource}`;
          }
          const coverResp = await fetch(coverFetchUrl);
          if (coverResp.ok) {
            const coverArr = await coverResp.arrayBuffer();
            imageBuffer = Buffer.from(coverArr);
          }
        }

        // Standardize cover art to 600x600 square JPEG for 100% universal player compatibility
        if (imageBuffer) {
          try {
            imageBuffer = await sharp(imageBuffer)
              .resize(600, 600, { fit: "cover" })
              .jpeg({ quality: 90 })
              .toBuffer();
            imageMime = "image/jpeg";
          } catch (sharpErr) {
            console.warn("Sharp image conversion fallback:", sharpErr);
          }
        }
      } catch (err) {
        console.error("Failed to load cover image for tagging:", err);
      }
    }

    // Ensure fallback to site logo if image buffer still missing
    if (!imageBuffer) {
      try {
        const defaultLogoPath = path.join(process.cwd(), "public", "logo.png");
        let rawLogo: Buffer | null = null;
        if (fs.existsSync(defaultLogoPath)) {
          rawLogo = fs.readFileSync(defaultLogoPath);
        } else {
          const logoResp = await fetch(`${getSiteUrl()}/logo.png`);
          if (logoResp.ok) {
            rawLogo = Buffer.from(await logoResp.arrayBuffer());
          }
        }

        if (rawLogo) {
          imageBuffer = await sharp(rawLogo)
            .resize(600, 600, { fit: "contain", background: { r: 15, g: 23, b: 42, alpha: 1 } })
            .jpeg({ quality: 90 })
            .toBuffer();
          imageMime = "image/jpeg";
        }
      } catch (e) {
        console.warn("Could not prepare fallback logo for tagging:", e);
      }
    }

    // 3. Inject ID3 tags into audio buffer
    const tags: any = {
      title: song.title,
      artist: song.artist?.name || "Ahangam",
      album: song.album?.title || "رسانه موسیقی آهنگام",
      publisher: "آهنگام",
      comment: {
        language: "eng",
        text: "Downloaded from Ahangam (ahangam-b18n.vercel.app)",
      },
    };

    if (imageBuffer) {
      tags.image = {
        mime: imageMime,
        type: { id: 3, name: "front cover" },
        description: "Cover",
        imageBuffer: imageBuffer,
      };
    }

    let finalBuffer: Buffer = audioBuffer;
    try {
      // 1. Strip any pre-existing outdated ID3 tags and embedded album art from the uploaded MP3
      let cleanBuffer = audioBuffer;
      const stripped = (NodeID3 as any).removeTagsFromBuffer(audioBuffer);
      if (stripped && Buffer.isBuffer(stripped)) {
        cleanBuffer = stripped;
      }

      // 2. Write brand new tags including the chosen banner cover image or site default logo
      const tagged = NodeID3.write(tags, cleanBuffer);
      if (tagged && Buffer.isBuffer(tagged)) {
        finalBuffer = tagged;
      }
    } catch (tagErr) {
      console.warn("Could not tag MP3, serving original:", tagErr);
    }

    // 4. Return audio file stream with proper filename
    const safeTitle = (song.title || "audio").replace(/[^\w\u0600-\u06FF\s-]/g, "");
    const safeArtist = (song.artist?.name || "").replace(/[^\w\u0600-\u06FF\s-]/g, "");
    const filename = `${safeArtist ? safeArtist + " - " : ""}${safeTitle}.mp3`;
    const encodedFilename = encodeURIComponent(filename);

    return new Response(finalBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
        "Content-Length": finalBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Download error:", err);
    return NextResponse.json({ message: "خطا در دانلود آهنگ." }, { status: 500 });
  }
}
