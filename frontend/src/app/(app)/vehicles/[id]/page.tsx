"use client";

import { use, useCallback, useEffect, useState, FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { DiagnosticReport, DigitalTwin, Vehicle } from "@/lib/types";
import { carArtFor } from "@/lib/cars";
import { CarArt } from "@/components/car-art";
import {
  Badge, btnCls, Card, ErrorNote, inputCls, Loading,
} from "@/components/ui";

const SNAPSHOT_FIELDS = [
  ["battery_health", "Battery health"],
  ["brake_health", "Brake health"],
  ["tire_health", "Tire health"],
  ["oil_life", "Oil life"],
] as const;

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState("");
  const [snapshot, setSnapshot] = useState({
    mileage_km: "", battery_health: "80", brake_health: "80",
    tire_health: "80", oil_life: "80",
  });

  const load = useCallback(() => {
    api<Vehicle>(`/vehicles/${id}`).then(setVehicle).catch(() => {});
    api<DigitalTwin>(`/vehicles/${id}/digital-twin`).then(setTwin).catch(() => {});
  }, [id]);

  useEffect(load, [load]);

  async function addSnapshot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api(`/vehicles/${id}/health-snapshots`, {
        method: "POST",
        body: JSON.stringify({
          mileage_km: Number(snapshot.mileage_km),
          battery_health: Number(snapshot.battery_health),
          brake_health: Number(snapshot.brake_health),
          tire_health: Number(snapshot.tire_health),
          oil_life: Number(snapshot.oil_life),
        }),
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  async function runScan(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const result = await api<DiagnosticReport>(`/diagnostics/vehicles/${id}/scan`, {
        method: "POST",
        body: JSON.stringify({ codes: codes.split(/[\s,]+/).filter(Boolean) }),
      });
      setReport(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  if (!vehicle || !twin) return <Loading />;

  const art = carArtFor(vehicle.make, vehicle.model);

  return (
    <div>
      <div className="glass relative mb-6 overflow-hidden rounded-2xl">
        {art.photo ? (
          <>
            <img src={art.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(120deg, ${art.from}12, ${art.to}08)` }}
          />
        )}
        <div className="relative flex flex-col items-center gap-2 p-6 sm:flex-row sm:gap-8">
          {!art.photo && <CarArt body={art.body} from={art.from} to={art.to} className="w-56 shrink-0" />}
          <div className={art.photo ? "py-10" : undefined}>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-0.5 font-mono text-xs font-bold tracking-wider text-slate-200">
                {vehicle.license_plate}
              </span>
              <span className="capitalize">{vehicle.fuel_type}</span>
              <span>{vehicle.mileage_km.toLocaleString()} km</span>
              <Badge value={twin.status} />
            </div>
          </div>
        </div>
      </div>
      {error && <ErrorNote message={error} />}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Digital twin */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Digital Twin</h2>
            <Badge value={twin.status} />
          </div>
          {twin.overall_health === null ? (
            <p className="text-sm text-slate-400">
              No health snapshots yet — record one below to activate the twin.
            </p>
          ) : (
            <>
              <p className="mb-4 text-3xl font-bold">
                {twin.overall_health}
                <span className="text-base font-normal text-slate-400"> / 100</span>
              </p>
              <div className="space-y-3">
                {twin.components.map((c) => (
                  <div key={c.component}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{c.component}</span>
                      <span className="text-slate-400">{c.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className={`h-2 rounded-full ${
                          c.status === "critical" ? "bg-red-400"
                          : c.status === "attention" ? "bg-amber-400"
                          : "bg-emerald-400"
                        }`}
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                    {c.prediction && (
                      <p className="mt-1 text-xs text-amber-300">⚠ {c.prediction}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                {twin.snapshot_count} snapshot(s) recorded
              </p>
            </>
          )}
        </Card>

        {/* Record snapshot */}
        <Card>
          <h2 className="mb-4 font-semibold">Record health snapshot</h2>
          <form onSubmit={addSnapshot} className="space-y-3">
            <input
              className={inputCls} type="number" placeholder="Current mileage (km) *" required
              value={snapshot.mileage_km}
              onChange={(e) => setSnapshot({ ...snapshot, mileage_km: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              {SNAPSHOT_FIELDS.map(([key, label]) => (
                <label key={key} className="text-sm">
                  <span className="mb-1 block text-slate-400">{label} (0–100)</span>
                  <input
                    className={inputCls} type="number" min={0} max={100} required
                    value={snapshot[key]}
                    onChange={(e) => setSnapshot({ ...snapshot, [key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <button type="submit" className={btnCls}>Save snapshot</button>
          </form>
        </Card>

        {/* Diagnostics */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Intelligent diagnostics</h2>
          <form onSubmit={runScan} className="mb-4 flex gap-3">
            <input
              className={inputCls}
              placeholder="Enter OBD codes, e.g. P0300 P0171 P0A80"
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              required
            />
            <button type="submit" className={btnCls}>Analyze</button>
          </form>

          {report && (
            <div>
              <p className="mb-4 rounded-lg bg-white/[0.03] px-4 py-3 text-sm">{report.summary}</p>
              <div className="space-y-4">
                {report.findings.map((f) => (
                  <div key={f.code} className="rounded-lg border border-white/10 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold">{f.code}</span>
                      {f.severity != null && <Badge value={
                        f.severity >= 4 ? "critical" : f.severity === 3 ? "attention" : "good"
                      } />}
                      <span className="text-sm text-slate-400">{f.title ?? "Unknown code"}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        confidence {(f.confidence * 100).toFixed(0)}%
                        {f.seen_before_on_same_model > 0 &&
                          ` · seen ${f.seen_before_on_same_model}× on this model`}
                      </span>
                    </div>
                    {f.likely_causes.length > 0 && (
                      <p className="text-sm text-slate-400">
                        <span className="font-medium">Likely causes:</span>{" "}
                        {f.likely_causes.join("; ")}
                      </p>
                    )}
                    {f.recommended_actions.length > 0 && (
                      <p className="text-sm text-slate-400">
                        <span className="font-medium">Recommended:</span>{" "}
                        {f.recommended_actions.join("; ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
