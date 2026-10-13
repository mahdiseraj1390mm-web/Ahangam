import React from "react";
import { SeoAdminClient } from "./SeoAdminClient";
import { checkAdminPermission } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSeoPage() {
  const { authorized } = await checkAdminPermission();
  if (!authorized) {
    redirect("/auth/login");
  }

  return <SeoAdminClient />;
}
