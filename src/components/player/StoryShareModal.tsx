"use client";

import React, { useRef, useState, useEffect } from "react";
import { SongItem } from "@/types";
import { X, Download, Copy, Share2, Check, Sparkles } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

interface StoryShareModalProps {
  song: SongItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StoryShareModal({ song, isOpen, onClose }: StoryShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  if (!isOpen || !song) return null;

  const songUrl = typeof window !== "undefined"
    ? `${window.location.origin}/song/${song.slug || song.id}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(songUrl);
      setCopied(true);
    } catch {
      alert("لینک کپی شد");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `شنیدن قطعه «${song.title}» از ${song.artist?.name || "بیتا"} در آهنگام`,
          url: songUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // Generate ultra high resolution 9:16 (1080x1920) Instagram Story image via HTML5 Canvas
  const handleDownloadStoryImage = async () => {
    setIsGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // 1. Draw Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, "#0b0b14");
      bgGrad.addColorStop(0.4, "#181028");
      bgGrad.addColorStop(0.8, "#09090f");
      bgGrad.addColorStop(1, "#050508");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Draw Decorative Ambient Radial Glows
      const glow1 = ctx.createRadialGradient(540, 600, 50, 540, 600, 650);
      glow1.addColorStop(0, "rgba(168, 85, 247, 0.35)");
      glow1.addColorStop(0.7, "rgba(126, 34, 206, 0.12)");
      glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1080, 1920);

      const glow2 = ctx.createRadialGradient(800, 1400, 30, 800, 1400, 500);
      glow2.addColorStop(0, "rgba(236, 72, 153, 0.2)");
      glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1080, 1920);

      // 3. Header: Ahangam Branding
      ctx.textAlign = "center";
      ctx.direction = "rtl";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 32px Vazirmatn, Tahoma, sans-serif";
      ctx.fillText("آهنگام • مرجع آنلاین موسیقی ایران", 540, 200);

      // 4. Glass Card Container in Center
      const cardX = 140;
      const cardY = 320;
      const cardW = 800;
      const cardH = 1180;
      const cardRadius = 56;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();
      ctx.restore();

      // Helper function to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Image load failed"));
          img.src = src;
        });
      };

      // 5. Draw Album Cover Image
      const coverSize = 640;
      const coverX = 220;
      const coverY = 400;
      const coverRadius = 40;

      let coverDrawn = false;
      if (song.coverImage) {
        try {
          const coverImg = await loadImage(song.coverImage);
          ctx.save();
          // Drop shadow for album cover
          ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;

          ctx.beginPath();
          ctx.roundRect(coverX, coverY, coverSize, coverSize, coverRadius);
          ctx.clip();
          ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
          ctx.restore();
          coverDrawn = true;
        } catch {}
      }

      if (!coverDrawn) {
        // Fallback placeholder cover
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, coverRadius);
        const fallbackGrad = ctx.createLinearGradient(coverX, coverY, coverX + coverSize, coverY + coverSize);
        fallbackGrad.addColorStop(0, "#7c3aed");
        fallbackGrad.addColorStop(1, "#c026d3");
        ctx.fillStyle = fallbackGrad;
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 72px Vazirmatn, Tahoma, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("آهنگام", coverX + coverSize / 2, coverY + coverSize / 2 + 25);
        ctx.restore();
      }

      // 6. Draw Song Title
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px Vazirmatn, Tahoma, sans-serif";
      // Truncate title if too long
      const title = song.title.length > 25 ? song.title.substring(0, 24) + "..." : song.title;
      ctx.fillText(title, 540, 1140);

      // 7. Draw Artist Name
      ctx.fillStyle = "#c084fc"; // Brand purple accent
      ctx.font = "500 40px Vazirmatn, Tahoma, sans-serif";
      const artist = song.artist?.name || "بیتا";
      ctx.fillText(artist, 540, 1220);

      // 8. Draw Stylized Waveform Bars
      const waveY = 1330;
      const numBars = 36;
      const barWidth = 10;
      const gap = 11;
      const totalWaveWidth = numBars * (barWidth + gap);
      const startX = (1080 - totalWaveWidth) / 2;

      // Seed-like heights for a realistic audio wave
      const heights = [
        18, 30, 48, 70, 45, 80, 100, 65, 85, 110, 75, 55, 95, 115, 80, 60, 90, 105,
        70, 50, 85, 100, 60, 40, 75, 90, 55, 35, 65, 80, 50, 30, 45, 60, 35, 20
      ];

      for (let i = 0; i < numBars; i++) {
        const h = heights[i % heights.length];
        const x = startX + i * (barWidth + gap);
        const y = waveY - h / 2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 5);
        if (i < 18) {
          ctx.fillStyle = "#a855f7"; // Brand purple
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        }
        ctx.fill();
        ctx.restore();
      }

      // 9. Bottom Footer: Call-to-action
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 32px Vazirmatn, Tahoma, sans-serif";
      ctx.fillText("هم‌اکنون بشنوید در Ahangam.ir", 540, 1680);

      // 10. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Ahangam-${song.title.replace(/\s+/g, "_")}-Story.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Story image generation error:", err);
      alert("خطا در ایجاد تصویر استوری. می‌توانید از دکمه کپی لینک استفاده کنید.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-surface-card border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-content-primary">
              اشتراک‌گذاری و کارت استوری
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Card Preview (Interactive Mockup) */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center">
          <div className="w-56 aspect-[9/16] rounded-2xl p-4 bg-gradient-to-b from-[#181028] via-[#0d0d16] to-[#07070a] border border-white/10 shadow-xl flex flex-col items-center justify-between text-center select-none relative overflow-hidden group">
            {/* Ambient blur behind card */}
            <div className="absolute inset-0 bg-brand/10 filter blur-xl pointer-events-none" />

            <div className="text-[10px] text-white/50 font-bold z-10 pt-1">
              آهنگام • استوری
            </div>

            <div className="flex flex-col items-center z-10 w-full my-auto space-y-3">
              {/* Cover Art */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border border-white/15 bg-surface-100">
                {song.coverImage ? (
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/30 flex items-center justify-center text-brand font-bold text-xs">
                    آهنگام
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="w-full px-2">
                <h4 className="text-xs font-black text-white truncate">
                  {song.title}
                </h4>
                <p className="text-[11px] font-medium text-brand-300 truncate mt-0.5">
                  {song.artist?.name || "بیتا"}
                </p>
              </div>

              {/* Mini Waveform Mockup */}
              <div className="flex items-center justify-center gap-0.5 h-6 w-full px-2">
                {[12, 18, 24, 16, 22, 28, 20, 14, 26, 18, 12].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full ${
                      i < 6 ? "bg-brand" : "bg-white/20"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="text-[9px] text-white/40 font-mono z-10 pb-1">
              ahangam.ir
            </div>
          </div>

          <p className="text-xs text-content-muted text-center mt-3 leading-relaxed">
            تصویر عمودی با کیفیت بالا برای استوری اینستاگرام و تلگرام آماده شده است.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-surface-50 border-t border-surface-border space-y-2">
          <button
            onClick={handleDownloadStoryImage}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand to-brand-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand/25 active:scale-98 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>دانلود تصویر برای استوری</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-surface-card hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-content-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی لینک</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-surface-card hover:bg-surface-100 border border-surface-border text-content-secondary hover:text-content-primary font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
