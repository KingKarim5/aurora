"use client";

import { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent = false }: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-sky-600" : ""}`}>{value}</p>
    </Card>
  );
}

const BADGE_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  awaiting_parts: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  invoiced: "bg-slate-200 text-slate-700",
  cancelled: "bg-slate-100 text-slate-500",
  unpaid: "bg-red-100 text-red-700",
  partially_paid: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  void: "bg-slate-100 text-slate-500",
  good: "bg-emerald-100 text-emerald-800",
  attention: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-700",
  unknown: "bg-slate-100 text-slate-500",
};

export function Badge({ value }: { value: string }) {
  const color = BADGE_COLORS[value] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

export function Td({ children }: { children?: ReactNode }) {
  return <td className="px-4 py-3 text-sm">{children}</td>;
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">{children}</table>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
  );
}

export function Loading() {
  return <p className="py-10 text-center text-sm text-slate-500">Loading…</p>;
}

export function Empty({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-slate-400">{message}</p>;
}

export const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none";
export const btnCls =
  "rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50";
export const btnGhostCls =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50";
