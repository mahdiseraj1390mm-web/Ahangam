import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/songs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/albums`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/playlists`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/videos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/plans`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/rules`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const [songs, artists, albums, playlists, videos] = await Promise.all([
      prisma.song.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        take: 2000,
      }),
      prisma.artist.findMany({
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.album.findMany({
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.playlist.findMany({
        where: { isPublic: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.musicVideo.findMany({
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
    ]);

    const songRoutes: MetadataRoute.Sitemap = songs.map((s) => ({
      url: `${baseUrl}/song/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const artistRoutes: MetadataRoute.Sitemap = artists.map((a) => ({
      url: `${baseUrl}/artist/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const albumRoutes: MetadataRoute.Sitemap = albums.map((alb) => ({
      url: `${baseUrl}/album/${alb.slug}`,
      lastModified: alb.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    const playlistRoutes: MetadataRoute.Sitemap = playlists.map((pl) => ({
      url: `${baseUrl}/playlist/${pl.slug}`,
      lastModified: pl.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
      url: `${baseUrl}/video/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [
      ...staticRoutes,
      ...songRoutes,
      ...artistRoutes,
      ...albumRoutes,
      ...playlistRoutes,
      ...videoRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
