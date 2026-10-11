"use client";

import React, { useState } from "react";
import { StoryItem } from "@/types";
import { PlusCircle, Sparkles, Trash2, ExternalLink, Upload } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

export function StoriesAdminClient({ initialStories }: { initialStories: StoryItem[] }) {
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim(),
          mediaUrl: mediaUrl.trim(),
          targetUrl: targetUrl.trim(),
          sortOrder: Number(sortOrder),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStories([...stories, data.story]);
        setTitle("");
        setCaption("");
        setMediaUrl("");
        setTargetUrl("");
      } else {
        alert(data.message || "خطا در ثبت استوری.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این استوری اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStories(stories.filter((s) => s.id !== id));
      }
    } catch {
      alert("خطا در حذف.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Story Form */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
        <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <span>ایجاد استوری جدید</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              عنوان استوری *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قطعه جدید بیتا منتشر شد!"
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              تصویر یا ویدیوی استوری *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="آدرس اینترنتی یا آپلود فایل"
                className="flex-1 p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
              <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand/20 shrink-0">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "در حال آپلود..." : "آپلود"}</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setIsUploading(true);
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/upload", { method: "POST", body: fd });
                      const d = await res.json();
                      if (res.ok && d.url) {
                        setMediaUrl(d.url);
                      } else {
                        alert(d.message || "خطا در آپلود.");
                      }
                    } catch {
                      alert("خطای سرور هنگام آپلود فایل.");
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              لینک مقصد (آهنگ یا هنرمند)
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="/song/bita-souvenir-violet"
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              ترتیب نمایش (اولویت)
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              متن کپشن زیر استوری
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="همین حالا در آهنگام گوش دهید..."
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت و انتشار استوری"}
            </button>
          </div>
        </form>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stories.map((s) => (
          <div
            key={s.id}
            className="p-3 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-2 relative group"
          >
            <div className="aspect-[9/16] w-full rounded-xl overflow-hidden bg-surface-100 relative">
              <img src={s.mediaUrl} alt={s.title} className="w-full h-full object-cover" />
              <button
                onClick={() => handleDelete(s.id)}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs font-bold text-content-primary truncate">{s.title}</p>
            {s.targetUrl && (
              <span className="text-[10px] text-brand flex items-center gap-1 truncate">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.targetUrl}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
