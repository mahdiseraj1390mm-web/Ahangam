import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/genres - List all genres with their song counts and songs
export async function GET() {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const genres = await prisma.genre.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
        },
      },
    });

    const formatted = genres.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      isMood: g.isMood,
      songCount: g.songs.length,
      songs: g.songs.map((sg) => sg.song),
    }));

    return NextResponse.json({ success: true, genres: formatted });
  } catch (error) {
    console.error("Fetch genres error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست سبک‌ها" },
      { status: 500 }
    );
  }
}

// POST /api/admin/genres - Create a new genre / mood
export async function POST(request: Request) {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, isMood } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "نام سبک الزامی است" }, { status: 400 });
    }

    const trimmedName = name.trim();
    // Generate clean slug if not provided
    const cleanSlug = (slug && typeof slug === "string" && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-")
      : `genre-${Date.now()}`;

    // Check if name or slug already exists
    const existing = await prisma.genre.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug: cleanSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "سبکی با این نام یا شناسه انگلیسی قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    const maxSort = await prisma.genre.aggregate({
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxSort._max.sortOrder || 0) + 1;

    const newGenre = await prisma.genre.create({
      data: {
        name: trimmedName,
        slug: cleanSlug,
        description: description ? String(description).trim() : null,
        isMood: Boolean(isMood),
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      message: "سبک جدید با موفقیت ایجاد شد",
      genre: {
        ...newGenre,
        songCount: 0,
        songs: [],
      },
    });
  } catch (error) {
    console.error("Create genre error:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد سبک جدید" },
      { status: 500 }
    );
  }
}
