import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "FEATURED_SONG_OF_THE_DAY" },
    });

    if (!setting || !setting.value) {
      return NextResponse.json({ featured: null });
    }

    const data = JSON.parse(setting.value);
    let song = null;
    if (data.songId) {
      song = await prisma.song.findUnique({
        where: { id: data.songId },
        include: {
          artist: true,
          qualities: true,
        },
      });
    }

    return NextResponse.json({
      featured: {
        ...data,
        song,
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "خطا در دریافت آهنگ ویژه روز." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    const body = await req.json();
    const {
      songId,
      title,
      subtitle,
      badgeTitle,
      bannerImage,
      audioUrl,
      audioDuration = 0,
      artistName,
      isEnabled = true,
    } = body;

    // Determine effective banner image:
    // If a new image was uploaded/selected, use it.
    // If not selected, strictly fallback to the site's default image (/logo.png), NEVER the song's previous cover.
    const effectiveBannerImage =
      bannerImage && bannerImage.trim() !== "" ? bannerImage.trim() : "/logo.png";

    // Resolve or create artist
    let targetArtist = null;
    if (artistName && artistName.trim() !== "") {
      const cleanArtistName = artistName.trim();
      targetArtist = await prisma.artist.findFirst({
        where: { name: { contains: cleanArtistName } },
      });
      if (!targetArtist) {
        const cleanSlug = cleanArtistName
          .toLowerCase()
          .replace(/[^\w\u0600-\u06FF\s-]/g, "")
          .replace(/\s+/g, "-");
        targetArtist = await prisma.artist.create({
          data: {
            name: cleanArtistName,
            slug: `${cleanSlug || "artist"}-${Date.now().toString().slice(-4)}`,
            bio: "هنرمند آهنگام",
          },
        });
      }
    }

    if (!targetArtist) {
      targetArtist = await prisma.artist.findFirst({
        where: { name: "بیتا" },
      });
      if (!targetArtist) {
        targetArtist = await prisma.artist.findFirst();
      }
      if (!targetArtist) {
        targetArtist = await prisma.artist.create({
          data: {
            name: "بیتا",
            slug: "bita",
            bio: "هنرمند آهنگام",
          },
        });
      }
    }

    let finalSongId = songId;
    const songTitle = title?.trim() || "قطعه ویژه";

    // 1. If a new audio file was uploaded, create or update the song with this audio URL
    if (audioUrl && audioUrl.trim() !== "") {
      const cleanAudioUrl = audioUrl.trim();

      // If an existing songId was supplied, update it with the new audio and image
      if (finalSongId) {
        const existing = await prisma.song.findUnique({ where: { id: finalSongId } });
        if (existing) {
          await prisma.song.update({
            where: { id: finalSongId },
            data: {
              title: songTitle,
              duration: Number(audioDuration) || existing.duration,
              coverImage: effectiveBannerImage,
              artistId: targetArtist.id,
            },
          });

          // Replace audio qualities with the newly uploaded audio file
          await prisma.songQuality.deleteMany({ where: { songId: finalSongId } });
          await prisma.songQuality.create({
            data: {
              songId: finalSongId,
              quality: "320",
              fileUrl: cleanAudioUrl,
              isDefault: true,
            },
          });
        } else {
          finalSongId = null;
        }
      }

      // If no valid existing song, create a fresh song entry
      if (!finalSongId) {
        const cleanSlugTitle = songTitle
          .toLowerCase()
          .replace(/[^\w\u0600-\u06FF\s-]/g, "")
          .replace(/\s+/g, "-");
        const slug = `${cleanSlugTitle || "featured"}-${Date.now().toString().slice(-4)}`;

        const createdSong = await prisma.song.create({
          data: {
            title: songTitle,
            slug,
            duration: Number(audioDuration) || 0,
            coverImage: effectiveBannerImage,
            status: "PUBLISHED",
            isFeatured: true,
            artistId: targetArtist.id,
            qualities: {
              create: [
                {
                  quality: "320",
                  fileUrl: cleanAudioUrl,
                  isDefault: true,
                },
              ],
            },
          },
        });
        finalSongId = createdSong.id;
      }
    } else if (finalSongId) {
      // If no new audio file uploaded, but existing songId is selected:
      // Update the song's title, artist and coverImage in DB to the newly chosen image or /logo.png
      await prisma.song.update({
        where: { id: finalSongId },
        data: {
          title: title?.trim() || undefined,
          coverImage: effectiveBannerImage,
          artistId: targetArtist?.id || undefined,
        },
      });
    }

    if (!finalSongId && isEnabled) {
      return NextResponse.json(
        { message: "لطفاً ابتدا فایل صوتی آهنگ را برای این بنر آپلود کنید." },
        { status: 400 }
      );
    }

    const effectiveSubtitle =
      subtitle?.trim() || `اثری شنیدنی با صدای ${targetArtist?.name || "بیتا"}`;

    const payload = {
      songId: finalSongId,
      title: songTitle,
      subtitle: effectiveSubtitle,
      badgeTitle: badgeTitle || "پیشنهاد ویژه روز در آهنگام",
      bannerImage: effectiveBannerImage,
      isEnabled: !!isEnabled,
      updatedAt: new Date().toISOString(),
    };

    await prisma.siteSetting.upsert({
      where: { key: "FEATURED_SONG_OF_THE_DAY" },
      update: { value: JSON.stringify(payload) },
      create: {
        key: "FEATURED_SONG_OF_THE_DAY",
        value: JSON.stringify(payload),
        group: "APPEARANCE",
        description: "آهنگ پیشنهاد ویژه روز در صفحه اصلی",
      },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "UPDATE_FEATURED_SONG_OF_DAY",
          targetType: "SiteSetting",
          details: JSON.stringify(payload),
        },
      });
    }

    // Fetch the updated song object with artist & qualities to return to frontend
    const updatedSong = await prisma.song.findUnique({
      where: { id: finalSongId },
      include: { artist: true, qualities: true },
    });

    return NextResponse.json({
      success: true,
      featured: payload,
      songId: finalSongId,
      song: updatedSong,
    });
  } catch (err) {
    console.error("Save daily featured error:", err);
    return NextResponse.json({ message: "خطا در ثبت پیشنهاد ویژه روز." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { authorized, user } = await checkAdminPermission();
    if (!authorized) {
      return NextResponse.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
    }

    await prisma.siteSetting.deleteMany({
      where: { key: "FEATURED_SONG_OF_THE_DAY" },
    });

    if (user) {
      await prisma.adminAuditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_FEATURED_SONG_OF_DAY",
          targetType: "SiteSetting",
          details: JSON.stringify({ deleted: true }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "خطا در حذف پیشنهاد ویژه روز." }, { status: 500 });
  }
}
