"use client";

import Link from "next/link";
import { Reveal, TiltCard, useMouseParallax } from "@/components/motion";

/* ---------- shared bits ---------- */

function Logo({ className = "text-xl" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight text-white ${className}`}>
      AUR<span className="text-gradient">O</span>RA
    </span>
  );
}

function CarSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 820 300" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="glassline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="underglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* under-glow */}
      <ellipse cx="410" cy="262" rx="330" ry="26" fill="url(#underglow)" />

      {/* body */}
      <path
        d="M60 228
           C70 200 90 182 130 172
           C160 122 220 88 320 82
           C380 50 480 46 540 74
           C600 92 660 118 706 150
           C744 162 766 186 770 210
           C774 224 766 232 748 234
           L640 236
           A52 52 0 0 0 538 236
           L282 236
           A52 52 0 0 0 180 236
           L84 234
           C64 234 56 230 60 228 Z"
        fill="url(#body)"
        stroke="rgba(148,163,184,0.35)"
        strokeWidth="1.5"
      />
      {/* cabin glass */}
      <path
        d="M330 88 C382 62 470 58 528 82 C560 94 588 108 610 122 L470 128 C420 128 366 116 330 88 Z"
        fill="#0ea5e9"
        opacity="0.12"
        stroke="rgba(125,211,252,0.5)"
        strokeWidth="1.5"
      />
      {/* character line */}
      <path d="M96 196 C240 168 560 160 744 202" stroke="url(#glassline)" strokeWidth="2" />

      {/* headlight */}
      <path d="M742 190 L770 206" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" />
      <path d="M736 200 L768 214" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
      {/* tail light */}
      <path d="M62 214 L92 206" stroke="#f87171" strokeWidth="4" strokeLinecap="round" />

      {/* wheels */}
      {[231, 589].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="236" r="44" fill="#020617" stroke="rgba(148,163,184,0.5)" strokeWidth="2" />
          <circle cx={cx} cy="236" r="27" fill="none" stroke="rgba(125,211,252,0.55)" strokeWidth="1.5" />
          <circle cx={cx} cy="236" r="6" fill="#38bdf8" opacity="0.8" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line
              key={a}
              x1={cx}
              y1="236"
              x2={cx + 25 * Math.cos((a * Math.PI) / 180)}
              y2={236 + 25 * Math.sin((a * Math.PI) / 180)}
              stroke="rgba(148,163,184,0.45)"
              strokeWidth="1.5"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  const C = 2 * Math.PI * 42;
  const off = C * (1 - value / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={off}
            className="animate-gauge"
            style={{ ["--gauge-max" as string]: C }}
          />
        </svg>
        <span className="font-display absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
          {value}
        </span>
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

const FEATURES = [
  {
    title: "Workshop ERP",
    body: "Customers, vehicles, appointments and job cards with a real state machine — illegal transitions are physically impossible.",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
  {
    title: "Vehicle Digital Twin",
    body: "Every vehicle accumulates health snapshots. The twin scores battery, brakes, tires and oil — and predicts failures before they happen.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Intelligent Diagnostics",
    body: "OBD-II codes ranked by severity, enriched with fleet history and an explainable confidence score. Never a black box.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Transactional Inventory",
    body: "Adding a part to a job decrements stock atomically. Overdraws rejected, removals restored. Low-stock alerts built in.",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    title: "Billing that adds up",
    body: "Invoices with tax, partial payments and voiding — generated straight from completed job cards, cent-accurate.",
    icon: "M9 8h6m-5 4h4m-7 8h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Roles & security",
    body: "JWT access + refresh tokens, Google sign-in, and admin / manager / mechanic roles enforced on every route.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
];

const DIAG_FINDINGS = [
  { code: "P0300", title: "Random cylinder misfire", severity: 4, confidence: 87 },
  { code: "P0562", title: "System voltage low", severity: 3, confidence: 74 },
  { code: "P0455", title: "EVAP leak detected (large)", severity: 2, confidence: 66 },
];

/* ---------- page ---------- */

export default function LandingPage() {
  const parallax = useMouseParallax(18);

  return (
    <main className="relative overflow-x-clip">
      {/* nav */}
      <header className="glass-deep sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#platform" className="transition hover:text-white">Platform</a>
            <a href="#twin" className="transition hover:text-white">Digital Twin</a>
            <a href="#diagnostics" className="transition hover:text-white">Diagnostics</a>
          </nav>
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_6px_24px_-6px_rgba(56,189,248,0.5)] transition hover:brightness-110"
          >
            Open Console
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="grid-lines relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-sky-500/10 blur-3xl"
            style={parallax(0.4)}
          />
          <div
            className="absolute left-[-12%] top-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-400/10 blur-3xl"
            style={parallax(0.7)}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-20 text-center md:pt-28">
          <Reveal>
            <p className="mx-auto mb-5 w-fit rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              The workshop operating system
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl">
              Automotive excellence,
              <br />
              <span className="text-gradient">engineered.</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 md:text-lg">
              AURORA unifies your workshop&apos;s operations, every vehicle&apos;s living digital
              twin, and explainable AI diagnostics — in one dark, fast, beautiful console.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_40px_-8px_rgba(56,189,248,0.6)] transition hover:brightness-110"
              >
                Launch Console →
              </Link>
              <a
                href="#platform"
                className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/5"
              >
                Explore the platform
              </a>
            </div>
          </Reveal>

          {/* car stage */}
          <Reveal delay={420}>
            <div className="relative mx-auto mt-14 max-w-4xl">
              {/* light beam sweeping the stage */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="animate-beam absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-sky-200/10 to-transparent" />
              </div>

              <div className="glass relative rounded-3xl px-6 pb-2 pt-8 md:px-12">
                <div style={parallax(0.25)}>
                  <CarSilhouette className="mx-auto w-full max-w-3xl drop-shadow-[0_18px_40px_rgba(56,189,248,0.18)]" />
                </div>

                {/* floating HUD chips */}
                <div
                  className="glass animate-float-slow absolute -left-3 top-10 hidden rounded-xl px-4 py-3 text-left md:block"
                  style={parallax(0.9)}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Twin health</p>
                  <p className="font-display text-xl font-bold text-emerald-300">94 / 100</p>
                </div>
                <div
                  className="glass animate-float-slower absolute -right-4 top-24 hidden rounded-xl px-4 py-3 text-left md:block"
                  style={parallax(1.2)}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Prediction</p>
                  <p className="text-sm font-semibold text-amber-300">Brakes critical in ~41 days</p>
                </div>
                <div
                  className="glass animate-float-slow absolute bottom-16 left-8 hidden rounded-xl px-4 py-3 text-left lg:block"
                  style={parallax(0.7)}
                >
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">Live scan</p>
                  <p className="text-sm font-semibold text-sky-300">P0300 · confidence 87%</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* stats strip */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 text-center md:grid-cols-4">
          {[
            ["29", "automated tests"],
            ["6", "status state machine"],
            ["4", "health systems tracked"],
            ["100%", "explainable findings"],
          ].map(([n, label], i) => (
            <Reveal key={label} delay={i * 80}>
              <p className="font-display text-3xl font-bold text-gradient md:text-4xl">{n}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="platform" className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <h2 className="font-display text-center text-3xl font-bold text-white md:text-4xl">
            Everything a modern workshop runs on
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Not a CRUD demo — an operational core with real invariants.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <TiltCard className="glass group h-full rounded-2xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-400/10 ring-1 ring-sky-400/30 transition group-hover:bg-sky-400/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* digital twin */}
      <section id="twin" className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Vehicle digital twin
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              A living model of every car you service
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Health snapshots accumulate into a twin that computes a weighted health score and
              runs trend analysis over the series — predicting when each component crosses the
              critical line. Derived, never stored: it can&apos;t drift out of sync with reality.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold text-sky-300 transition hover:text-sky-200"
            >
              See a twin in the console →
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <TiltCard className="glass rounded-3xl p-8" maxTilt={4}>
              <div className="mb-6 flex items-baseline justify-between">
                <p className="font-display text-lg font-semibold text-white">DHA-1234 · Toyota Aqua</p>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  GOOD · 94
                </span>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Gauge label="Battery" value={92} color="#34d399" />
                <Gauge label="Brakes" value={71} color="#fbbf24" />
                <Gauge label="Tires" value={88} color="#34d399" />
                <Gauge label="Oil" value={97} color="#38bdf8" />
              </div>
              <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                ⚠ Brake pads trending down 0.7/day — critical in ≈ 41 days. Book service now.
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* diagnostics */}
      <section id="diagnostics" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1" delay={150}>
            <div className="space-y-4">
              {DIAG_FINDINGS.map((d) => (
                <TiltCard key={d.code} className="glass rounded-2xl p-5" maxTilt={4}>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-bold text-white">
                      {d.code}
                      <span className="ml-3 text-sm font-medium text-slate-400">{d.title}</span>
                    </p>
                    <span className="text-xs font-semibold text-slate-400">
                      severity {d.severity}/5
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                        style={{ width: `${d.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-sky-300">{d.confidence}%</span>
                  </div>
                </TiltCard>
              ))}
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
              Intelligent diagnostics
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Explainable answers, not black boxes
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Scan OBD-II codes against a curated knowledge base. Every finding ships with likely
              causes, recommended actions, fleet history (&quot;seen 3× on this model&quot;) and a
              confidence score your mechanics can actually reason about.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <Reveal>
          <div className="glass glow-accent mx-auto max-w-4xl rounded-3xl px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Start your engine.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Sign in with Google or your workshop account and take the console for a drive.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-[0_10px_40px_-8px_rgba(56,189,248,0.6)] transition hover:brightness-110"
            >
              Launch Console →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">
          <Logo className="text-base" />
          <p>Automotive Unified Resource, Operations, Repair &amp; Analytics</p>
          <p>MIT licensed</p>
        </div>
      </footer>
    </main>
  );
}
