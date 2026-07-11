"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aurora.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold tracking-tight">
          AUR<span className="text-sky-600">O</span>RA
        </h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Workshop operations console
        </p>

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          required
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
          required
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
