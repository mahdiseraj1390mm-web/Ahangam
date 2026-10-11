import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoDetailClient } from "./VideoDetailClient";

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VideoDetailPage({ params }: VideoPageProps) {
  const { slug } = await params;

  const video = await prisma.musicVideo.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
    include: {
      artist: true,
    },
  });

  if (!video) {
    notFound();
  }

  const relatedVideos = await prisma.musicVideo.findMany({
    where: { id: { not: video.id } },
    include: { artist: true },
    take: 3,
  });

  return <VideoDetailClient video={video} relatedVideos={relatedVideos} />;
}
