"use client";

import { use, useCallback, useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { Invoice, JobCard, Part } from "@/lib/types";
import {
  Badge, btnCls, btnGhostCls, Card, ErrorNote, inputCls, Loading, PageHeader, Td, Th,
} from "@/components/ui";

const NEXT_STATUSES: Record<string, string[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["awaiting_parts", "completed", "cancelled"],
  awaiting_parts: ["in_progress", "cancelled"],
  completed: [],
  invoiced: [],
  cancelled: [],
};

export default function JobCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState({
    item_type: "labor", part_id: "", description: "", quantity: "1", unit_price: "",
  });

  const load = useCallback(() => {
    api<JobCard>(`/job-cards/${id}`).then(setJobCard).catch(() => {});
  }, [id]);

  useEffect(() => {
    load();
    api<Part[]>("/parts?limit=200").then(setParts).catch(() => {});
  }, [load]);

  async function setStatus(status: string) {
    setError(null);
    try {
      await api(`/job-cards/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  async function addItem(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api(`/job-cards/${id}/items`, {
        method: "POST",
        body: JSON.stringify({
          item_type: item.item_type,
          part_id: item.item_type === "part" ? Number(item.part_id) : null,
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: item.unit_price === "" ? null : item.unit_price,
        }),
      });
      setItem({ item_type: "labor", part_id: "", description: "", quantity: "1", unit_price: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  async function createInvoice() {
    setError(null);
    try {
      const invoice = await api<Invoice>("/invoices", {
        method: "POST",
        body: JSON.stringify({ job_card_id: Number(id) }),
      });
      router.push(`/invoices?highlight=${invoice.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  if (!jobCard) return <Loading />;
  const editable = !["invoiced", "cancelled"].includes(jobCard.status);

  return (
    <div>
      <PageHeader title={`Job card ${jobCard.number}`}>
        <Badge value={jobCard.status} />
      </PageHeader>
      {error && <ErrorNote message={error} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Complaint</h2>
          <p className="mb-4 text-sm text-slate-300">{jobCard.complaint}</p>

          <h2 className="mb-3 font-semibold">Items</h2>
          {jobCard.items.length === 0 ? (
            <p className="mb-4 text-sm text-slate-400">No items yet.</p>
          ) : (
            <table className="mb-4 min-w-full divide-y divide-white/10">
              <thead>
                <tr><Th>Type</Th><Th>Description</Th><Th>Qty</Th><Th>Price</Th><Th>Total</Th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobCard.items.map((it) => (
                  <tr key={it.id}>
                    <Td>{it.item_type}</Td>
                    <Td>{it.description}</Td>
                    <Td>{it.quantity}</Td>
                    <Td>${it.unit_price}</Td>
                    <Td>${it.line_total}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-right text-lg font-bold">Total: ${jobCard.total}</p>

          {editable && (
            <form onSubmit={addItem} className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 md:grid-cols-5">
              <select className={inputCls} value={item.item_type}
                onChange={(e) => setItem({ ...item, item_type: e.target.value })}>
                <option value="labor">Labor</option>
                <option value="part">Part</option>
              </select>
              {item.item_type === "part" && (
                <select className={inputCls} required value={item.part_id}
                  onChange={(e) => {
                    const part = parts.find((p) => String(p.id) === e.target.value);
                    setItem({
                      ...item,
                      part_id: e.target.value,
                      description: part ? part.name : item.description,
                    });
                  }}>
                  <option value="">Select part *</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.quantity})
                    </option>
                  ))}
                </select>
              )}
              <input className={inputCls} placeholder="Description *" required
                value={item.description}
                onChange={(e) => setItem({ ...item, description: e.target.value })} />
              <input className={inputCls} type="number" min={1} placeholder="Qty"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: e.target.value })} />
              <input className={inputCls} placeholder={item.item_type === "part" ? "Price (auto)" : "Price *"}
                required={item.item_type === "labor"}
                value={item.unit_price}
                onChange={(e) => setItem({ ...item, unit_price: e.target.value })} />
              <button type="submit" className={`${btnCls} col-span-2 md:col-span-1`}>Add</button>
            </form>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Workflow</h2>
          <div className="space-y-2">
            {NEXT_STATUSES[jobCard.status].map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`${btnGhostCls} w-full text-left`}>
                Move to <span className="font-bold">{s.replaceAll("_", " ")}</span>
              </button>
            ))}
            {jobCard.status === "completed" && (
              <button onClick={createInvoice} className={`${btnCls} w-full`}>
                Generate invoice
              </button>
            )}
            {!editable && (
              <p className="text-sm text-slate-400">This job card is closed.</p>
            )}
          </div>
          <div className="mt-6 space-y-1 text-sm text-slate-400">
            <p>Odometer: {jobCard.odometer_km.toLocaleString()} km</p>
            <p>Opened: {new Date(jobCard.created_at).toLocaleString()}</p>
            {jobCard.completed_at && (
              <p>Completed: {new Date(jobCard.completed_at).toLocaleString()}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
