"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Search, Heart, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show in admin panel
  if (pathname.startsWith("/admin")) return null;

  const items = [
    { label: "خانه", href: "/", icon: Home },
    { label: "کاوش", href: "/songs", icon: Compass },
    { label: "علاقه‌مندی‌ها", href: "/favorites", icon: Heart },
    { label: "جستجو", href: "/search", icon: Search },
    { label: "پروفایل", href: "/profile", icon: User },
  ];

  return (
    <nav
      aria-label="ناوبری موبایل"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface-card/95 backdrop-blur-lg border-t border-surface-border px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors"
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? "text-brand font-bold scale-105"
                : "text-content-muted hover:text-content-primary"
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
