import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "تماس با ما و پشتیبانی | آهنگام",
  description: "ارتباط با تیم پشتیبانی رسانه آهنگام، ارسال پیشنهادات، گزارش خرابی قطعات و درخواست‌ها.",
  alternates: {
    canonical: `${getSiteUrl()}/contact`,
  },
  openGraph: {
    title: "تماس با ما و پشتیبانی | آهنگام",
    description: "ارتباط با تیم پشتیبانی رسانه آهنگام، ارسال پیشنهادات و انتقادات.",
    url: `${getSiteUrl()}/contact`,
    siteName: "آهنگام",
    locale: "fa_IR",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
