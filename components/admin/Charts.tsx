"use client";

import { useState } from "react";
import { motion } from "motion/react";

export function RevenueChart({ data, currency, locale }: { data: { label: string; value: number; count: number }[]; currency: string; locale: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const W = 600;
  const H = 220;
  const gap = 18;
  const bw = (W - gap * (data.length - 1)) / data.length;
  const fmt = (n: number) =>
    n >= 1e7 ? `${currency}${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `${currency}${(n / 1e5).toFixed(1)}L` : `${currency}${Math.round(n).toLocaleString(locale)}`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={0} x2={W} y1={H - H * t} y2={H - H * t} stroke="currentColor" strokeOpacity={0.07} strokeDasharray="3 4" />
        ))}
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * (H - 30));
          const x = i * (bw + gap);
          const last = i === data.length - 1;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="cursor-default">
              <rect x={x} y={0} width={bw} height={H} fill="transparent" />
              <motion.rect
                x={x}
                width={bw}
                rx={10}
                initial={{ height: 0, y: H }}
                animate={{ height: h, y: H - h }}
                transition={{ duration: 1, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                fill={last ? "var(--accent)" : "var(--ink)"}
                fillOpacity={hover === null || hover === i ? (last ? 1 : 0.88) : 0.25}
              />
              <text x={x + bw / 2} y={H + 20} textAnchor="middle" className="fill-current text-[12px] opacity-50">
                {d.label}
              </text>
              {(hover === i || (hover === null && i === peak)) && (
                <text x={x + bw / 2} y={H - h - 10} textAnchor="middle" className="fill-current text-[13px] font-semibold">
                  {fmt(d.value)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Funnel({ rows }: { rows: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="capitalize text-ink/70">{r.label}</span>
            <span className="font-medium tabular-nums">{r.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: r.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
