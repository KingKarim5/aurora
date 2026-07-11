"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import { Loading, PageHeader, StatCard } from "@/components/ui";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api<DashboardStats>("/dashboard").then(setStats).catch(() => {});
  }, []);

  if (!stats) return <Loading />;

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Revenue this month" value={`$${stats.revenue_this_month}`} accent />
        <StatCard label="Outstanding balance" value={`$${stats.outstanding_balance}`} />
        <StatCard label="Open job cards" value={stats.open_job_cards} />
        <StatCard label="Jobs in progress" value={stats.jobs_in_progress} />
        <StatCard label="Unpaid invoices" value={stats.unpaid_invoices} />
        <StatCard label="Low-stock parts" value={stats.low_stock_parts} />
        <StatCard label="Upcoming appointments" value={stats.upcoming_appointments} />
        <StatCard label="Customers" value={stats.total_customers} />
        <StatCard label="Vehicles" value={stats.total_vehicles} />
      </div>
    </div>
  );
}
