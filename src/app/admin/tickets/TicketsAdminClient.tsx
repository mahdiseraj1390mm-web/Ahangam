"use client";

import React, { useState } from "react";
import { MessageSquare, Check, Clock, AlertCircle, Send, User } from "lucide-react";
import { formatPersianDate } from "@/lib/utils";

interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string | Date;
}

interface TicketRow {
  id: string;
  name: string;
  contact: string;
  subject: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: string;
  createdAt: string | Date;
  messages: TicketMessage[];
}

export function TicketsAdminClient({ initialTickets }: { initialTickets: TicketRow[] }) {
  const [tickets, setTickets] = useState<TicketRow[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(
    initialTickets[0] || null
  );
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTickets(
          tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus as any });
        }
      }
    } catch {
      alert("خطا در به‌روزرسانی وضعیت تیکت.");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setIsReplying(true);
      const res = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        const updatedMessages = [...selectedTicket.messages, data.message];
        const updatedTicket = { ...selectedTicket, messages: updatedMessages, status: "IN_PROGRESS" as const };
        setSelectedTicket(updatedTicket);
        setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)));
        setReplyText("");
      } else {
        alert("خطا در ارسال پاسخ.");
      }
    } catch {
      alert("خطای سرور.");
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tickets List */}
      <div className="bg-surface-card border border-surface-border rounded-3xl p-4 sm:p-5 shadow-md space-y-3">
        <h3 className="text-sm font-bold text-content-primary pb-2 border-b border-surface-border flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand" />
          <span>درخواست‌های پشتیبانی</span>
        </h3>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                selectedTicket?.id === t.id
                  ? "bg-brand/10 border-brand shadow-sm"
                  : "bg-surface-50 border-surface-border hover:border-brand/40"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-content-primary truncate">{t.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    t.status === "OPEN"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : t.status === "RESOLVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-content-secondary truncate">{t.subject}</p>
              <span className="text-[10px] text-content-muted block">
                {formatPersianDate(t.createdAt)}
              </span>
            </div>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-10 text-xs text-content-muted">
              هیچ تیکت پشتیبانی ثبت نشده است.
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details & Chat Thread */}
      <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-3xl p-5 sm:p-6 shadow-md flex flex-col justify-between space-y-6">
        {selectedTicket ? (
          <>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-3">
                <div>
                  <h2 className="text-base font-black text-content-primary">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-content-muted mt-1 font-mono">
                    <span>ارسال‌کننده: {selectedTicket.name}</span>
                    <span>•</span>
                    <span>تماس: {selectedTicket.contact}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="p-2 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand font-bold"
                  >
                    <option value="OPEN">باز (OPEN)</option>
                    <option value="IN_PROGRESS">در حال بررسی (IN_PROGRESS)</option>
                    <option value="RESOLVED">حل شده (RESOLVED)</option>
                    <option value="CLOSED">بسته شده (CLOSED)</option>
                  </select>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.senderRole === "ADMIN" || m.senderRole === "SUPER_ADMIN";
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl max-w-lg space-y-1 text-xs ${
                        isAdmin
                          ? "bg-brand/10 border border-brand/20 text-content-primary mr-auto"
                          : "bg-surface-50 border border-surface-border text-content-secondary ml-auto"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px] pb-1 border-b border-surface-border/50">
                        <span className={isAdmin ? "text-brand" : "text-content-primary"}>
                          {m.senderName} {isAdmin && "(مدیریت آهنگام)"}
                        </span>
                        <span className="text-content-muted font-normal text-[10px]">
                          {formatPersianDate(m.createdAt)}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-line pt-1">{m.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-surface-border space-y-3">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ مدیریت را اینجا بنویسید..."
                className="w-full p-3 rounded-xl bg-surface-50 border border-surface-border text-xs text-content-primary focus:outline-none focus:border-brand leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="px-5 py-2.5 bg-brand text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplying ? "در حال ارسال..." : "ارسال پاسخ تیکت"}</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-24 text-xs text-content-muted">
            یک تیکت را برای مشاهده و پاسخ انتخاب نمایید.
          </div>
        )}
      </div>
    </div>
  );
}
