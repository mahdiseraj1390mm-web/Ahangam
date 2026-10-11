"use client";

import React, { useState } from "react";
import { ArtistItem } from "@/types";
import { PlusCircle, Radio, Trash2, Check, AlertCircle, Edit3, X, Upload } from "lucide-react";
import { formatNumberPersian } from "@/lib/utils";

export function ArtistsAdminClient({ initialArtists }: { initialArtists: ArtistItem[] }) {
  const [artists, setArtists] = useState<ArtistItem[]>(initialArtists);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Edit artist state
  const [editingArtist, setEditingArtist] = useState<ArtistItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editFollowersCount, setEditFollowersCount] = useState<number>(0);
  const [editFeatured, setEditFeatured] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleUploadImageFile = async (file: File, isEdit: boolean) => {
    try {
      if (isEdit) setIsUploadingEditImage(true);
      else setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (isEdit) setEditImage(data.url);
        else setImage(data.url);
      } else {
        alert(data.message || "خطا در آپلود تصویر.");
      }
    } catch {
      alert("خطای سرور هنگام آپلود تصویر.");
    } finally {
      if (isEdit) setIsUploadingEditImage(false);
      else setIsUploadingImage(false);
    }
  };

  const startEditArtist = (art: ArtistItem) => {
    setEditingArtist(art);
    setEditName(art.name);
    setEditBio(art.bio || "");
    setEditImage(art.image || "");
    setEditFollowersCount(art.followersCount || 0);
    setEditFeatured(!!art.isFeatured);
  };

  const handleSaveEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist || !editName.trim()) return;

    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/admin/artists/${editingArtist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          image: editImage.trim(),
          isFeatured: editFeatured,
          followersCount: editFollowersCount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setArtists((prev) =>
          prev.map((a) => (a.id === editingArtist.id ? data.artist : a))
        );
        setEditingArtist(null);
      } else {
        alert(data.message || "خطا در ویرایش هنرمند.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteArtist = async (id: string, artistName: string) => {
    if (!confirm(`آیا از حذف هنرمند «${artistName}» اطمینان دارید؟`)) {
      return;
    }

    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/artists/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setArtists((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.message || "خطا در حذف هنرمند.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          image: image.trim(),
          isFeatured,
          followersCount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setArtists([data.artist, ...artists]);
        setName("");
        setBio("");
        setImage("");
        setStatusMsg("هنرمند جدید با موفقیت ثبت شد.");
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert(data.message || "خطا در ثبت هنرمند.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Artist Form */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
        <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-brand" />
          <span>افزودن هنرمند جدید</span>
        </h3>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              نام هنرمند *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بیتا یا محسن یگانه"
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              تصویر پرتره هنرمند (آپلود فایل یا آدرس اینترنتی)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... یا آپلود از رایانه"
                className="flex-1 p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
              <label className="px-3 py-2 bg-surface-100 hover:bg-brand/10 hover:text-brand border border-surface-border rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                <Upload className={`w-3.5 h-3.5 ${isUploadingImage ? "animate-bounce" : ""}`} />
                <span>{isUploadingImage ? "آپلود..." : "آپلود عکس"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadImageFile(f, false);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              تعداد دنبال‌کننده (تعیین توسط ادمین)
            </label>
            <input
              type="number"
              min="0"
              value={followersCount}
              onChange={(e) => setFollowersCount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="مثال: 12500"
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              بیوگرافی و معرفی هنرمند
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="توضیح سبک و معرفی آثار..."
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-content-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-brand rounded"
              />
              <span>نمایش به عنوان هنرمند برگزیده در صفحه اصلی</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت هنرمند"}
            </button>
          </div>
        </form>
      </div>

      {/* Artists List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {artists.map((art) => (
          <div
            key={art.id}
            className="p-4 rounded-2xl bg-surface-card border border-surface-border flex flex-col items-center text-center shadow-sm space-y-2"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-100 shadow-md">
              {art.image ? (
                <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand/20 flex items-center justify-center text-brand font-bold">
                  {art.name[0]}
                </div>
              )}
            </div>
            <h4 className="text-xs font-bold text-content-primary">{art.name}</h4>
            <span className="text-[10px] text-content-muted">
              {formatNumberPersian(art.followersCount || 0)} دنبال‌کننده
            </span>

            <div className="flex items-center gap-1.5 pt-2">
              <button
                onClick={() => startEditArtist(art)}
                className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-content-muted hover:text-brand transition-colors"
                title="ویرایش هنرمند"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteArtist(art.id, art.name)}
                disabled={isDeleting === art.id}
                className="p-1.5 rounded-lg bg-surface-50 hover:bg-red-500/10 text-content-muted hover:text-red-400 transition-colors"
                title="حذف هنرمند"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Artist Modal */}
      {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="font-bold text-base text-content-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand" />
                <span>ویرایش اطلاعات هنرمند</span>
              </h3>
              <button
                onClick={() => setEditingArtist(null)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  نام هنرمند
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  تصویر پرتره هنرمند (آپلود عکس یا آدرس)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://... یا انتخاب فایل"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                  />
                  <label className="px-3 py-2 bg-surface-100 hover:bg-brand/10 hover:text-brand border border-surface-border rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                    <Upload className={`w-3.5 h-3.5 ${isUploadingEditImage ? "animate-bounce" : ""}`} />
                    <span>{isUploadingEditImage ? "آپلود..." : "آپلود عکس"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImageFile(f, true);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  تعداد دنبال‌کننده (تعیین توسط ادمین)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editFollowersCount}
                  onChange={(e) => setEditFollowersCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  بیوگرافی کوتاه
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-content-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="accent-brand rounded"
                  />
                  <span>هنرمند برگزیده در صفحه اصلی</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-surface-border">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md disabled:opacity-50"
                >
                  {isSavingEdit ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingArtist(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-muted font-bold text-xs transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
