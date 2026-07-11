"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearTokens, getToken } from "@/lib/api";
import { User } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/job-cards", label: "Job Cards" },
  { href: "/parts", label: "Parts" },
  { href: "/invoices", label: "Invoices" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<User>("/auth/me").then(setUser).catch(() => {});
  }, [router]);

  function logout() {
    clearTokens();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col bg-slate-900 text-slate-200">
        <div className="px-5 py-6">
          <p className="text-lg font-bold tracking-tight text-white">
            AUR<span className="text-sky-400">O</span>RA
          </p>
          <p className="text-xs text-slate-400">Workshop console</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 px-5 py-4">
          {user && (
            <p className="mb-2 truncate text-xs text-slate-400">
              {user.full_name} · {user.role}
            </p>
          )}
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
