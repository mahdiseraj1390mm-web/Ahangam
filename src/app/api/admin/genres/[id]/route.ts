import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/genres/[id] - Update a genre
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const { name, slug, description, isMood } = await request.json();
    const genreId = params.id;

    const dataToUpdate: any = {};
    if (name && typeof name === "string") dataToUpdate.name = name.trim();
    if (slug && typeof slug === "string") dataToUpdate.slug = slug.trim().toLowerCase();
    if (description !== undefined) dataToUpdate.description = description ? String(description).trim() : null;
    if (isMood !== undefined) dataToUpdate.isMood = Boolean(isMood);

    const updated = await prisma.genre.update({
      where: { id: genreId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "سبک با موفقیت ویرایش شد",
      genre: updated,
    });
  } catch (error) {
    console.error("Update genre error:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش سبک" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/genres/[id] - Delete a genre and its connections
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    return NextResponse.json({ error: "عدم دسترسی" }, { status: 403 });
  }

  try {
    const genreId = params.id;

    // Delete relation records first, then the genre
    await prisma.songGenre.deleteMany({
      where: { genreId },
    });

    await prisma.genre.delete({
      where: { id: genreId },
    });

    return NextResponse.json({
      success: true,
      message: "سبک با موفقیت حذف شد",
    });
  } catch (error) {
    console.error("Delete genre error:", error);
    return NextResponse.json(
      { error: "خطا در حذف سبک" },
      { status: 500 }
    );
  }
}
