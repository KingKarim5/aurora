"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Customer, Vehicle } from "@/lib/types";
import { CAR_CATALOG, carArtFor } from "@/lib/cars";
import { CarArt } from "@/components/car-art";
import {
  btnCls, Empty, ErrorNote, inputCls, Loading, PageHeader,
} from "@/components/ui";

const EMPTY_FORM = {
  customer_id: "", vin: "", license_plate: "", make: "", model: "",
  year: "2018", fuel_type: "petrol", mileage_km: "0",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preset, setPreset] = useState("");

  const load = useCallback(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    api<Vehicle[]>(`/vehicles${params}`).then(setVehicles).catch(() => {});
  }, [query]);

  useEffect(load, [load]);
  useEffect(() => {
    api<Customer[]>("/customers?limit=200").then(setCustomers).catch(() => {});
  }, []);

  function applyPreset(value: string) {
    setPreset(value);
    const car = CAR_CATALOG[Number(value)];
    if (!car) return;
    setForm((f) => ({
      ...f,
      make: car.make,
      model: car.model,
      year: String(car.defaultYear),
      fuel_type: car.fuel,
    }));
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/vehicles", {
        method: "POST",
        body: JSON.stringify({
          customer_id: Number(form.customer_id),
          vin: form.vin || null,
          license_plate: form.license_plate,
          make: form.make,
          model: form.model,
          year: Number(form.year),
          fuel_type: form.fuel_type,
          mileage_km: Number(form.mileage_km),
        }),
      });
      setForm(EMPTY_FORM);
      setPreset("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  const previewArt = preset !== "" ? CAR_CATALOG[Number(preset)] : null;

  return (
    <div>
      <PageHeader title="Vehicles">
        <button className={btnCls} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "+ New vehicle"}
        </button>
      </PageHeader>

      {showForm && (
        <form onSubmit={onCreate} className="glass mb-6 max-w-3xl rounded-2xl p-5">
          {error && <ErrorNote message={error} />}

          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
            Quick pick — common models in Bangladesh
          </label>
          <div className="mb-4 flex items-center gap-4">
            <select className={inputCls} value={preset} onChange={(e) => applyPreset(e.target.value)}>
              <option value="">Custom / other vehicle…</option>
              {CAR_CATALOG.map((c, i) => (
                <option key={`${c.make}-${c.model}`} value={i}>
                  {c.make} {c.model} ({c.defaultYear} · {c.fuel})
                </option>
              ))}
            </select>
            {previewArt && (
              <CarArt body={previewArt.body} from={previewArt.from} to={previewArt.to} className="w-28 shrink-0" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <select className={inputCls} required value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
              <option value="">Owner *</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="License plate *" required
              value={form.license_plate}
              onChange={(e) => setForm({ ...form, license_plate: e.target.value })} />
            <input className={inputCls} placeholder="Make *" required value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })} />
            <input className={inputCls} placeholder="Model *" required value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <input className={inputCls} placeholder="VIN" value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value })} />
            <input className={inputCls} placeholder="Year" type="number" value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <select className={inputCls} value={form.fuel_type}
              onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}>
              {["petrol", "diesel", "hybrid", "electric", "cng"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="Mileage (km)" type="number"
              value={form.mileage_km}
              onChange={(e) => setForm({ ...form, mileage_km: e.target.value })} />
            <button type="submit" className={`${btnCls} col-span-full`}>Create vehicle</button>
          </div>
        </form>
      )}

      <input
        className={`${inputCls} mb-6 max-w-sm`}
        placeholder="Search plate, make, model, VIN…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {!vehicles ? (
        <Loading />
      ) : vehicles.length === 0 ? (
        <Empty message="No vehicles found." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => {
            const art = carArtFor(v.make, v.model);
            return (
              <Link
                key={v.id}
                href={`/vehicles/${v.id}`}
                className="glass group rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_-16px_rgba(56,189,248,0.35)]"
              >
                <div
                  className="relative mb-4 rounded-xl px-4 pt-3"
                  style={{
                    background: `linear-gradient(135deg, ${art.from}14, ${art.to}0a)`,
                  }}
                >
                  <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider text-slate-200">
                    {v.license_plate}
                  </span>
                  <CarArt
                    body={art.body}
                    from={art.from}
                    to={art.to}
                    className="mx-auto w-full max-w-[240px] transition duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="font-display text-lg font-semibold text-white">
                  {v.make} {v.model}
                </p>
                <div className="mt-1 flex items-center justify-between text-sm text-slate-400">
                  <span>
                    {v.year} · {v.fuel_type} · {v.mileage_km.toLocaleString()} km
                  </span>
                  <span className="font-medium text-sky-300 transition group-hover:translate-x-0.5">
                    Twin →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
