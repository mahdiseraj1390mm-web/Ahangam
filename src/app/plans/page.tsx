import React from "react";
import { prisma } from "@/lib/prisma";
import { PlansClient } from "./PlansClient";

export const revalidate = 0;

export default async function PlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return <PlansClient plans={plans} />;
}
