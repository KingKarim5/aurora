"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { User } from "@/lib/types";
import {
  Badge, btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader,
  TableShell, Td, Th, theadCls, rowCls, tbodyCls,
} from "@/components/ui";

const EMPTY_FORM = { email: "", full_name: "", password: "", role: "mechanic" };

export default function TeamPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    api<User[]>("/auth/users").then(setUsers).catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/auth/users", { method: "POST", body: JSON.stringify(form) });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  async function toggleActive(u: User) {
    setError(null);
    try {
      await api(`/auth/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader title="Team">
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New staff account"}
        </button>
      </PageHeader>

      {error && <ErrorNote message={error} />}

      {showForm && (
        <form onSubmit={onCreate} className="glass mb-6 grid max-w-3xl grid-cols-2 gap-3 rounded-2xl p-5 md:grid-cols-4">
          <input className={inputCls} placeholder="Dedicated email *" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputCls} placeholder="Full name *" required
            value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className={inputCls} placeholder="Password (min 8) *" type="password" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className={inputCls} value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="mechanic">mechanic</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
          <p className="col-span-full text-xs text-slate-400">
            Staff sign in with this dedicated email and password — not Google. Google sign-ins
            always become customer accounts.
          </p>
          <button type="submit" className={`${btnCls} col-span-full`}>Create account</button>
        </form>
      )}

      {!users ? (
        <Loading />
      ) : users.length === 0 ? (
        <Empty message="No users." />
      ) : (
        <TableShell>
          <thead className={theadCls}>
            <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th /></tr>
          </thead>
          <tbody className={tbodyCls}>
            {users.map((u) => (
              <tr key={u.id} className={rowCls}>
                <Td>{u.full_name}</Td>
                <Td>{u.email}</Td>
                <Td><Badge value={u.role} /></Td>
                <Td>
                  <span className={u.is_active ? "text-emerald-300" : "text-slate-500"}>
                    {u.is_active ? "active" : "disabled"}
                  </span>
                </Td>
                <Td>
                  <button
                    onClick={() => toggleActive(u)}
                    className="text-xs font-semibold text-sky-300 hover:text-sky-200"
                  >
                    {u.is_active ? "Disable" : "Enable"}
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
