"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { fetchAdminUsers, updateUserRoleRequest } from "@/lib/api/admin-client";
import type { AdminUserSummary } from "@/types/coupon";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonRows, PanelHeader } from "@/components/admin/panel-shell";

const ROLES: AdminUserSummary["role"][] = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUserSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setRefreshing(true);
    return fetchAdminUsers(search || undefined)
      .then((res) => setUsers(res.users))
      .finally(() => setRefreshing(false));
  }, [search]);

  useEffect(() => {
    const handle = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(handle);
  }, [load, search]);

  const changeRole = async (id: string, role: AdminUserSummary["role"]) => {
    setSavingId(id);
    setError(null);
    try {
      const res = await updateUserRoleRequest(id, role);
      setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, role: res.user.role } : u)) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update role.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Users"
        subtitle="Search accounts and manage roles"
        count={users?.length}
        onRefresh={load}
        refreshing={refreshing}
        actions={
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email…"
              className="input-field h-9 w-52 pl-8 text-xs"
            />
          </label>
        }
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>
      )}

      {!users ? (
        <SkeletonRows />
      ) : users.length === 0 ? (
        <EmptyState message="No users match this search." variant="card" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white ags-depth-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-semibold">User</th>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-900">{u.name}</p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value as AdminUserSummary["role"])}
                      className="input-field h-8 w-auto text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.loyaltyPoints}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.referralCode}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
