import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "ahangam-default-secret-key-change-in-production";
const COOKIE_NAME = "ahangam_session";

export interface UserSession {
  id: string;
  phone: string;
  displayName: string;
  role: "USER" | "VIP" | "ADMIN" | "SUPER_ADMIN";
  permissions?: string[];
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign JWT Token
export function signSessionToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: "30d" });
}

// Verify JWT Token
export function verifySessionToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

// Get current logged-in user from cookies (Server Component / Action / Route Handler)
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

// Helper to check user permission
export async function checkAdminPermission(requiredPermission?: string): Promise<{
  authorized: boolean;
  user: UserSession | null;
  message?: string;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, user: null, message: "احراز هویت الزامی است." };
  }

  if (user.role === "SUPER_ADMIN") {
    return { authorized: true, user };
  }

  if (user.role === "ADMIN") {
    if (!requiredPermission) {
      return { authorized: true, user };
    }
    const permissions: string[] = user.permissions || [];
    if (permissions.includes(requiredPermission) || permissions.includes("ALL")) {
      return { authorized: true, user };
    }
    return { authorized: false, user, message: "شما مجوز دسترسی به این بخش را ندارید." };
  }

  return { authorized: false, user, message: "دسترسی فقط برای مدیران مجاز است." };
}
