import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "DEFAULT_THEME_COLOR",
            "DEFAULT_THEME_MODE",
            "THEME_SWITCHER_ENABLED",
            "CUSTOM_THEMES",
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return NextResponse.json({
      defaultColor: map["DEFAULT_THEME_COLOR"] || "purple",
      defaultMode: map["DEFAULT_THEME_MODE"] || "dark",
      switcherEnabled: map["THEME_SWITCHER_ENABLED"] !== "false",
      customThemes: map["CUSTOM_THEMES"] ? JSON.parse(map["CUSTOM_THEMES"]) : [],
    });
  } catch {
    return NextResponse.json({
      defaultColor: "purple",
      defaultMode: "dark",
      switcherEnabled: true,
      customThemes: [],
    });
  }
}
