"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend, ReferenceLine,
} from "recharts";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
  rubrics: InterviewRubric[];
}

// ─── Colour palettes ────────────────────────────────────────────────────────
const VERTICAL_COLORS: Record<string, string> = {
  "Financial Technology": "#6366f1",
  "Consumer Products":    "#0891b2",
  "Sports & Wellness":    "#10b981",
  "Sustainability":       "#f59e0b",
};
const GRAD_COLORS = ["#4f46e5", "#7c3aed", "#0ea5e9", "#06b6d4", "#94a3b8"];
const DECISION_COLORS: Record<string, string> = {
  Yes:       "#16a34a",
  No:        "#dc2626",
  Maybe:     "#d97706",
  Class:     "#6b7280",
  Undecided: "#cbd5e1",
};
const GPA_BAR_COLOR = "#6366f1";

// ─── GPA ranges ───────────────────────────────────────────────────────────────
const GPA_RANGES = [
  { label: "< 3.0",    min: 0,   max: 3.0  },
  { label: "3.0–3.2",  min: 3.0, max: 3.2  },
  { label: "3.2–3.4",  min: 3.2, max: 3.4  },
  { label: "3.4–3.6",  min: 3.4, max: 3.6  },
  { label: "3.6–3.8",  min: 3.6, max: 3.8  },
  { label: "3.8–4.0",  min: 3.8, max: 4.01 },
];

// ─── Rubric score keys ────────────────────────────────────────────────────────
const BEHAVIORAL_KEYS = ["b1","b2","b3","b4","b5","b6","b7","b8","b9"];
const TECHNICAL_KEYS  = ["t1a","t1b","t2","t3","t4","t5","qs1","qs2","qs3"];

function sumKeys(responses: Record<string, unknown>, keys: string[]) {
  return keys.reduce((acc, k) => acc + (typeof responses[k] === "number" ? (responses[k] as number) : 0), 0);
}

// ─── Histogram builder ────────────────────────────────────────────────────────
function buildHistogram(scores: number[], maxScore: number, binWidth: number) {
  if (scores.length === 0) return { bins: [], mean: 0 };
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const binCount = Math.ceil(maxScore / binWidth);
  const bins = Array.from({ length: binCount }, (_, i) => {
    const lo = i * binWidth;
    const hi = lo + binWidth;
    return {
      label: `${lo}–${hi}`,
      midpoint: lo + binWidth / 2,
      count: scores.filter((s) => s >= lo && s < hi).length,
    };
  });
  return { bins, mean };
}

// ─── Shared tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name?: string }[]; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-sm">
      {label && <p className="font-medium text-gray-800 mb-0.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600">
          {p.name ? `${p.name}: ` : ""}<span className="font-medium text-gray-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Score bar chart ──────────────────────────────────────────────────────────
function ScoreBarChart({
  title, scores, maxScore, binWidth, color,
}: {
  title: string;
  scores: number[];
  maxScore: number;
  binWidth: number;
  color: string;
}) {
  const { bins, mean } = useMemo(
    () => buildHistogram(scores, maxScore, binWidth),
    [scores, maxScore, binWidth]
  );

  if (scores.length === 0) {
    return (
      <ChartCard title={title}>
        <div className="h-[210px] flex items-center justify-center text-sm text-gray-400">
          No scored rubrics yet
        </div>
      </ChartCard>
    );
  }

  // Find which bin contains the mean to highlight it
  const meanBinIdx = bins.findIndex((b) => mean < b.midpoint + binWidth / 2 && mean >= b.midpoint - binWidth / 2);

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={bins} margin={{ top: 16, right: 12, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={40}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload as { label: string; count: number };
              return (
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs text-gray-700">
                  <span className="font-medium text-gray-900">{d.label}</span>
                  <span className="ml-2">{d.count} {d.count === 1 ? "candidate" : "candidates"}</span>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {bins.map((_, i) => (
              <Cell
                key={i}
                fill={color}
                fillOpacity={i === meanBinIdx ? 1 : 0.55}
              />
            ))}
          </Bar>
          <ReferenceLine
            x={bins[meanBinIdx]?.label}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="5 3"
            label={{
              value: `avg ${mean.toFixed(1)}`,
              position: "top",
              fontSize: 11,
              fill: color,
              fontWeight: 700,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-0.5 text-xs text-gray-400">
        <span>Mean <span className="font-medium text-gray-700">{mean.toFixed(1)}</span></span>
        <span>Max <span className="font-medium text-gray-700">{maxScore}</span></span>
        <span>n <span className="font-medium text-gray-700">{scores.length}</span></span>
      </div>
    </ChartCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AIAnalysisTab({ applicants, rubrics }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Rubric score arrays ────────────────────────────────────────────────────
  const { behavioralScores, technicalScores, overallScores } = useMemo(() => {
    const behavioral: number[] = [];
    const technical:  number[] = [];
    const overall:    number[] = [];
    for (const r of rubrics) {
      const res = (r.responses ?? {}) as Record<string, unknown>;
      const b = sumKeys(res, BEHAVIORAL_KEYS);
      const t = sumKeys(res, TECHNICAL_KEYS);
      if (b + t > 0) {
        behavioral.push(b);
        technical.push(t);
        overall.push(b + t);
      }
    }
    return { behavioralScores: behavioral, technicalScores: technical, overallScores: overall };
  }, [rubrics]);

  // ── Applicant stats ────────────────────────────────────────────────────────
  const data = useMemo(() => {
    const withGpa = applicants.filter((a) => a.gpa != null && a.gpa > 0);
    const avgGpa = withGpa.length
      ? withGpa.reduce((s, a) => s + (a.gpa ?? 0), 0) / withGpa.length
      : 0;
    const interviewCount = applicants.filter((a) => a.status === "interview").length;
    const acceptedCount  = applicants.filter((a) => a.status === "accepted").length;

    const gpaData = GPA_RANGES.map(({ label, min, max }) => ({
      range: label,
      count: withGpa.filter((a) => (a.gpa ?? 0) >= min && (a.gpa ?? 0) < max).length,
    }));

    const gradMap: Record<string, number> = {};
    for (const a of applicants) {
      const key = a.expected_graduation ?? "Unknown";
      gradMap[key] = (gradMap[key] ?? 0) + 1;
    }
    const gradData = Object.entries(gradMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));

    const vertMap: Record<string, number> = {};
    for (const a of applicants) {
      const key = a.vertical_interest ?? "Unknown";
      vertMap[key] = (vertMap[key] ?? 0) + 1;
    }
    const vertData = Object.entries(vertMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }));

    const decisionData = [
      { name: "Yes",       value: applicants.filter((a) => a.decision === "yes").length },
      { name: "No",        value: applicants.filter((a) => a.decision === "no").length },
      { name: "Maybe",     value: applicants.filter((a) => a.decision === "maybe").length },
      { name: "Class",     value: applicants.filter((a) => a.decision === "no_class").length },
      { name: "Undecided", value: applicants.filter((a) => a.decision === null).length },
    ].filter((d) => d.value > 0);

    return { avgGpa, interviewCount, acceptedCount, gpaData, gradData, vertData, decisionData };
  }, [applicants]);

  const total = applicants.length;
  const interviewRate = total ? ((data.interviewCount / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Applicants" value={total} />
        <StatCard label="Avg GPA" value={data.avgGpa.toFixed(2)} sub="applicants with GPA on file" />
        <StatCard label="In Interview" value={data.interviewCount} sub={`${interviewRate}% of total`} />
        <StatCard label="Accepted" value={data.acceptedCount} />
      </div>

      {/* ── Rubric score bar charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mounted ? (
          <>
            <ScoreBarChart
              title="Behavioral Score Distribution"
              scores={behavioralScores}
              maxScore={45}
              binWidth={5}
              color="#6366f1"
            />
            <ScoreBarChart
              title="Technical Score Distribution"
              scores={technicalScores}
              maxScore={45}
              binWidth={5}
              color="#0891b2"
            />
            <ScoreBarChart
              title="Overall Score Distribution"
              scores={overallScores}
              maxScore={90}
              binWidth={10}
              color="#10b981"
            />
          </>
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="h-4 w-40 bg-gray-100 rounded mb-4 animate-pulse" />
                <div className="h-[210px] bg-gray-50 rounded-lg animate-pulse" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Row 1: GPA distribution + Graduating class ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="GPA Distribution">
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.gpaData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="count" name="Applicants" radius={[4, 4, 0, 0]}>
                  {data.gpaData.map((_, i) => (
                    <Cell key={i} fill={GPA_BAR_COLOR} fillOpacity={0.6 + (i / data.gpaData.length) * 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] bg-gray-50 rounded-lg animate-pulse" />
          )}
        </ChartCard>

        <ChartCard title="Graduating Class Distribution">
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.gradData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.gradData.map((_, i) => (
                    <Cell key={i} fill={GRAD_COLORS[i % GRAD_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] bg-gray-50 rounded-lg animate-pulse" />
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Vertical interest + Decision breakdown ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Vertical Interest">
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={data.vertData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="value" name="Applicants" radius={[0, 4, 4, 0]}>
                  {data.vertData.map((entry, i) => (
                    <Cell key={i} fill={VERTICAL_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] bg-gray-50 rounded-lg animate-pulse" />
          )}
        </ChartCard>

        <ChartCard title="Interview Decision Breakdown">
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.decisionData}
                  dataKey="value"
                  nameKey="name"
                  cx="45%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {data.decisionData.map((entry, i) => (
                    <Cell key={i} fill={DECISION_COLORS[entry.name] ?? "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] bg-gray-50 rounded-lg animate-pulse" />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
