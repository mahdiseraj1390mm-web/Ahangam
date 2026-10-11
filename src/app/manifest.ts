import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "آهنگام | مرجع جامع موسیقی",
    short_name: "آهنگام",
    description: "سامانه مدرن پخش آنلاین و دانلود موسیقی با بالاترین کیفیت",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0813",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
