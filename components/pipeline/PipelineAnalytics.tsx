"use client";

import { useMemo, useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend, FunnelChart, Funnel, LabelList,
} from "recharts";
import type { Deal, DealStage } from "@/lib/types/app.types";

// ── Constants ────────────────────────────────────────────────────────────────

const PIPELINE_STAGES: DealStage[] = [
  "Source", "Connect", "Quick Screen", "One Pager",
  "Investment Memo", "Due Diligence", "Close", "In Portfolio",
];

const STAGE_COLORS: Record<string, string> = {
  "Source":           "#94a3b8",
  "Connect":          "#60a5fa",
  "Quick Screen":     "#818cf8",
  "One Pager":        "#a78bfa",
  "Investment Memo":  "#f59e0b",
  "Due Diligence":    "#f97316",
  "Close":            "#22c55e",
  "In Portfolio":     "#10b981",
  "On Hold":          "#fbbf24",
  "Too Early":        "#94a3b8",
  "Rejected":         "#f87171",
  "Needs Attention":  "#fb923c",
};

const VERTICAL_COLORS = [
  "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
  "#ec4899", "#14b8a6", "#8b5cf6", "#f97316", "#06b6d4",
];

const FUND_COLORS: Record<string, string> = {
  "HV Genesis":                   "#0077b5",
  "HV STEM":                      "#7c3aed",
  "Real Estate Investment Fund":  "#0891b2",
};

// ── Shared tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name?: string; fill?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-md text-sm">
      {label && <p className="font-medium text-gray-800 mb-0.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">
          {p.name ? `${p.name}: ` : ""}
          <span className="font-semibold text-gray-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Chart wrapper ─────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  activeDeals: Deal[];
  inactiveDeals: Deal[];
}

export function PipelineAnalytics({ activeDeals, inactiveDeals }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const allDeals = useMemo(() => [...activeDeals, ...inactiveDeals], [activeDeals, inactiveDeals]);

  const stats = useMemo(() => {
    const total       = allDeals.length;
    const active      = activeDeals.length;
    const portfolio   = allDeals.filter((d) => d.stage === "In Portfolio").length;
    const rejected    = allDeals.filter((d) => d.stage === "Rejected").length;
    const rejectRate  = total ? ((rejected / total) * 100).toFixed(1) : "0";
    const reached     = allDeals.filter((d) => d.contact_status === "Reached Out").length;
    const reachRate   = total ? ((reached / total) * 100).toFixed(1) : "0";

    // Stage funnel (active pipeline stages only)
    const stageCounts = PIPELINE_STAGES.map((stage) => ({
      stage,
      count: allDeals.filter((d) => d.stage === stage).length,
    }));

    // Conversion: % of all deals that reached each stage or beyond
    const stageConversion = PIPELINE_STAGES.map((stage, i) => {
      const atOrBeyond = allDeals.filter((d) =>
        PIPELINE_STAGES.indexOf(d.stage) >= i || d.stage === "In Portfolio"
      ).length;
      return {
        stage,
        pct: total ? +((atOrBeyond / total) * 100).toFixed(1) : 0,
      };
    });

    // By vertical
    const vertMap: Record<string, number> = {};
    for (const d of allDeals) {
      const vert = d.industry_vertical?.split(";")[0]?.trim() || "Unknown";
      vertMap[vert] = (vertMap[vert] ?? 0) + 1;
    }
    const vertData = Object.entries(vertMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // By fund (sub_pipeline)
    const fundMap: Record<string, number> = {};
    for (const d of allDeals) {
      const fund = d.sub_pipeline || "Unassigned";
      fundMap[fund] = (fundMap[fund] ?? 0) + 1;
    }
    const fundData = Object.entries(fundMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    // By investment cycle
    const cycleMap: Record<string, number> = {};
    for (const d of allDeals) {
      const cycle = d.investment_cycle || "Unknown";
      cycleMap[cycle] = (cycleMap[cycle] ?? 0) + 1;
    }
    const cycleData = Object.entries(cycleMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => ({ name, count }));

    // Top sourcing analysts
    const analystMap: Record<string, number> = {};
    for (const d of allDeals) {
      const names = [d.sourcing_analyst, d.deal_owner]
        .flatMap((s) => s?.split(",").map((n) => n.trim()) ?? [])
        .filter(Boolean);
      for (const name of names) {
        analystMap[name] = (analystMap[name] ?? 0) + 1;
      }
    }
    const topAnalysts = Object.entries(analystMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Inactive breakdown
    const inactiveBreakdown = [
      { name: "Rejected",   value: allDeals.filter((d) => d.stage === "Rejected").length },
      { name: "On Hold",    value: allDeals.filter((d) => d.stage === "On Hold").length },
      { name: "Too Early",  value: allDeals.filter((d) => d.stage === "Too Early").length },
    ];

    return {
      total, active, portfolio, rejected, rejectRate,
      reached, reachRate,
      stageCounts, stageConversion,
      vertData, fundData, cycleData, topAnalysts, inactiveBreakdown,
    };
  }, [allDeals, activeDeals]);

  return (
    <div className="space-y-6">
      {/* ── Summary stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Deals" value={stats.total.toLocaleString()} />
        <StatCard label="Active Pipeline" value={stats.active.toLocaleString()}
          sub="excl. rejected / on hold" />
        <StatCard label="In Portfolio" value={stats.portfolio}
          accent="text-emerald-600" />
        <StatCard label="Rejection Rate" value={`${stats.rejectRate}%`}
          sub={`${stats.rejected} rejected`} accent="text-red-500" />
        <StatCard label="Contact Rate" value={`${stats.reachRate}%`}
          sub={`${stats.reached} reached out`} accent="text-brand-600" />
      </div>

      {/* ── Row 1: Stage funnel + Conversion ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Deals by Pipeline Stage" subtitle="Active stages only">
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.stageCounts}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 12, bottom: 0 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="count" name="Deals" radius={[0, 4, 4, 0]}>
                  {stats.stageCounts.map((entry) => (
                    <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton h={280} />}
        </ChartCard>

        <ChartCard title="Stage Conversion Rate" subtitle="% of all deals that reached each stage">
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.stageConversion}
                layout="vertical"
                margin={{ top: 0, right: 48, left: 12, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="stage" width={110} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip
                  content={<ChartTooltip />}
                  formatter={(v: number) => [`${v}%`]}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="pct" name="Conversion" radius={[0, 4, 4, 0]} fill="#6366f1" fillOpacity={0.75}>
                  <LabelList dataKey="pct" position="right" formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 11, fill: "#6b7280" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton h={280} />}
        </ChartCard>
      </div>

      {/* ── Row 2: Vertical + Fund breakdown ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Deals by Vertical">
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.vertData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="count" name="Deals" radius={[0, 4, 4, 0]}>
                  {stats.vertData.map((entry, i) => (
                    <Cell key={entry.name} fill={VERTICAL_COLORS[i % VERTICAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton h={280} />}
        </ChartCard>

        <ChartCard title="Deals by Fund">
          {mounted ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.fundData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {stats.fundData.map((entry) => (
                    <Cell key={entry.name}
                      fill={FUND_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Skeleton h={280} />}
        </ChartCard>
      </div>

      {/* ── Row 3: By cycle + Inactive breakdown ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Deals per Investment Cycle" subtitle="All cycles, chronological">
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.cycleData} margin={{ top: 4, right: 8, left: -20, bottom: 32 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="count" name="Deals" radius={[4, 4, 0, 0]} fill="#0077b5" fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton h={220} />}
        </ChartCard>

        <ChartCard title="Inactive Deal Breakdown" subtitle="Rejected, On Hold, Too Early">
          {mounted ? (
            <div className="flex flex-col gap-3 pt-2">
              {stats.inactiveBreakdown.map((item) => {
                const pct = stats.total ? (item.value / stats.total) * 100 : 0;
                const colorMap: Record<string, string> = {
                  Rejected: "bg-red-400",
                  "On Hold": "bg-amber-400",
                  "Too Early": "bg-gray-300",
                };
                const textMap: Record<string, string> = {
                  Rejected: "text-red-600",
                  "On Hold": "text-amber-600",
                  "Too Early": "text-gray-500",
                };
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${textMap[item.name]}`}>{item.name}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {item.value}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          ({pct.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorMap[item.name]}`}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <Skeleton h={160} />}
        </ChartCard>
      </div>

      {/* ── Top analysts table ───────────────────────────────────────────────── */}
      <ChartCard title="Top Sourcing Analysts" subtitle="By total deal count (sourcing analyst + deal owner)">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="text-left px-1 pb-2 font-medium">Rank</th>
                <th className="text-left px-1 pb-2 font-medium">Analyst</th>
                <th className="text-right px-1 pb-2 font-medium">Deals</th>
                <th className="px-1 pb-2 w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.topAnalysts.map((a, i) => {
                const max = stats.topAnalysts[0]?.count ?? 1;
                const pct = (a.count / max) * 100;
                return (
                  <tr key={a.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-1 py-2.5 text-gray-400 font-mono text-xs w-8">
                      {i + 1}
                    </td>
                    <td className="px-1 py-2.5 font-medium text-gray-800">{a.name}</td>
                    <td className="px-1 py-2.5 text-right font-semibold text-gray-900 tabular-nums">
                      {a.count}
                    </td>
                    <td className="px-1 py-2.5">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-40">
                        <div
                          className="h-full bg-brand-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {stats.topAnalysts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-xs">
                    No analyst data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

// ── Skeleton placeholder ──────────────────────────────────────────────────────

function Skeleton({ h }: { h: number }) {
  return (
    <div
      className="bg-gray-100 rounded-lg animate-pulse"
      style={{ height: h }}
    />
  );
}
