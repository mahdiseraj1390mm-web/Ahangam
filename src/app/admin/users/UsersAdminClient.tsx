"use client";

import React, { useState } from "react";
import { Users, Shield, Crown, Ban, Check, ShieldAlert, Trash2, Edit3, X } from "lucide-react";
import { formatPersianDate } from "@/lib/utils";

interface UserRow {
  id: string;
  phone: string;
  displayName: string;
  role: string;
  isBanned: boolean;
  permissions?: string | null;
  createdAt: string | Date;
}

export function UsersAdminClient({
  initialUsers,
  currentUserRole,
}: {
  initialUsers: UserRow[];
  currentUserRole: string;
}) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Edit user state
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const startEditUser = (user: UserRow) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editDisplayName.trim()) return;

    try {
      setIsSavingUser(true);
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editDisplayName.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, displayName: editDisplayName.trim() } : u))
        );
        setEditingUser(null);
      } else {
        alert(data.message || "خطا در ویرایش کاربر.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`آیا از حذف کامل حساب کاربر «${userName}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`)) {
      return;
    }

    try {
      setIsDeleting(userId);
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert(data.message || "خطا در حذف کاربر.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || "خطا در تغییر دسترسی.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    setIsUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !currentBan }),
      });

      if (res.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, isBanned: !currentBan } : u))
        );
      } else {
        alert("خطا در به‌روزرسانی وضعیت کاربر.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-surface-50 border-b border-surface-border text-content-secondary font-bold">
            <tr>
              <th className="p-3.5">نام کاربر</th>
              <th className="p-3.5">شماره تلفن</th>
              <th className="p-3.5">نقش فعلی</th>
              <th className="p-3.5">وضعیت حساب</th>
              <th className="p-3.5">تاریخ عضویت</th>
              <th className="p-3.5 text-center">تغییر سطح دسترسی</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-50/50 transition-colors">
                <td className="p-3.5 font-bold text-content-primary">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                      {u.displayName[0]}
                    </div>
                    <span>{u.displayName}</span>
                  </div>
                </td>
                <td className="p-3.5 font-mono text-content-muted">{u.phone}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === "SUPER_ADMIN"
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : u.role === "ADMIN"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : u.role === "VIP"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-surface-100 text-content-muted"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5">
                  {u.isBanned ? (
                    <span className="text-red-400 font-bold">مسدود شده</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">فعال</span>
                  )}
                </td>
                <td className="p-3.5 text-content-muted">{formatPersianDate(u.createdAt)}</td>
                <td className="p-3.5">
                  <div className="flex items-center justify-center gap-2">
                    {/* Role Dropdown */}
                    <select
                      value={u.role}
                      disabled={isUpdating === u.id || u.role === "SUPER_ADMIN"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-medium disabled:opacity-40"
                    >
                      <option value="USER">کاربر عادی</option>
                      <option value="VIP">کاربر ویژه VIP</option>
                      <option value="ADMIN">زیرادمین (ADMIN)</option>
                      {currentUserRole === "SUPER_ADMIN" && (
                        <option value="SUPER_ADMIN">مدیر ارشد</option>
                      )}
                    </select>

                    {/* Ban / Unban Button */}
                    <button
                      onClick={() => handleToggleBan(u.id, u.isBanned)}
                      disabled={isUpdating === u.id || u.role === "SUPER_ADMIN"}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                        u.isBanned
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                      title={u.isBanned ? "رفع انسداد" : "مسدود کردن کاربر"}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Display Name */}
                    <button
                      onClick={() => startEditUser(u)}
                      disabled={isUpdating === u.id}
                      className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-content-muted hover:text-brand transition-colors disabled:opacity-40"
                      title="ویرایش نام کاربر"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete User */}
                    <button
                      onClick={() => handleDeleteUser(u.id, u.displayName)}
                      disabled={isDeleting === u.id || u.role === "SUPER_ADMIN"}
                      className="p-1.5 rounded-lg bg-surface-50 hover:bg-red-500/10 text-content-muted hover:text-red-400 transition-colors disabled:opacity-40"
                      title="حذف کاربر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-card border border-surface-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <h3 className="font-bold text-base text-content-primary flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand" />
                <span>ویرایش اطلاعات کاربر</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-surface-50 hover:bg-surface-100 flex items-center justify-center text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  نام و نام خانوادگی کاربر
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-content-muted mb-1.5">
                  شماره موبایل
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser.phone}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-border text-xs text-content-muted font-mono cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-surface-border">
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex-1 py-2.5 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs transition-opacity shadow-md disabled:opacity-50"
                >
                  {isSavingUser ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-50 hover:bg-surface-100 text-content-muted font-bold text-xs transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
