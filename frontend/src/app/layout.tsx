import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURORA — Automotive Operations Platform",
  description:
    "Automotive Unified Resource, Operations, Repair & Analytics platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
