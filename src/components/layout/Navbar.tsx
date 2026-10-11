"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Music,
  Search,
  Palette,
  User,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Compass,
  Radio,
  Disc3,
  Film,
  Heart,
} from "lucide-react";
import { ThemeCustomizerModal } from "../theme/ThemeCustomizerModal";
import { useTheme } from "../theme/ThemeProvider";

interface NavbarProps {
  user?: {
    id: string;
    displayName: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const { switcherEnabled } = useTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    // If user is not yet known or auth changes dynamically
    const syncAuth = () => {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    };

    if (!user) {
      syncAuth();
    }

    window.addEventListener("auth-changed", syncAuth);
    return () => window.removeEventListener("auth-changed", syncAuth);
  }, [user]);

  const navLinks = [
    { label: "صفحه اصلی", href: "/", icon: Music },
    { label: "آرشیو آهنگ‌ها", href: "/songs", icon: Compass },
    { label: "علاقه‌مندی‌ها و پلی‌لیست‌ها", href: "/favorites", icon: Heart },
    { label: "هنرمندان", href: "/artists", icon: Radio },
    { label: "آلبوم‌ها", href: "/albums", icon: Disc3 },
    { label: "موزیک‌ویدیوها", href: "/videos", icon: Film },
    { label: "اشتراک ویژه", href: "/plans", icon: Sparkles, badge: "VIP" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-bg/85 backdrop-blur-xl border-b border-surface-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-content-secondary hover:text-content-primary rounded-xl hover:bg-surface-100 transition-colors"
              aria-label="منوی سایت"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-brand/25 group-hover:scale-105 transition-all border border-brand/30 flex items-center justify-center bg-surface-50 shrink-0">
                <img
                  src="/logo.png"
                  alt="Ahangam Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-content-primary tracking-tight group-hover:text-brand transition-colors">
                  آهنگام
                </span>
                <span className="text-[10px] text-content-muted font-sans -mt-1 tracking-wider uppercase">
                  Ahangam Music
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-brand bg-brand/10 font-bold"
                      : "text-content-secondary hover:text-content-primary hover:bg-surface-100/60"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 mr-1">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Search, Favorites, Theme, Profile/Login, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Button */}
            <Link
              href="/search"
              prefetch={true}
              className="p-2 sm:px-3 sm:py-2 text-content-secondary hover:text-content-primary hover:bg-surface-100 rounded-xl transition-colors flex items-center gap-2"
              title="جستجوی هوشمند"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium text-content-muted">
                جستجو...
              </span>
            </Link>

            {/* Quick Favorites Shortcut */}
            <Link
              href="/favorites"
              prefetch={true}
              className="p-2 text-content-secondary hover:text-red-500 hover:bg-surface-100 rounded-xl transition-colors"
              title="آهنگ‌های مورد علاقه و پلی‌لیست‌ها"
              aria-label="علاقه‌مندی‌ها"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* Theme Customizer Toggle (Controlled by Admin) */}
            {switcherEnabled && (
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="p-2 text-content-secondary hover:text-brand hover:bg-surface-100 rounded-xl transition-colors"
                title="تغییر تم و رنگ"
                aria-label="تنظیمات تم"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            {/* Admin Panel Link (if role is ADMIN or SUPER_ADMIN) */}
            {currentUser && (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
              <Link
                href="/admin"
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden md:inline">پنل مدیریت</span>
              </Link>
            )}

            {/* User Profile or Login */}
            {currentUser ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-surface-100 hover:bg-surface-200 border border-surface-border rounded-xl transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-brand/20 text-brand flex items-center justify-center font-bold text-xs">
                  {currentUser.displayName?.[0] || "ک"}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-content-primary max-w-[100px] truncate">
                  {currentUser.displayName}
                </span>
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold shadow-md shadow-brand/20 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>ورود / عضویت</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-surface-border bg-surface-card px-4 py-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Theme Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
}
