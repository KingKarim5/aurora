"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Part } from "@/lib/types";
import {
  btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader, TableShell, Td, Th,
} from "@/components/ui";

const EMPTY_FORM = {
  sku: "", name: "", category: "", quantity: "0", unit_price: "", reorder_level: "2", supplier: "",
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    api<Part[]>("/parts").then(setParts).catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/parts", {
        method: "POST",
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: form.category,
          quantity: Number(form.quantity),
          unit_price: form.unit_price,
          reorder_level: Number(form.reorder_level),
          supplier: form.supplier || null,
        }),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader title="Parts Inventory">
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New part"}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={onCreate} className="mb-6 grid max-w-3xl grid-cols-2 gap-3 glass rounded-2xl p-5 md:grid-cols-4">
          {error && <div className="col-span-full"><ErrorNote message={error} /></div>}
          <input className={inputCls} placeholder="SKU *" required value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className={inputCls} placeholder="Name *" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Category *" required value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className={inputCls} placeholder="Unit price *" required value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Quantity" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Reorder level"
            value={form.reorder_level}
            onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
          <input className={inputCls} placeholder="Supplier" value={form.supplier}
            onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <button type="submit" className={btnCls}>Create part</button>
        </form>
      )}

      {!parts ? (
        <Loading />
      ) : parts.length === 0 ? (
        <Empty message="No parts in inventory." />
      ) : (
        <TableShell>
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>SKU</Th><Th>Name</Th><Th>Category</Th><Th>Stock</Th><Th>Price</Th><Th>Supplier</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {parts.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.04]">
                <Td>{p.sku}</Td>
                <Td>{p.name}</Td>
                <Td>{p.category}</Td>
                <Td>
                  <span className={p.quantity <= p.reorder_level ? "font-bold text-red-300" : ""}>
                    {p.quantity}
                  </span>
                  {p.quantity <= p.reorder_level && (
                    <span className="ml-2 text-xs text-red-400">low stock</span>
                  )}
                </Td>
                <Td>${p.unit_price}</Td>
                <Td>{p.supplier ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
