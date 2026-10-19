// app/account/pay/PaystubGrowthExample.tsx
"use client";

import { useState } from "react";

type Line = { title: string; net: number };
type Stage = { label: string; blurb: string; lines: Line[] };

const STAGES: Stage[] = [
  {
    label: "1 game out",
    blurb: "A normal month after Duskline's launch spike has settled.",
    lines: [{ title: "Duskline", net: 8000 }],
  },
  {
    label: "2 games out",
    blurb: "Gate Coverage Sim launches while Duskline keeps trickling in.",
    lines: [
      { title: "Duskline", net: 6000 },
      { title: "Gate Coverage Sim", net: 9000 },
    ],
  },
  {
    label: "3 games + DLC",
    blurb: "Every title and paid pack adds to the same monthly pool.",
    lines: [
      { title: "Duskline", net: 6000 },
      { title: "Gate Coverage Sim", net: 9000 },
      { title: "Rage Room Sim", net: 14000 },
      { title: "Rage Room Sim DLC packs", net: 1500 },
    ],
  },
  {
    label: "Big month",
    blurb: "What a breakout month could look like if all three titles sell well at once.",
    lines: [
      { title: "Duskline", net: 48000 },
      { title: "Gate Coverage Sim", net: 27488 },
      { title: "Rage Room Sim", net: 56370 },
    ],
  },
  {
    label: "Verdantium launch",
    blurb: "The whole catalog plus a flagship launch in the same month.",
    lines: [
      { title: "Duskline", net: 47390 },
      { title: "Gate Coverage Sim", net: 17400 },
      { title: "Rage Room Sim", net: 39304 },
      { title: "Rage Room Sim DLC (6 packs)", net: 8480 },
      { title: "Verdantium", net: 186304 },
    ],
  },
];

const STUDIO_RATE = 0.3;
const POOL_RATE = 0.7;
const TAX_RATE = 0.3;

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

export default function PaystubGrowthExample({
  poolMembers = 4,
}: {
  poolMembers?: number;
}) {
  const [active, setActive] = useState(2);
  const stage = STAGES[active];

  const yourRate = POOL_RATE / poolMembers;
  const total = stage.lines.reduce((sum, l) => sum + l.net, 0);
  const studioShare = total * STUDIO_RATE;
  const teamPool = total * POOL_RATE;
  const yourShare = teamPool / poolMembers;
  const taxSetAside = yourShare * TAX_RATE;
  const pct = (yourRate * 100).toFixed(yourRate * 100 % 1 === 0 ? 0 : 1);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-400">
          How your paystub grows
        </h3>
        <span className="rounded-full border border-yellow-500/60 px-3 py-0.5 text-xs text-yellow-400">
          Example data
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        Every title the studio releases adds to the same monthly pool, and
        everyone on the team earns from all of them. Here&apos;s a sample
        month at each stage, with {poolMembers} people in the Team Pool (
        {pct}% each).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              i === active
                ? "bg-cyan-400 font-semibold text-black"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-zinc-400">{stage.blurb}</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 font-normal">Title</th>
              <th className="py-2 text-right font-normal">Net revenue</th>
              <th className="py-2 text-right font-normal">Your share ({pct}%)</th>
            </tr>
          </thead>
          <tbody>
            {stage.lines.map((l) => (
              <tr key={l.title} className="border-t border-white/5">
                <td className="py-2 text-zinc-200">{l.title}</td>
                <td className="py-2 text-right text-zinc-200">{usd(l.net)}</td>
                <td className="py-2 text-right text-zinc-200">
                  {usd(l.net * yourRate)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-white/10 font-semibold text-white">
              <td className="py-2">Total</td>
              <td className="py-2 text-right">{usd(total)}</td>
              <td className="py-2 text-right">{usd(yourShare)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Stat label="Studio Share (30%)" value={usd(studioShare)} />
        <Stat label="Team Pool (70%)" value={usd(teamPool)} />
        <Stat label="Your payout" value={usd(yourShare)} highlight />
        <Stat label="Set aside for taxes" value={usd(taxSetAside)} warn />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl bg-black/30 p-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-base font-semibold ${
          warn ? "text-orange-300" : highlight ? "text-cyan-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

    <p className="mt-4 text-xs text-zinc-400">
        These are made-up examples to show how payouts work as the studio
        releases more titles. They are not projections or promises. Real
        payouts depend entirely on actual sales and will vary a lot from
        month to month.
      </p>