"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import {
  archiveUserRequest,
  createUserRequest,
  fetchAdminUsers,
  restoreUserRequest,
  setUserPasswordRequest,
  updateUserRequest,
  updateUserRoleRequest,
} from "@/lib/api/admin-client";
import type { AdminUserSummary } from "@/types/coupon";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AdminModal,
  ArchiveToggle,
  Field,
  FieldGrid,
  PanelHeader,
  SkeletonRows,
} from "@/components/admin/panel-shell";

const ROLES: AdminUserSummary["role"][] = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

/** What each role actually means, in the language the office uses. */
const ROLE_LABELS: Record<AdminUserSummary["role"], string> = {
  CUSTOMER: "Customer",
  TECHNICIAN: "Technician",
  ADMIN: "Admin",
};

const ROLE_HINT =
  "Customer — books services. Technician — gets the engineer portal at /technician. Admin — full access to this console.";

const emptyCreate = {
  name: "",
  email: "",
  phone: "",
  role: "CUSTOMER" as AdminUserSummary["role"],
  password: "",
};

type EditDraft = {
  name: string;
  email: string;
  phone: string;
  role: AdminUserSummary["role"];
  loyaltyPoints: string;
  emailVerified: boolean;
};

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUserSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<AdminUserSummary | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  const [pwUser, setPwUser] = useState<AdminUserSummary | null>(null);
  const [pwValue, setPwValue] = useState("");

  const load = useCallback(() => {
    setRefreshing(true);
    return fetchAdminUsers({ search: search || undefined, includeArchived: showArchived })
      .then((res) => setUsers(res.users))
      .finally(() => setRefreshing(false));
  }, [search, showArchived]);

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
      // The <select> is showing the role the server just rejected — reload so
      // it goes back to the truth instead of silently lying.
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || createForm.password.length < 8) {
      setError("Name, email and a password of at least 8 characters are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createUserRequest({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        role: createForm.role,
        password: createForm.password,
      });
      setShowCreate(false);
      setCreateForm(emptyCreate);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the user.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: AdminUserSummary) => {
    setError(null);
    setEditUser(u);
    setEditDraft({
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      loyaltyPoints: String(u.loyaltyPoints),
      emailVerified: Boolean(u.emailVerified),
    });
  };

  const saveEdit = async () => {
    if (!editUser || !editDraft) return;
    setSavingId(editUser.id);
    setError(null);
    try {
      await updateUserRequest(editUser.id, {
        name: editDraft.name.trim(),
        email: editDraft.email.trim(),
        phone: editDraft.phone.trim(),
        role: editDraft.role,
        loyaltyPoints: Number(editDraft.loyaltyPoints) || 0,
        emailVerified: editDraft.emailVerified,
      });
      setEditUser(null);
      setEditDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSavingId(null);
    }
  };

  const savePassword = async () => {
    if (!pwUser || pwValue.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSavingId(pwUser.id);
    setError(null);
    try {
      await setUserPasswordRequest(pwUser.id, pwValue);
      setPwUser(null);
      setPwValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't set the password.");
    } finally {
      setSavingId(null);
    }
  };

  const toggleArchive = async (u: AdminUserSummary) => {
    setSavingId(u.id);
    setError(null);
    try {
      if (u.deletedAt) await restoreUserRequest(u.id);
      else await archiveUserRequest(u.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the user.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Users"
        subtitle="Create accounts, edit details, manage roles"
        count={users?.length}
        onRefresh={load}
        refreshing={refreshing}
        actions={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <ArchiveToggle value={showArchived} onChange={setShowArchived} />
            <label className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email or phone…"
                className="input-field h-9 w-full pl-8 text-xs sm:w-48"
              />
            </label>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="size-4" />
              New
            </Button>
          </div>
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
        <>
          {/* Phones get cards — in the table layout the Role and Actions
              columns sit off the right edge and are easy to miss entirely. */}
          <div className="space-y-3 sm:hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className={`rounded-2xl border border-slate-200 bg-white p-4 ags-depth-sm ${
                  u.deletedAt ? "opacity-55" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
                      {u.name}
                      {u.deletedAt && (
                        <StatusBadge tone="neutral" size="sm">
                          Archived
                        </StatusBadge>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {u.phone || "No phone"} · {u.loyaltyPoints} pts · joined{" "}
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    Role
                    <RoleSelect user={u} savingId={savingId} onChange={changeRole} />
                  </label>
                  <RowActions
                    user={u}
                    savingId={savingId}
                    onEdit={openEdit}
                    onPassword={(target) => {
                      setError(null);
                      setPwUser(target);
                      setPwValue("");
                    }}
                    onArchive={toggleArchive}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white ags-depth-sm sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b border-slate-50 last:border-0 ${u.deletedAt ? "opacity-55" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-semibold text-navy-900">
                            {u.name}
                            {u.deletedAt && (
                              <StatusBadge tone="neutral" size="sm">
                                Archived
                              </StatusBadge>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <RoleSelect user={u} savingId={savingId} onChange={changeRole} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.loyaltyPoints}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <RowActions
                          user={u}
                          savingId={savingId}
                          onEdit={openEdit}
                          onPassword={(target) => {
                            setError(null);
                            setPwUser(target);
                            setPwValue("");
                          }}
                          onArchive={toggleArchive}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showCreate && (
        <AdminModal
          title="New user"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create user"}
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <FieldGrid>
              <Field label="Full name">
                <input
                  className="input-field h-9 text-sm"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input-field h-9 text-sm"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Field>
            </FieldGrid>
            <Field label="Email">
              <input
                type="email"
                className="input-field h-9 text-sm"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <FieldGrid>
              <Field label="Role" hint={ROLE_HINT}>
                <select
                  className="input-field h-9 text-sm"
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      role: e.target.value as AdminUserSummary["role"],
                    }))
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Password" hint="At least 8 characters. Share it with the user directly.">
                <input
                  type="text"
                  className="input-field h-9 text-sm"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                />
              </Field>
            </FieldGrid>
          </div>
        </AdminModal>
      )}

      {editUser && editDraft && (
        <AdminModal
          title={`Edit ${editUser.name}`}
          onClose={() => {
            setEditUser(null);
            setEditDraft(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditUser(null);
                  setEditDraft(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={savingId === editUser.id}>
                Save changes
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <FieldGrid>
              <Field label="Full name">
                <input
                  className="input-field h-9 text-sm"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => d && { ...d, name: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input-field h-9 text-sm"
                  value={editDraft.phone}
                  onChange={(e) => setEditDraft((d) => d && { ...d, phone: e.target.value })}
                />
              </Field>
            </FieldGrid>
            <Field label="Email">
              <input
                type="email"
                className="input-field h-9 text-sm"
                value={editDraft.email}
                onChange={(e) => setEditDraft((d) => d && { ...d, email: e.target.value })}
              />
            </Field>
            <FieldGrid>
              <Field label="Role" hint={ROLE_HINT}>
                <select
                  className="input-field h-9 text-sm"
                  value={editDraft.role}
                  onChange={(e) =>
                    setEditDraft(
                      (d) => d && { ...d, role: e.target.value as AdminUserSummary["role"] }
                    )
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Loyalty points">
                <input
                  type="number"
                  min={0}
                  className="input-field h-9 text-sm"
                  value={editDraft.loyaltyPoints}
                  onChange={(e) =>
                    setEditDraft((d) => d && { ...d, loyaltyPoints: e.target.value })
                  }
                />
              </Field>
            </FieldGrid>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={editDraft.emailVerified}
                onChange={(e) =>
                  setEditDraft((d) => d && { ...d, emailVerified: e.target.checked })
                }
                className="size-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200"
              />
              Email verified
            </label>
          </div>
        </AdminModal>
      )}

      {pwUser && (
        <AdminModal
          title={`Set password — ${pwUser.name}`}
          onClose={() => {
            setPwUser(null);
            setPwValue("");
          }}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPwUser(null);
                  setPwValue("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={savePassword} disabled={savingId === pwUser.id}>
                Set password
              </Button>
            </>
          }
        >
          <Field label="New password" hint="At least 8 characters.">
            <input
              type="text"
              className="input-field h-9 text-sm"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
            />
          </Field>
        </AdminModal>
      )}
    </div>
  );
}

/** Role picker shared by the mobile card and desktop table layouts. */
function RoleSelect({
  user,
  savingId,
  onChange,
}: {
  user: AdminUserSummary;
  savingId: string | null;
  onChange: (id: string, role: AdminUserSummary["role"]) => void;
}) {
  return (
    <select
      value={user.role}
      disabled={savingId === user.id || Boolean(user.deletedAt)}
      onChange={(e) => onChange(user.id, e.target.value as AdminUserSummary["role"])}
      className="input-field h-9 w-auto text-xs"
      aria-label={`Role for ${user.name}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

/** Edit / set password / archive-restore, shared by both layouts. */
function RowActions({
  user,
  savingId,
  onEdit,
  onPassword,
  onArchive,
}: {
  user: AdminUserSummary;
  savingId: string | null;
  onEdit: (user: AdminUserSummary) => void;
  onPassword: (user: AdminUserSummary) => void;
  onArchive: (user: AdminUserSummary) => void;
}) {
  const busy = savingId === user.id;
  return (
    <>
      <button
        type="button"
        onClick={() => onEdit(user)}
        disabled={busy}
        className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
        aria-label="Edit user"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onPassword(user)}
        disabled={busy}
        className="ags-focus flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-700 disabled:opacity-50"
        aria-label="Set password"
      >
        <KeyRound className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onArchive(user)}
        disabled={busy}
        className={`ags-focus flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
          user.deletedAt ? "text-brand-600 hover:bg-brand-50" : "text-red-500 hover:bg-red-50"
        }`}
        aria-label={user.deletedAt ? "Restore user" : "Archive user"}
      >
        {user.deletedAt ? <RotateCcw className="size-4" /> : <Trash2 className="size-4" />}
      </button>
    </>
  );
}
