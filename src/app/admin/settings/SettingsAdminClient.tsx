"use client";

import React, { useState } from "react";
import {
  Sliders,
  Check,
  Palette,
  Sparkles,
  Globe,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { THEME_PALETTES, ThemeColor, ThemeConfig } from "@/lib/theme";

interface SettingItem {
  key: string;
  value: string;
  group: string;
  description?: string | null;
}

export function SettingsAdminClient({ initialSettings }: { initialSettings: SettingItem[] }) {
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialSettings.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  });

  // Custom themes list state
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(() => {
    try {
      const raw = initialSettings.find((s) => s.key === "CUSTOM_THEMES")?.value;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // New Custom Theme Form State
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemePrimary, setNewThemePrimary] = useState("#8b5cf6");
  const [newThemeLight, setNewThemeLight] = useState("#c4b5fd");
  const [newThemeDark, setNewThemeDark] = useState("#6d28d9");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddCustomTheme = () => {
    if (!newThemeName.trim() || !newThemePrimary) {
      alert("لطفاً نام رنگ و کد رنگ اصلی را مشخص کنید.");
      return;
    }

    const id = `custom_${Date.now().toString().slice(-6)}`;
    const newTheme: ThemeConfig = {
      id,
      name: newThemeName.trim(),
      nameFa: newThemeName.trim(),
      primary: newThemePrimary,
      primaryLight: newThemeLight || newThemePrimary,
      primaryDark: newThemeDark || newThemePrimary,
      accent: newThemeLight || newThemePrimary,
      isCustom: true,
    };

    const updated = [...customThemes, newTheme];
    setCustomThemes(updated);
    handleChange("CUSTOM_THEMES", JSON.stringify(updated));

    setNewThemeName("");
    setNewThemePrimary("#ec4899");
    setNewThemeLight("#fbcfe8");
    setNewThemeDark("#be185d");
  };

  const handleRemoveCustomTheme = (id: string) => {
    const updated = customThemes.filter((t) => t.id !== id);
    setCustomThemes(updated);
    handleChange("CUSTOM_THEMES", JSON.stringify(updated));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const payload = {
      ...settings,
      CUSTOM_THEMES: JSON.stringify(customThemes),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (res.ok) {
        setStatusMsg("تمامی تنظیمات با موفقیت در پایگاه داده ذخیره و اعمال شدند.");
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        alert("خطا در ذخیره تنظیمات.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSaving(false);
    }
  };

  const isSwitcherEnabled = settings["THEME_SWITCHER_ENABLED"] !== "false";

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* General Settings */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-4">
        <h3 className="text-sm font-bold text-content-primary flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand" />
          <span>تنظیمات عمومی و برندینگ</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              نام رسمی سامانه
            </label>
            <input
              type="text"
              value={settings["SITE_NAME"] || "آهنگام"}
              onChange={(e) => handleChange("SITE_NAME", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              شعار اصلی سایت
            </label>
            <input
              type="text"
              value={settings["SITE_TAGLINE"] || ""}
              onChange={(e) => handleChange("SITE_TAGLINE", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              نام هنرمند پیش‌فرض طبق پروپوزال
            </label>
            <input
              type="text"
              value={settings["DEFAULT_ARTIST_NAME"] || "بیتا"}
              onChange={(e) => handleChange("DEFAULT_ARTIST_NAME", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              مجوز دانلود رایگان با کیفیت ۱۲۸
            </label>
            <select
              value={settings["CAN_DOWNLOAD_FREE"] || "true"}
              onChange={(e) => handleChange("CAN_DOWNLOAD_FREE", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            >
              <option value="true">فعال (تمام کاربران می‌توانند کیفیت ۱۲۸ را رایگان دانلود کنند)</option>
              <option value="false">غیرفعال (دانلود فقط برای کاربران VIP مجاز است)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Theme & Palette Administration */}
      <div className="p-6 rounded-3xl bg-surface-card border border-surface-border shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand" />
            <div>
              <h3 className="text-sm font-bold text-content-primary">
                کنترل پنل رنگ‌ها و تم‌های سامانه
              </h3>
              <p className="text-xs text-content-muted">
                تنظیم رنگ پیش‌فرض بنفش، فعال/غیرفعال کردن انتخاب تم برای کاربران و تعریف رنگ‌های جدید با کد هگز
              </p>
            </div>
          </div>

          {/* Visibility toggle for users */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleChange("THEME_SWITCHER_ENABLED", isSwitcherEnabled ? "false" : "true")
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isSwitcherEnabled
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              {isSwitcherEnabled ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>آیکون پالت در صفحه کاربران فعال است</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>آیکون پالت در صفحه کاربران مخفی است</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              پالت رنگی پیش‌فرض کل سایت (دیفالت: بنفش مدرن)
            </label>
            <select
              value={settings["DEFAULT_THEME_COLOR"] || "purple"}
              onChange={(e) => handleChange("DEFAULT_THEME_COLOR", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-bold"
            >
              {Object.keys(THEME_PALETTES).map((k) => (
                <option key={k} value={k}>
                  {THEME_PALETTES[k].nameFa}
                </option>
              ))}
              {customThemes.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.nameFa} (سفارشی)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              حالت روشنایی اولیه برای کاربران جدید
            </label>
            <select
              value={settings["DEFAULT_THEME_MODE"] || "dark"}
              onChange={(e) => handleChange("DEFAULT_THEME_MODE", e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
            >
              <option value="dark">تاریک (پیش‌فرض مدرن)</option>
              <option value="light">روشن</option>
            </select>
          </div>
        </div>

        {/* Existing Custom Themes */}
        {customThemes.length > 0 && (
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-content-primary">
              رنگ‌های سفارشی تعریف‌شده توسط ادمین:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {customThemes.map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-border"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm ring-2 ring-white/10"
                      style={{ backgroundColor: ct.primary }}
                    />
                    <div>
                      <span className="text-xs font-bold text-content-primary block">
                        {ct.nameFa}
                      </span>
                      <span className="text-[10px] text-content-muted font-mono">
                        {ct.primary}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomTheme(ct.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    title="حذف این رنگ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Custom Color Form */}
        <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-3">
          <div className="text-xs font-bold text-content-primary flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-brand" />
            <span>تعریف و افزودن رنگ جدید برای سایت (کد هگز دلخواه)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-content-muted mb-1">
                نام رنگ (مثال: سرخابی سلطنتی، یاسی، سبز یشمی...)
              </label>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="نام رنگ..."
                className="w-full p-2 rounded-xl bg-surface-card border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-content-muted mb-1">
                کد رنگ اصلی (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newThemePrimary}
                  onChange={(e) => {
                    setNewThemePrimary(e.target.value);
                    setNewThemeDark(e.target.value);
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={newThemePrimary}
                  onChange={(e) => setNewThemePrimary(e.target.value)}
                  placeholder="#8b5cf6"
                  className="flex-1 p-2 rounded-xl bg-surface-card border border-surface-border text-xs font-mono text-content-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddCustomTheme}
                className="w-full py-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-all border border-brand/20 flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>افزودن این رنگ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-brand text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand/30 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isSaving ? "در حال ذخیره‌سازی..." : "ذخیره و اعمال تنظیمات در پایگاه داده"}
        </button>
      </div>
    </form>
  );
}
