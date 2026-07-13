"use client";

import { useEffect, useState } from "react";
import { CAR_CATALOG } from "@/lib/cars";

const SHOWROOM_MODELS = ["Premio", "Corolla Cross", "CR-V", "Civic"];

/** Real-photo showroom: crossfading stage with a slow cinematic zoom. */
export function Showroom() {
  const models = CAR_CATALOG.filter((c) => SHOWROOM_MODELS.includes(c.model) && c.photo);
  const [active, setActive] = useState(0);

  // auto-advance every 6s
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % models.length), 6000);
    return () => clearInterval(t);
  }, [models.length]);

  if (models.length === 0) return null;
  const car = models[active];

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {/* photo stage */}
      <div className="relative aspect-[16/10] overflow-hidden md:aspect-[21/9]">
        {models.map((m, i) => (
          <img
            key={m.model}
            src={m.photo}
            alt={`${m.make} ${m.model}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === active ? "animate-kenburns opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* prev / next */}
        <button
          aria-label="Previous car"
          onClick={() => setActive((a) => (a - 1 + models.length) % models.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 18, height: 18 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          aria-label="Next car"
          onClick={() => setActive((a) => (a + 1) % models.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 18, height: 18 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* car label */}
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">
            {car.defaultYear} · {car.fuel} · {car.body}
          </p>
          <p className="font-display mt-1 text-3xl font-bold text-white md:text-4xl">
            {car.make} {car.model}
          </p>
        </div>
      </div>

      {/* model tabs */}
      <div className="flex flex-wrap items-center gap-2 p-5 md:p-6">
        {models.map((m, i) => (
          <button
            key={m.model}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              i === active
                ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950"
                : "border border-white/15 text-slate-300 hover:bg-white/5"
            }`}
          >
            {m.make} {m.model}
          </button>
        ))}
        <p className="ml-auto hidden text-xs text-slate-500 sm:block">
          Real photography · true 360° spins of our floor cars coming with our own footage
        </p>
      </div>
    </div>
  );
}
