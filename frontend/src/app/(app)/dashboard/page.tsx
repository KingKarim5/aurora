"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats, User } from "@/lib/types";
import { Loading } from "@/components/ui";
import { CountUp, Reveal } from "@/components/motion";

function StatTile({
  label,
  value,
  prefix = "",
  accent = false,
  delay = 0,
}: {
  label: string;
  value: number;
  prefix?: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className={`glass group rounded-2xl p-5 transition duration-200 hover:-translate-y-1 ${
          accent ? "glow-accent" : "hover:shadow-[0_14px_40px_-14px_rgba(56,189,248,0.3)]"
        }`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
        <p
          className={`font-display mt-2 text-3xl font-bold tracking-tight ${
            accent ? "text-gradient" : "text-white"
          }`}
        >
          <CountUp value={value} prefix={prefix} />
        </p>
      </div>
    </Reveal>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<DashboardStats>("/dashboard").then(setStats).catch(() => {});
    api<User>("/auth/me").then(setUser).catch(() => {});
  }, []);

  if (!stats) return <Loading />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <Reveal>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-white">
            {greeting}
            {user ? `, ${user.full_name.split(" ")[0]}` : ""} — the floor at a glance
          </h1>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatTile label="Revenue this month" value={Number(stats.revenue_this_month)} prefix="$" accent />
        <StatTile label="Outstanding balance" value={Number(stats.outstanding_balance)} prefix="$" delay={60} />
        <StatTile label="Open job cards" value={stats.open_job_cards} delay={120} />
        <StatTile label="Jobs in progress" value={stats.jobs_in_progress} delay={180} />
        <StatTile label="Unpaid invoices" value={stats.unpaid_invoices} delay={240} />
        <StatTile label="Low-stock parts" value={stats.low_stock_parts} delay={300} />
        <StatTile label="Upcoming appointments" value={stats.upcoming_appointments} delay={360} />
        <StatTile label="Customers" value={stats.total_customers} delay={420} />
        <StatTile label="Vehicles" value={stats.total_vehicles} delay={480} />
      </div>
    </div>
  );
}
