"use client";

import { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h1>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, accent = false }: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5 ${
        accent ? "glow-accent" : ""
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
      <p
        className={`font-display mt-2 text-3xl font-bold tracking-tight ${
          accent ? "text-gradient" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const BADGE_COLORS: Record<string, string> = {
  open: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  in_progress: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  awaiting_parts: "bg-purple-400/15 text-purple-300 ring-purple-400/30",
  completed: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  invoiced: "bg-slate-400/15 text-slate-300 ring-slate-400/30",
  cancelled: "bg-slate-500/10 text-slate-500 ring-slate-500/20",
  unpaid: "bg-red-400/15 text-red-300 ring-red-400/30",
  partially_paid: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  paid: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  void: "bg-slate-500/10 text-slate-500 ring-slate-500/20",
  good: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  attention: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  critical: "bg-red-400/15 text-red-300 ring-red-400/30",
  unknown: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
};

export function Badge({ value }: { value: string }) {
  const color = BADGE_COLORS[value] ?? "bg-slate-500/10 text-slate-300 ring-slate-500/20";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${color}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </th>
  );
}

export function Td({ children }: { children?: ReactNode }) {
  return <td className="px-4 py-3 text-sm text-slate-200">{children}</td>;
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="min-w-full divide-y divide-white/10">{children}</table>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-400/25">
      {message}
    </p>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-400">
      <span className="h-2 w-2 animate-pulse-glow rounded-full bg-sky-400" />
      Loading…
    </div>
  );
}

export function Empty({ message }: { message: string }) {
  return <p className="py-14 text-center text-sm text-slate-500">{message}</p>;
}

/* Shared table fragments */
export const theadCls = "bg-white/[0.03]";
export const rowCls = "transition-colors hover:bg-white/[0.04]";
export const tbodyCls = "divide-y divide-white/5";

/* Shared form/control styles */
export const formCardCls = "glass rounded-2xl p-5";
export const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-sky-400/40";
export const btnCls =
  "rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_6px_24px_-6px_rgba(56,189,248,0.5)] transition hover:brightness-110 disabled:opacity-50";
export const btnGhostCls =
  "rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5";
