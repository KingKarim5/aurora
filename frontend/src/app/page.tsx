"use client";

import Link from "next/link";
import { LazyVideo, Reveal, TiltCard } from "@/components/motion";
import { Logo } from "@/components/logo";

/* Unsplash-hosted photography (free license). */
const IMG = {
  hero: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=75",
  twin: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=70",
  diagnostics: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1400&q=70",
  parts: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1400&q=70",
  road: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=70",
  tools: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=2400&q=70",
  washPoster: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=70",
  enginePoster: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=70",
  detailPoster: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=70",
};

/* Pexels-hosted footage (free license). */
const VIDS = {
  wash: "https://videos.pexels.com/video-files/13643099/13643099-hd_1280_720_24fps.mp4",
  engine: "https://videos.pexels.com/video-files/32329382/13790370_2560_1440_25fps.mp4",
  detail: "https://videos.pexels.com/video-files/31220615/13335665_2560_1440_24fps.mp4",
};

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  const C = 2 * Math.PI * 42;
  const off = C * (1 - value / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24 md:h-28 md:w-28">
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

const SHOWCASES = [
  {
    img: IMG.twin,
    eyebrow: "Vehicle Digital Twin",
    title: "A living model of every car",
    body: "Health snapshots become a twin that scores battery, brakes, tires and oil — and predicts failures weeks ahead.",
    anchor: "#twin",
  },
  {
    img: IMG.diagnostics,
    eyebrow: "Intelligent Diagnostics",
    title: "Explainable answers",
    body: "OBD-II codes ranked by severity with likely causes, fleet history and a confidence score. Never a black box.",
    anchor: "#twin",
  },
  {
    img: IMG.parts,
    eyebrow: "Genuine Parts Control",
    title: "Stock that can't lie",
    body: "Transactional inventory with live low-stock alerts. Every part on a job card moves real stock, atomically.",
    anchor: "#platform",
  },
];

const DIAG_FINDINGS = [
  { code: "P0300", title: "Random cylinder misfire", severity: 4, confidence: 87 },
  { code: "P0562", title: "System voltage low", severity: 3, confidence: 74 },
  { code: "P0455", title: "EVAP leak detected (large)", severity: 2, confidence: 66 },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-x-clip">
      {/* nav */}
      <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-black/70 to-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="hidden items-center gap-10 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 md:flex">
            <a href="#showcase" className="transition hover:text-white">Platform</a>
            <a href="#twin" className="transition hover:text-white">Digital Twin</a>
            <a href="#visit" className="transition hover:text-white">Visit</a>
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-white/25 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
          >
            Console
          </Link>
        </div>
      </header>

      {/* full-bleed hero */}
      <section className="relative flex min-h-screen items-end">
        <img
          src={IMG.hero}
          alt="Performance car inside a dark workshop"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-black/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-40 md:pb-32">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">
              Automotive intelligence · Dhaka
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-8xl">
              The workshop,
              <br />
              <span className="text-gradient">reimagined.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
              Every vehicle gets a living digital twin. Every fault gets an explainable
              diagnosis. Every job, part and invoice — under one roof.
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-slate-950 transition hover:bg-sky-200"
              >
                Launch Console
              </Link>
              <a
                href="#showcase"
                className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
              >
                Discover
              </a>
            </div>
          </Reveal>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="h-10 w-6 rounded-full border border-white/30 p-1.5">
            <div className="animate-float-slow h-2 w-2 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* image showcase cards */}
      <section id="showcase" className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">The platform</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl">
            Engineering-grade software for serious workshops
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SHOWCASES.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <a href={s.anchor} className="group block overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-300">
                      {s.eyebrow}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-bold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.body}</p>
                    <p className="mt-3 text-sm font-semibold text-white/80 transition group-hover:translate-x-1 group-hover:text-white">
                      Explore →
                    </p>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* facilities — live footage */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Inside the workshop</p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold text-white md:text-5xl">
            Wash bay. Engine bay. Detailing.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { vid: VIDS.wash, poster: IMG.washPoster, title: "Wash bay", body: "Every service ends with a full exterior wash — part of the standard." },
            { vid: VIDS.engine, poster: IMG.enginePoster, title: "Engine bay", body: "Factory-procedure repairs with genuine and OEM-grade parts." },
            { vid: VIDS.detail, poster: IMG.detailPoster, title: "Detailing", body: "Paint-safe finishing, interior care and delivery-ready presentation." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="group overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <LazyVideo
                    src={f.vid}
                    poster={f.poster}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-red-400" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-300">Live footage</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* parallax stat band */}
      <section
        className="relative bg-cover bg-center bg-fixed py-28"
        style={{ backgroundImage: `url(${IMG.road})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 text-center md:grid-cols-4">
          {[
            ["29", "automated tests"],
            ["18", "BD models in catalog"],
            ["24", "parts pre-stocked"],
            ["100%", "explainable findings"],
          ].map(([n, label], i) => (
            <Reveal key={label} delay={i * 90}>
              <p className="font-display text-4xl font-bold text-white md:text-5xl">{n}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-300">{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* digital twin */}
      <section id="twin" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              Vehicle digital twin
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
              Know the failure before it happens
            </h2>
            <p className="mt-5 leading-relaxed text-slate-400">
              Health snapshots accumulate into a twin that computes a weighted score and runs
              trend analysis over the series — predicting when each component crosses the
              critical line. Derived, never stored: it can&apos;t drift out of sync with reality.
            </p>
            <div className="mt-8 space-y-4">
              {DIAG_FINDINGS.map((d) => (
                <div key={d.code} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-white">
                      {d.code}
                      <span className="ml-3 text-sm font-medium text-slate-400">{d.title}</span>
                    </p>
                    <span className="text-xs font-semibold text-slate-400">sev {d.severity}/5</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
                        style={{ width: `${d.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-sky-300">{d.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <TiltCard className="glass rounded-3xl p-8" maxTilt={4}>
              <div className="mb-6 flex items-baseline justify-between">
                <p className="font-display text-lg font-semibold text-white">DHA-1234 · Toyota Premio</p>
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

      {/* platform strip */}
      <section id="platform" className="border-y border-white/5 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-3">
          {[
            ["Workshop ERP", "Customers, vehicles, appointments and job cards with a real status state machine — illegal transitions are impossible."],
            ["Billing that adds up", "Invoices with tax, partial payments and voiding, generated straight from completed job cards. Cent-accurate."],
            ["Roles & security", "JWT + Google sign-in, with admin / manager / mechanic permissions enforced on every route."],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 100}>
              <p className="font-display border-l-2 border-sky-400 pl-4 text-lg font-semibold text-white">{t}</p>
              <p className="mt-3 pl-4 text-sm leading-relaxed text-slate-400">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA over photography */}
      <section id="visit" className="relative">
        <img src={IMG.tools} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <Reveal>
            <h2 className="font-display text-4xl font-bold text-white md:text-6xl">
              Start your engine.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-slate-300">
              Sign in with Google or your workshop account and take the console for a drive.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-block rounded-full bg-white px-10 py-4 text-sm font-bold uppercase tracking-wider text-slate-950 transition hover:bg-sky-200"
            >
              Launch Console
            </Link>
          </Reveal>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 bg-[#05070d]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-slate-500 md:flex-row">
          <Logo size="sm" />
          <p>Automotive Unified Resource, Operations, Repair &amp; Analytics</p>
          <p>Photography via Unsplash · MIT licensed</p>
        </div>
      </footer>
    </main>
  );
}
