import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PlayerProvider } from "@/components/player/PlayerContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { FullPlayerModal } from "@/components/player/FullPlayerModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PwaRegister } from "@/components/pwa/PwaRegister";

import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "آهنگام | مرجع دانلود آهنگ جدید، متن ترانه و پخش آنلاین موسیقی",
    template: "%s | آهنگام",
  },
  description:
    "رسانه موسیقی آهنگام: دانلود آهنگ جدید، پخش آنلاین با کیفیت ۳۲۰ و ۱۲۸، متن کامل ترانه‌ها و آرشیو آهنگ‌های بیتا و تمامی خوانندگان محبوب ایران با بالاترین سرعت.",
  keywords: [
    "آهنگ",
    "آهنگام",
    "اهنگام",
    "بیتا",
    "دانلود آهنگ",
    "دانلود آهنگ جدید",
    "متن آهنگ",
    "متن ترانه",
    "پخش آنلاین آهنگ",
    "آهنگ های بیتا",
    "دانلود آهنگ های بیتا",
    "تکست آهنگ",
    "آهنگ شاد",
    "آهنگ غمگین",
    "دانلود موزیک",
    "موسیقی",
  ],
  authors: [{ name: "آهنگام" }],
  creator: "آهنگام",
  publisher: "آهنگام",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "آهنگام | مرجع دانلود آهنگ جدید و پخش آنلاین موسیقی",
    description: "دانلود آهنگ جدید، پخش آنلاین کیفیت ۳۲۰ و ۱۲۸ و متن کامل ترانه‌ها در رسانه آهنگام.",
    url: "/",
    siteName: "آهنگام",
    locale: "fa_IR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "آهنگام - Ahangam Music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آهنگام | مرجع دانلود آهنگ جدید و پخش آنلاین موسیقی",
    description: "دانلود آهنگ جدید، پخش آنلاین و متن کامل ترانه‌ها در رسانه آهنگام.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    google: "40WYMf4U5Bs8qH3ASIY69XDeGe2uNqOFPy3cqmLX6Tc",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="fa" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="min-h-screen flex flex-col bg-surface-bg text-content-primary selection:bg-brand selection:text-white" suppressHydrationWarning>
        <ThemeProvider>
          <PlayerProvider>
            <Navbar user={user} />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-20">
              {children}
            </main>
            <Footer />
            <MiniPlayer />
            <FullPlayerModal />
            <MobileBottomNav />
            <PwaRegister />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
