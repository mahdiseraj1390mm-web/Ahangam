import React from "react";
import { prisma } from "@/lib/prisma";
import { StoriesAdminClient } from "./StoriesAdminClient";
import { StoryItem } from "@/types";

export const revalidate = 0;

export default async function AdminStoriesPage() {
  const storiesRaw = await prisma.story.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const stories: StoryItem[] = storiesRaw.map((s) => ({
    ...s,
    mediaType: s.mediaType as "IMAGE" | "VIDEO",
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-content-primary">مدیریت استوری‌ها</h1>
        <p className="text-xs text-content-muted">
          انتشار محتوای موقت تصویری و ویدیویی برای اطلاع‌رسانی آثار جدید در صفحه اصلی
        </p>
      </div>

      <StoriesAdminClient initialStories={stories} />
    </div>
  );
}
