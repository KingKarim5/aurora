"use client";

import { useEffect, useRef, useState } from "react";
import { CAR_CATALOG } from "@/lib/cars";
import { CarArt } from "@/components/car-art";

const SHOWROOM_MODELS = ["Corolla Cross", "Premio", "Civic", "CR-V"];

/** Pseudo-3D turntable: auto-rotates, drag to spin. */
export function Showroom360() {
  const models = CAR_CATALOG.filter((c) => SHOWROOM_MODELS.includes(c.model));
  const [active, setActive] = useState(0);
  const [angle, setAngle] = useState(-18);
  const dragging = useRef<{ x: number; angle: number } | null>(null);
  const velocity = useRef(0.25);

  useEffect(() => {
    let raf: number;
    function spin() {
      if (!dragging.current) setAngle((a) => a + velocity.current);
      raf = requestAnimationFrame(spin);
    }
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragging.current = { x: e.clientX, angle };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setAngle(dragging.current.angle + (e.clientX - dragging.current.x) * 0.5);
  }
  function onPointerUp() {
    dragging.current = null;
  }

  const car = models[active];
  if (!car) return null;

  // flatten the silhouette as it turns edge-on, flip past 90°
  const rad = (angle * Math.PI) / 180;
  const flat = Math.cos(rad);

  return (
    <div className="glass overflow-hidden rounded-3xl p-6 md:p-10">
      {/* model tabs */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
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
      </div>

      {/* stage */}
      <div
        className="relative mx-auto flex h-64 max-w-lg cursor-grab touch-none select-none items-end justify-center active:cursor-grabbing md:h-72"
        style={{ perspective: 900 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* rotating platform */}
        <div
          className="absolute bottom-4 left-1/2 h-24 w-[130%] -translate-x-1/2 rounded-[100%] border border-sky-400/20"
          style={{
            transform: `translateX(-50%) rotateX(72deg) rotate(${angle}deg)`,
            background:
              "radial-gradient(closest-side, rgba(56,189,248,0.12), rgba(56,189,248,0.03) 60%, transparent)",
          }}
        >
          <div className="absolute inset-3 rounded-[100%] border border-dashed border-white/10" />
        </div>

        {/* car */}
        <div
          className="relative mb-8 w-full max-w-md will-change-transform"
          style={{ transform: `scaleX(${flat < 0 ? Math.min(flat, -0.12) : Math.max(flat, 0.12)})` }}
        >
          <CarArt body={car.body} from={car.from} to={car.to} className="w-full drop-shadow-[0_20px_40px_rgba(56,189,248,0.25)]" />
          {/* reflection */}
          <div
            className="pointer-events-none absolute left-0 top-full w-full -scale-y-100 opacity-20"
            style={{
              maskImage: "linear-gradient(to top, transparent 55%, black)",
              WebkitMaskImage: "linear-gradient(to top, transparent 55%, black)",
            }}
          >
            <CarArt body={car.body} from={car.from} to={car.to} className="w-full" />
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-bold text-white">
            {car.make} {car.model}
          </p>
          <p className="text-sm text-slate-400 capitalize">
            {car.defaultYear} · {car.fuel} · {car.body}
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 16, height: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 13a9 9 0 10-9-9" />
          </svg>
          Drag to rotate · 360°
        </p>
      </div>
    </div>
  );
}
