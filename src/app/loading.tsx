import React from "react";
import { Music2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 py-16 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Pulsing glow background */}
        <div className="w-16 h-16 rounded-2xl bg-brand/20 animate-ping absolute" />
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand/30 relative z-10 animate-bounce">
          <Music2 className="w-7 h-7" />
        </div>
      </div>
      <div className="space-y-1.5 text-center">
        <p className="text-xs font-black tracking-wider text-content-primary">
          در حال بارگذاری آهنگام...
        </p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse delay-150" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse delay-300" />
        </div>
      </div>
    </div>
  );
}
