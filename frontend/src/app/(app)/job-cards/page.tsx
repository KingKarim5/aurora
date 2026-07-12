"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Customer, JobCard, Vehicle } from "@/lib/types";
import {
  Badge, btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader, TableShell, Td, Th,
} from "@/components/ui";

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customer_id: "", vehicle_id: "", complaint: "", odometer_km: "",
  });

  const load = useCallback(() => {
    api<JobCard[]>("/job-cards").then(setJobCards).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    api<Customer[]>("/customers?limit=200").then(setCustomers).catch(() => {});
    api<Vehicle[]>("/vehicles?limit=200").then(setVehicles).catch(() => {});
  }, [load]);

  const customerVehicles = vehicles.filter(
    (v) => String(v.customer_id) === form.customer_id
  );

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/job-cards", {
        method: "POST",
        body: JSON.stringify({
          customer_id: Number(form.customer_id),
          vehicle_id: Number(form.vehicle_id),
          complaint: form.complaint,
          odometer_km: Number(form.odometer_km),
        }),
      });
      setForm({ customer_id: "", vehicle_id: "", complaint: "", odometer_km: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  return (
    <div>
      <PageHeader title="Job Cards">
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New job card"}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={onCreate} className="mb-6 grid max-w-3xl grid-cols-2 gap-3 glass rounded-2xl p-5">
          {error && <div className="col-span-2"><ErrorNote message={error} /></div>}
          <select className={inputCls} required value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value, vehicle_id: "" })}>
            <option value="">Customer *</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={inputCls} required value={form.vehicle_id}
            disabled={!form.customer_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
            <option value="">Vehicle *</option>
            {customerVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.license_plate} — {v.make} {v.model}
              </option>
            ))}
          </select>
          <input className={`${inputCls} col-span-2`} placeholder="Customer complaint *" required
            value={form.complaint}
            onChange={(e) => setForm({ ...form, complaint: e.target.value })} />
          <input className={inputCls} type="number" placeholder="Odometer (km) *" required
            value={form.odometer_km}
            onChange={(e) => setForm({ ...form, odometer_km: e.target.value })} />
          <button type="submit" className={btnCls}>Open job card</button>
        </form>
      )}

      {!jobCards ? (
        <Loading />
      ) : jobCards.length === 0 ? (
        <Empty message="No job cards yet." />
      ) : (
        <TableShell>
          <thead className="bg-white/[0.03]">
            <tr>
              <Th>Number</Th><Th>Status</Th><Th>Complaint</Th><Th>Total</Th><Th>Opened</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {jobCards.map((jc) => (
              <tr key={jc.id} className="hover:bg-white/[0.04]">
                <Td>{jc.number}</Td>
                <Td><Badge value={jc.status} /></Td>
                <Td>{jc.complaint.slice(0, 60)}{jc.complaint.length > 60 ? "…" : ""}</Td>
                <Td>${jc.total}</Td>
                <Td>{new Date(jc.created_at).toLocaleDateString()}</Td>
                <Td>
                  <Link href={`/job-cards/${jc.id}`} className="font-medium text-sky-300 hover:underline">
                    Open →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
