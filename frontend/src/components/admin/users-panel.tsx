"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { fetchAdminUsers } from "@/lib/api/admin-client";
import type { AdminUserSummary } from "@/types/coupon";
import { cn } from "@/lib/utils";

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUserSummary[] | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchAdminUsers(search || undefined).then((res) => setUsers(res.users));
    }, 250);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <div>
      <label className="relative block max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-field h-10 w-full pl-9 text-sm"
        />
      </label>

      {!users ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Referral</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-navy-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        u.role === "ADMIN" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.loyaltyPoints}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.referralCode}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No users match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
