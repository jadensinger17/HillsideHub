"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie, Legend,
} from "recharts";
import { ApplicantDetailPanel } from "@/components/recruitment/ApplicantDetailPanel";
import { acceptApplicant, rejectApplicant } from "@/app/(protected)/recruitment/actions";
import { toast } from "sonner";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
  interviewApplicants: Applicant[];
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

// ─── Accept / Reject buttons ──────────────────────────────────────────────────
function ActionButtons({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        await acceptApplicant(applicant.id);
        toast.success(`${applicant.name} accepted`);
        router.refresh();
      } catch {
        toast.error("Failed to accept applicant");
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      try {
        await rejectApplicant(applicant.id);
        toast.success(`${applicant.name} rejected`);
        router.refresh();
      } catch {
        toast.error("Failed to reject applicant");
      }
    });
  }

  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="text-xs px-3 py-1 rounded-md bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 font-medium"
      >
        Accept
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="text-xs px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
      >
        Reject
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function AIAnalysisTab({ applicants, interviewApplicants, rubrics }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selected, setSelected] = useState<Applicant | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  async function handleViewRubric(applicant: Applicant) {
    setSelected(applicant);
    if (applicant.resume_path) {
      try {
        const res = await fetch(`/api/resume-url?path=${encodeURIComponent(applicant.resume_path)}`);
        const data = await res.json();
        setResumeUrl(data.url ?? null);
      } catch {
        setResumeUrl(null);
      }
    } else {
      setResumeUrl(null);
    }
  }

  const rubricMap = useMemo(() => {
    const map: Record<string, InterviewRubric> = {};
    for (const r of rubrics) map[r.applicant_id] = r;
    return map;
  }, [rubrics]);

  const data = useMemo(() => {
    const withGpa = applicants.filter((a) => a.gpa != null && a.gpa > 0);

    const avgGpa = withGpa.length
      ? withGpa.reduce((s, a) => s + (a.gpa ?? 0), 0) / withGpa.length
      : 0;
    const interviewCount = applicants.filter((a) => a.status === "interview").length;
    const acceptedCount  = applicants.filter((a) => a.status === "accepted").length;
    const rejectedCount  = applicants.filter((a) => a.status === "rejected").length;
    const withResume     = applicants.filter((a) => a.resume_path).length;

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

    return {
      avgGpa, interviewCount, acceptedCount, rejectedCount, withResume,
      gpaData, gradData, vertData, decisionData,
    };
  }, [applicants]);

  const total = applicants.length;
  const interviewRate = total ? ((data.interviewCount / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Applicants" value={total} />
        <StatCard label="Avg GPA" value={data.avgGpa.toFixed(2)} sub="among applicants with GPA on file" />
        <StatCard label="In Interview" value={data.interviewCount} sub={`${interviewRate}% of total`} />
        <StatCard label="Accepted" value={data.acceptedCount} />
        <StatCard label="Resumes Filed" value={data.withResume} sub={`${total ? ((data.withResume / total) * 100).toFixed(0) : 0}% of total`} />
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

      {/* ── Interview candidates table ─────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Interview Candidates
            <span className="ml-2 text-xs font-normal text-gray-400">
              {interviewApplicants.length} {interviewApplicants.length === 1 ? "candidate" : "candidates"}
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">GPA</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Major</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Graduation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vertical</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rubric</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {interviewApplicants.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No candidates in interviews yet
                  </td>
                </tr>
              )}
              {interviewApplicants.map((a) => {
                const rubric = rubricMap[a.id];
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums">
                      {a.gpa != null ? a.gpa.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.major ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.expected_graduation ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{a.vertical_interest ?? "—"}</td>
                    <td className="px-4 py-3">
                      {rubric ? (
                        <button
                          onClick={() => handleViewRubric(a)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                        >
                          {rubric.is_complete ? "View Rubric ✓" : "View Rubric"}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionButtons applicant={a} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ApplicantDetailPanel
          applicant={selected}
          resumeSignedUrl={resumeUrl}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
