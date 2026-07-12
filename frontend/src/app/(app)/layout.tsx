"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearTokens, getToken } from "@/lib/api";
import { User } from "@/lib/types";
import { Logo } from "@/components/logo";
import { CarArt } from "@/components/car-art";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/customers", label: "Customers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/vehicles", label: "Vehicles", icon: "M8 7h8m-8 0a4 4 0 00-4 4v5a1 1 0 001 1h1a2 2 0 104 0h4a2 2 0 104 0h1a1 1 0 001-1v-5a4 4 0 00-4-4M8 7l1-3h6l1 3" },
  { href: "/job-cards", label: "Job Cards", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { href: "/parts", label: "Parts", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/invoices", label: "Invoices", icon: "M9 8h6m-5 4h4m-7 8h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" },
];

const ADMIN_NAV = [
  { href: "/team", label: "Team", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

/** Faint automotive backdrop behind every console page. */
function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-lines absolute inset-0" />
      <div className="absolute -top-32 right-[-15%] h-[36rem] w-[36rem] rounded-full bg-sky-500/[0.07] blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.05] blur-3xl" />
      <img
        src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1600&q=50"
        alt=""
        className="absolute bottom-0 right-0 w-[52rem] max-w-none opacity-[0.05] grayscale"
        style={{
          maskImage: "radial-gradient(70% 70% at 60% 60%, black, transparent)",
          WebkitMaskImage: "radial-gradient(70% 70% at 60% 60%, black, transparent)",
        }}
      />
    </div>
  );
}

/** What customer-role accounts (Google sign-ins) see instead of the staff console. */
function CustomerHome({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <main className="grid-lines relative flex min-h-screen items-center justify-center px-4">
      <AmbientBackdrop />
      <div className="glass w-full max-w-xl rounded-3xl p-8 text-center md:p-12">
        <div className="flex justify-center"><Logo size="lg" href="/" sub="Customer portal" /></div>
        <CarArt body="sedan" from="#38bdf8" to="#22d3ee" className="mx-auto mt-6 w-64" />
        <h1 className="font-display mt-4 text-2xl font-bold text-white">
          Welcome, {user.full_name.split(" ")[0]}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Your customer account is active. Online service tracking — your vehicle&apos;s digital
          twin, job progress and invoices — is coming to this portal soon. For now, call or visit
          the workshop and we&apos;ll take care of everything.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="tel:+8801700000000"
            className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110"
          >
            Call the workshop
          </a>
          <button
            onClick={onLogout}
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<User>("/auth/me").then(setUser).catch(() => {});
  }, [router]);

  // close the drawer whenever the route changes
  useEffect(() => setMenuOpen(false), [pathname]);

  function logout() {
    clearTokens();
    router.replace("/login");
  }

  if (user?.role === "customer") {
    return <CustomerHome user={user} onLogout={logout} />;
  }

  const nav = user?.role === "admin" ? [...NAV, ...ADMIN_NAV] : NAV;

  const sidebar = (
    <>
      <div className="px-5 py-6">
        <Logo size="md" sub="Workshop console" />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-sky-500/20 to-cyan-400/10 text-sky-200 ring-1 ring-sky-400/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className={`shrink-0 ${active ? "text-sky-300" : ""}`}
                style={{ width: 18, height: 18 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 px-5 py-4">
        {user && (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-xs font-bold text-slate-950">
              {user.full_name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">{user.full_name}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="text-sm font-medium text-slate-400 transition hover:text-white"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AmbientBackdrop />

      {/* mobile top bar */}
      <header className="glass-deep sticky top-0 z-40 flex items-center justify-between px-4 py-3 lg:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-lg border border-white/15 p-2 text-slate-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {/* mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="glass-deep absolute inset-y-0 left-0 flex w-72 flex-col border-r border-white/10">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* desktop sidebar */}
      <aside className="glass-deep sticky top-0 hidden h-screen w-60 flex-col border-r border-white/5 lg:flex">
        {sidebar}
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
