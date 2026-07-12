"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef, useState } from "react";
import { ApiError, googleLogin, login } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (el: HTMLElement, options: object) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurora.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const initGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null);
        setBusy(true);
        try {
          await googleLogin(response.credential);
          router.push("/dashboard");
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Could not reach the API");
        } finally {
          setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      width: 320,
      text: "continue_with",
    });
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the API");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid-lines relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {GOOGLE_CLIENT_ID && (
        <Script src="https://accounts.google.com/gsi/client" onLoad={initGoogle} strategy="afterInteractive" />
      )}

      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[26rem] w-[26rem] rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="glass relative w-full max-w-md rounded-3xl p-8 md:p-10">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight text-white">
          AUR<span className="text-gradient">O</span>RA
        </Link>
        <p className="mb-8 mt-1 text-sm text-slate-400">Workshop operations console</p>

        <form onSubmit={onSubmit}>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
            required
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-5 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none focus:ring-1 focus:ring-sky-400/40"
            required
          />

          {error && (
            <p className="mb-4 rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-400/25">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-2.5 text-sm font-bold text-slate-950 shadow-[0_8px_30px_-8px_rgba(56,189,248,0.6)] transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div ref={googleBtnRef} className="flex justify-center" />
            <p className="mt-4 text-center text-xs text-slate-500">
              First Google sign-in creates a mechanic account automatically.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
