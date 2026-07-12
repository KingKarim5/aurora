"use client";

import { useId } from "react";
import { BodyStyle } from "@/lib/cars";

/** Stylized body-style silhouettes (240 × 120 viewBox, ground at y≈96). */
const BODY_PATHS: Record<BodyStyle, string> = {
  sedan:
    "M18 90 C22 78 34 72 52 69 C64 52 88 42 118 41 C146 41 166 50 178 64 C198 68 214 76 220 86 C223 92 219 95 212 95 L196 95 A16 16 0 0 0 164 95 L78 95 A16 16 0 0 0 46 95 L26 95 C19 95 16 93 18 90 Z",
  wagon:
    "M18 90 C21 78 32 72 48 69 C58 50 78 41 108 40 L158 40 C176 42 188 52 196 64 C208 69 217 77 221 86 C224 92 220 95 213 95 L196 95 A16 16 0 0 0 164 95 L78 95 A16 16 0 0 0 46 95 L26 95 C19 95 16 93 18 90 Z",
  hatch:
    "M22 90 C26 76 38 70 54 68 C66 50 90 41 118 41 C140 42 156 50 166 62 C186 67 206 76 214 86 C218 92 214 95 207 95 L192 95 A16 16 0 0 0 160 95 L80 95 A16 16 0 0 0 48 95 L30 95 C23 95 20 93 22 90 Z",
  suv:
    "M16 90 C18 76 28 68 44 64 C52 44 72 34 106 33 L164 33 C182 35 194 46 202 60 C212 65 220 74 223 85 C226 92 222 96 214 96 L198 96 A17 17 0 0 0 162 96 L82 96 A17 17 0 0 0 46 96 L24 96 C17 96 14 94 16 90 Z",
  crossover:
    "M17 90 C20 77 31 70 47 66 C56 48 78 38 110 37 L160 37 C178 39 190 49 199 62 C210 67 218 76 222 86 C225 92 221 95 213 95 L197 95 A16 16 0 0 0 164 95 L80 95 A16 16 0 0 0 47 95 L25 95 C18 95 15 93 17 90 Z",
};

const CABIN_PATHS: Record<BodyStyle, string> = {
  sedan: "M64 66 C76 52 96 46 118 46 C138 46 154 52 164 62 L126 65 C102 66 80 66 64 66 Z",
  wagon: "M60 66 C70 50 86 45 108 44 L154 44 C166 46 176 53 184 62 L120 65 C96 66 74 66 60 66 Z",
  hatch: "M66 65 C78 50 98 45 118 45 C134 46 148 52 156 60 L118 64 C98 65 80 65 66 65 Z",
  suv: "M56 62 C64 44 82 38 106 37 L160 37 C174 39 184 48 192 58 L124 61 C98 62 72 62 56 62 Z",
  crossover: "M58 63 C67 47 86 42 110 41 L156 41 C169 43 179 51 187 60 L122 62 C97 63 74 63 58 63 Z",
};

export function CarArt({
  body,
  from,
  to,
  className = "",
}: {
  body: BodyStyle;
  from: string;
  to: string;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const wheelY = body === "suv" ? 96 : 95;
  const wheelR = body === "suv" ? 17 : 16;
  const wheels = [62, 180];

  return (
    <svg viewBox="0 0 240 130" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <radialGradient id={`g${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={from} stopOpacity="0.5" />
          <stop offset="100%" stopColor={from} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="112" rx="98" ry="10" fill={`url(#g${uid})`} />
      <path d={BODY_PATHS[body]} fill={`url(#b${uid})`} opacity="0.9" />
      <path d={CABIN_PATHS[body]} fill="#020617" opacity="0.55" />

      {/* headlight / tail light */}
      <circle cx="216" cy="82" r="3" fill="#fef9c3" opacity="0.95" />
      <circle cx="22" cy="84" r="2.5" fill="#fda4af" opacity="0.9" />

      {wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy={wheelY} r={wheelR} fill="#020617" stroke="rgba(226,232,240,0.6)" strokeWidth="2" />
          <circle cx={x} cy={wheelY} r={wheelR - 7} fill="none" stroke={from} strokeWidth="1.5" opacity="0.8" />
          <circle cx={x} cy={wheelY} r="2.5" fill={from} />
        </g>
      ))}
    </svg>
  );
}
