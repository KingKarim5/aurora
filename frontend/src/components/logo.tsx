"use client";

import Link from "next/link";
import { useId } from "react";

/** AURORA emblem: a tachometer arc with the "A" as its needle. */
export function LogoMark({ size = 34 }: { size?: number }) {
  const uid = useId().replace(/[:]/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`lg${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {/* gauge arc, open at the bottom like a tachometer */}
      <path
        d="M10.7 37.3 A19 19 0 1 1 37.3 37.3"
        stroke={`url(#lg${uid})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* redline tick */}
      <path d="M37.9 33.2 L41.9 35.7" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
      {/* ticks */}
      <path d="M8 24 H12" stroke="rgba(226,232,240,0.55)" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 8 V12" stroke="rgba(226,232,240,0.55)" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 24 H40" stroke="rgba(226,232,240,0.55)" strokeWidth="2" strokeLinecap="round" />
      {/* the A / needle */}
      <path
        d="M16.5 36 L24 16 L31.5 36"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19.8 29.5 H28.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="36" r="2.2" fill="#22d3ee" />
    </svg>
  );
}

export function Logo({
  size = "md",
  href = "/",
  sub,
}: {
  size?: "sm" | "md" | "lg";
  href?: string | null;
  sub?: string;
}) {
  const dims = { sm: 26, md: 34, lg: 44 }[size];
  const text = { sm: "text-base", md: "text-xl", lg: "text-2xl" }[size];
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={dims} />
      <span className="leading-none">
        <span className={`font-display block font-bold tracking-tight text-white ${text}`}>
          AUR<span className="text-gradient">O</span>RA
        </span>
        {sub && (
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            {sub}
          </span>
        )}
      </span>
    </span>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
