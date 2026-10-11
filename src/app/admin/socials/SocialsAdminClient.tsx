"use client";

import React, { useState } from "react";
import { Share2, PlusCircle, Trash2, ExternalLink, Send, Check } from "lucide-react";

interface SocialRow {
  id: string;
  platform: string;
  title: string;
  url: string;
  isEnabled: boolean;
  sortOrder: number;
}

export function SocialsAdminClient({ initialSocials }: { initialSocials: SocialRow[] }) {
  const [socials, setSocials] = useState<SocialRow[]>(initialSocials);
  const [platform, setPlatform] = useState("TELEGRAM");
  const [title, setTitle] = useState("کانال رسمی تلگرام");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/socials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          title: title.trim(),
          url: url.trim(),
          isEnabled: true,
          sortOrder: socials.length + 1,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSocials([...socials, data.social]);
        setUrl("");
      } else {
        alert(data.message || "خطا در ثبت لینک.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این لینک اطمینان دارید؟")) return;
    try {
      const res = await fetch(`/api/admin/socials?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSocials(socials.filter((s) => s.id !== id));
      }
    } catch {
      alert("خطا در حذف.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create form */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
        <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-brand" />
          <span>افزودن لینک شبکه اجتماعی رسمی</span>
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              پلتفرم / پیام‌رسان
            </label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value);
                if (e.target.value === "TELEGRAM") setTitle("کانال رسمی تلگرام");
                if (e.target.value === "INSTAGRAM") setTitle("صفحه اینستاگرام");
                if (e.target.value === "RUBIKA") setTitle("کانال روبیکا");
                if (e.target.value === "EITAA") setTitle("کانال ایتا");
                if (e.target.value === "BALE") setTitle("کانال بله");
                if (e.target.value === "WHATSAPP") setTitle("گروه واتساپ");
              }}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            >
              <option value="TELEGRAM">تلگرام (Telegram)</option>
              <option value="INSTAGRAM">اینستاگرام (Instagram)</option>
              <option value="RUBIKA">روبیکا (Rubika)</option>
              <option value="EITAA">ایتا (Eitaa)</option>
              <option value="BALE">بله (Bale)</option>
              <option value="WHATSAPP">واتساپ (WhatsApp)</option>
              <option value="CUSTOM">سایر (سفارشی)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              عنوان نمایشی در فوتر
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              آدرس کامل اینترنتی (URL)
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://t.me/ahangam_official"
              dir="ltr"
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !url.trim()}
              className="px-6 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50"
            >
              {isSubmitting ? "در حال ثبت..." : "افزودن لینک به فوتر"}
            </button>
          </div>
        </form>
      </div>

      {/* Social links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {socials.map((soc) => (
          <div
            key={soc.id}
            className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between shadow-sm"
          >
            <div className="min-w-0 pr-2">
              <h4 className="text-xs font-bold text-content-primary truncate">{soc.title}</h4>
              <a
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="text-[11px] text-content-muted hover:text-brand truncate block mt-0.5"
              >
                {soc.url}
              </a>
            </div>

            <button
              onClick={() => handleDelete(soc.id)}
              className="p-2 rounded-xl text-content-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
