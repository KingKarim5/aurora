"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Customer } from "@/lib/types";
import {
  btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader, TableShell, Td, Th,
} from "@/components/ui";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  const load = useCallback(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    api<Customer[]>(`/customers${params}`).then(setCustomers).catch(() => {});
  }, [query]);

  useEffect(load, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          address: form.address || null,
        }),
      });
      setForm({ name: "", phone: "", email: "", address: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader title="Customers">
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New customer"}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={onCreate} className="mb-6 grid max-w-2xl grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {error && <div className="col-span-2"><ErrorNote message={error} /></div>}
          <input className={inputCls} placeholder="Full name *" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Phone *" required
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inputCls} placeholder="Email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputCls} placeholder="Address"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button type="submit" className={`${btnCls} col-span-2`}>Create customer</button>
        </form>
      )}

      <input
        className={`${inputCls} mb-4 max-w-sm`}
        placeholder="Search by name or phone…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!customers ? (
        <Loading />
      ) : customers.length === 0 ? (
        <Empty message="No customers found." />
      ) : (
        <TableShell>
          <thead className="bg-slate-50">
            <tr><Th>Name</Th><Th>Phone</Th><Th>Email</Th><Th>Address</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <Td>{c.name}</Td>
                <Td>{c.phone}</Td>
                <Td>{c.email ?? "—"}</Td>
                <Td>{c.address ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
