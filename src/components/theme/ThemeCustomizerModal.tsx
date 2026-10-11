"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { ThemeMode } from "@/lib/theme";
import { Palette, Moon, Sun, Monitor, Check, X, Sparkles } from "lucide-react";

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizerModal({ isOpen, onClose }: ThemeModalProps) {
  const { color, mode, setColor, setMode, availablePalettes, switcherEnabled } = useTheme();

  if (!isOpen || !switcherEnabled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-card border border-surface-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand" />
            <div>
              <h3 className="text-base font-bold text-content-primary">شخصی‌سازی رنگ و تم</h3>
              <p className="text-[11px] text-content-muted">
                با یک کلیک تم کل سایت بلافاصله تغییر می‌کند
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette Selector - Instant Change */}
        <div>
          <label className="block text-xs font-bold text-content-secondary mb-2.5 flex items-center justify-between">
            <span>انتخاب رنگ تم (اعمال آنی)</span>
            <span className="text-[11px] text-brand font-medium">
              {availablePalettes[color]?.nameFa || "انتخاب شده"}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.keys(availablePalettes).map((key) => {
              const pal = availablePalettes[key];
              const isSelected = color === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all group ${
                    isSelected
                      ? "border-brand bg-brand/10 text-brand shadow-sm font-bold scale-[1.02]"
                      : "border-surface-border bg-surface-50 text-content-secondary hover:border-brand/40 hover:bg-surface-100"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm ring-2 ring-white/10"
                    style={{ backgroundColor: pal.primary }}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-xs truncate">{pal.nameFa}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector - Instant Change */}
        <div>
          <label className="block text-xs font-bold text-content-secondary mb-2.5">
            حالت روشنایی (اعمال آنی)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode("dark")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                mode === "dark"
                  ? "border-brand bg-brand/10 text-brand shadow-sm"
                  : "border-surface-border bg-surface-50 text-content-secondary hover:border-brand/40"
              }`}
            >
              <Moon className="w-4 h-4" />
              تاریک
            </button>
            <button
              type="button"
              onClick={() => setMode("light")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                mode === "light"
                  ? "border-brand bg-brand/10 text-brand shadow-sm"
                  : "border-surface-border bg-surface-50 text-content-secondary hover:border-brand/40"
              }`}
            >
              <Sun className="w-4 h-4" />
              روشن
            </button>
            <button
              type="button"
              onClick={() => setMode("system")}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                mode === "system"
                  ? "border-brand bg-brand/10 text-brand shadow-sm"
                  : "border-surface-border bg-surface-50 text-content-secondary hover:border-brand/40"
              }`}
            >
              <Monitor className="w-4 h-4" />
              خودکار
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-surface-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
