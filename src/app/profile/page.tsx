import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        createdAt: user.createdAt,
      }}
    />
  );
}
