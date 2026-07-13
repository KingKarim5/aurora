"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/motion";
import { Part } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const OEM_BRANDS = ["Toyota", "Honda", "Nissan", "Hyundai", "Mitsubishi"];
const BRAND_FILTERS = ["All", ...OEM_BRANDS, "Aftermarket JDM"] as const;

const OEM_SUPPLIERS: Record<string, string[]> = {
  Toyota: ["Toyota", "Toyota Genuine", "Denso", "Aisin"],
  Honda: ["Honda", "Honda Genuine", "Nisshinbo", "Mugen"],
  Nissan: ["Nissan", "Nissan Genuine", "Nismo"],
  Hyundai: ["Hyundai", "Hyundai Genuine", "Hamko"],
  Mitsubishi: ["Mitsubishi", "Mitsubishi Genuine"],
};

const CATEGORY_ICONS: Record<string, string> = {
  Filters: "M3 4h18l-7 8v6l-4 2v-8L3 4z",
  Brakes: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-4a5 5 0 100-10 5 5 0 000 10zm0-3a2 2 0 100-4 2 2 0 000 4z",
  Fluids: "M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z",
  Ignition: "M13 2L4 14h6l-1 8 9-12h-6l1-8z",
  Electrical: "M7 7h10v4h3v6h-3v2H7v-2H4v-6h3V7zm3-3h4v3h-4V4z",
  Engine: "M5 9l2-3h6l1 2h4v3h2v5h-2v3h-5l-2-2H8l-2 2H4v-4H2v-4h2l1-2z",
  Suspension: "M6 3v4m0 4v4m0 4v2m12-18v2m0 4v4m0 4v4M4 7h4M4 15h4m8-8h4m-4 8h4",
  Body: "M4 17l2-6 3-4h6l3 4 2 6H4zm4 0a2 2 0 104 0m2 0a2 2 0 104 0",
  Sensors: "M12 8a4 4 0 100 8 4 4 0 000-8zm0-5v3m0 12v3m9-9h-3M6 12H3",
  AC: "M12 2v20M4 6l16 12M4 18L20 6",
  Drivetrain: "M6 12h12M6 12a3 3 0 11-6 0 3 3 0 016 0zm18 0a3 3 0 11-6 0 3 3 0 016 0z",
  Aftermarket: "M5 19l7-14 7 14H5zm7-4v.01",
};

export default function ShopPage() {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [brand, setBrand] = useState<(typeof BRAND_FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/shop/parts`)
      .then((r) => r.json())
      .then(setParts)
      .catch(() => setParts([]));
  }, []);

  const filtered = useMemo(() => {
    if (!parts) return [];
    const q = query.trim().toLowerCase();
    return parts.filter((p) => {
      if (q && !`${p.name} ${p.supplier ?? ""} ${p.category}`.toLowerCase().includes(q)) return false;
      if (brand === "All") return true;
      if (brand === "Aftermarket JDM") return p.category === "Aftermarket";
      return (OEM_SUPPLIERS[brand] ?? []).some((s) => (p.supplier ?? "").includes(s));
    });
  }, [parts, brand, query]);

  return (
    <main className="grid-lines min-h-screen">
      {/* nav */}
      <header className="glass-deep sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo size="sm" sub="Parts shop" />
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:text-white sm:block">
              ← Home
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/25 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-slate-950"
            >
              Console
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Genuine &amp; JDM aftermarket</p>
          <h1 className="font-display mt-2 text-4xl font-bold text-white md:text-5xl">Spare parts, in stock</h1>
          <p className="mt-3 max-w-xl text-slate-400">
            Live inventory from our workshop floor — genuine lines for Toyota, Honda, Nissan,
            Hyundai and Mitsubishi, plus performance aftermarket for JDM builds.
          </p>
        </Reveal>

        {/* filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {BRAND_FILTERS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                brand === b
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950"
                  : "border border-white/15 text-slate-300 hover:bg-white/5"
              }`}
            >
              {b}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts…"
            className="ml-auto w-full max-w-xs rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none"
          />
        </div>

        {/* grid */}
        {!parts ? (
          <p className="py-20 text-center text-sm text-slate-400">Loading live stock…</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-slate-500">No parts match — try another brand or search.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => {
              const aftermarket = p.category === "Aftermarket";
              const low = p.quantity <= p.reorder_level;
              return (
                <Reveal key={p.id} delay={Math.min(i, 8) * 60}>
                  <div className="glass group flex h-full flex-col rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_48px_-16px_rgba(56,189,248,0.35)]">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${
                        aftermarket ? "bg-amber-400/10 ring-amber-400/30" : "bg-sky-400/10 ring-sky-400/30"
                      }`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={aftermarket ? "#fbbf24" : "#7dd3fc"} strokeWidth="1.6" style={{ width: 20, height: 20 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[p.category] ?? CATEGORY_ICONS.Engine} />
                        </svg>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                        aftermarket
                          ? "bg-amber-400/15 text-amber-300 ring-amber-400/30"
                          : "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30"
                      }`}>
                        {aftermarket ? "Aftermarket" : "Genuine / OEM"}
                      </span>
                    </div>
                    <p className="font-display font-semibold leading-snug text-white">{p.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
                      {p.supplier ?? "—"} · {p.category}
                    </p>
                    <div className="mt-auto flex items-end justify-between pt-5">
                      <p className="font-display text-2xl font-bold text-gradient">${p.unit_price}</p>
                      <p className={`text-xs font-semibold ${low ? "text-amber-300" : "text-emerald-300"}`}>
                        {low ? `Only ${p.quantity} left` : "In stock"}
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hi AURORA, I want to order: ${p.name} (${p.sku})`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-2 text-center text-sm font-bold text-slate-950 transition hover:brightness-110"
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
