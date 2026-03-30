"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AddApplicantModal } from "@/components/recruitment/AddApplicantModal";
import { updateDecision } from "@/app/(protected)/(hub)/recruitment/actions";
import { downloadExcel } from "@/lib/utils/export";
import type { Applicant, ApplicantDecision } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
}

const DECISION_OPTIONS: { value: ApplicantDecision; label: string; color: string }[] = [
  { value: "yes",      label: "Yes",   color: "text-green-700 bg-green-50 border-green-200" },
  { value: "no",       label: "No",    color: "text-red-700 bg-red-50 border-red-200" },
  { value: "maybe",    label: "Maybe", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { value: "no_class", label: "Class", color: "text-gray-600 bg-gray-50 border-gray-200" },
];

function decisionColor(decision: ApplicantDecision | null): string {
  return DECISION_OPTIONS.find((o) => o.value === decision)?.color ??
    "text-gray-400 bg-white border-gray-200";
}

function DecisionDropdown({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<ApplicantDecision | null>(applicant.decision);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    const value = e.target.value as ApplicantDecision;
    setOptimistic(value);
    startTransition(async () => {
      await updateDecision(applicant.id, value);
      router.refresh();
    });
  }

  return (
    <select
      value={optimistic ?? ""}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      disabled={isPending}
      className={`text-xs font-medium px-2 py-1 rounded-md border appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50
        ${decisionColor(optimistic)}`}
    >
      <option value="" disabled>—</option>
      {DECISION_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const DECISION_FILTER_OPTIONS = [
  { value: "all",       label: "All decisions" },
  { value: "yes",       label: "Yes" },
  { value: "no",        label: "No" },
  { value: "maybe",     label: "Maybe" },
  { value: "no_class",  label: "Class" },
  { value: "undecided", label: "Undecided" },
];

type SortKey = "name" | "gpa" | "major" | "expected_graduation";

function SortIcon({ col, current, dir }: { col: SortKey; current: SortKey | null; dir: "asc" | "desc" }) {
  if (current !== col) {
    return (
      <svg className="w-3.5 h-3.5 text-gray-300 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return dir === "asc" ? (
    <svg className="w-3.5 h-3.5 text-gray-700 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-gray-700 ml-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function ApplicantsTab({ applicants }: Props) {
  const [editApplicant, setEditApplicant] = useState<Applicant | null>(null);
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [addOpen, setAddOpen] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = applicants.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (decisionFilter === "undecided" && a.decision !== null) return false;
    if (decisionFilter !== "all" && decisionFilter !== "undecided" && a.decision !== decisionFilter) return false;
    return true;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") cmp = a.name.localeCompare(b.name);
        else if (sortKey === "gpa") cmp = (a.gpa ?? 0) - (b.gpa ?? 0);
        else if (sortKey === "major") cmp = (a.major ?? "").localeCompare(b.major ?? "");
        else if (sortKey === "expected_graduation") cmp = (a.expected_graduation ?? "").localeCompare(b.expected_graduation ?? "");
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  function handleExport() {
    const headers = ["Name", "Email", "GPA", "Major", "Expected Graduation", "Vertical", "LinkedIn", "Decision", "Status"];
    const rows = sorted.map((a) => [
      a.name,
      a.email ?? "",
      a.gpa != null && a.gpa > 0 ? a.gpa.toFixed(2) : "",
      a.major ?? "",
      a.expected_graduation ?? "",
      a.vertical_interest ?? "",
      a.linkedin_url ?? "",
      a.decision ?? "",
      a.status,
    ]);
    downloadExcel(headers, rows, "applicants.xlsx");
  }

  function handleRowClick(applicant: Applicant) {
    setEditApplicant(applicant);
  }

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 bg-gray-50 rounded-xl p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-52"
          />
        </div>

        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {DECISION_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {(search || decisionFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setDecisionFilter("all"); }}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500 self-center">
          {filtered.length} of {applicants.length} applicants
        </span>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>

        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Applicant
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  Full Name <SortIcon col="name" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button
                  onClick={() => handleSort("gpa")}
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  GPA <SortIcon col="gpa" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button
                  onClick={() => handleSort("major")}
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  Major <SortIcon col="major" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button
                  onClick={() => handleSort("expected_graduation")}
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  Expected Graduation <SortIcon col="expected_graduation" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">LinkedIn</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Interview?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {applicants.length === 0 ? "No applicants yet" : "No applicants match the filters"}
                </td>
              </tr>
            )}
            {sorted.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(a)}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">
                  {a.gpa != null ? a.gpa.toFixed(2) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{a.major ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.expected_graduation ?? "—"}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {a.linkedin_url ? (
                    <a
                      href={a.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <DecisionDropdown applicant={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddApplicantModal
        open={addOpen || !!editApplicant}
        onClose={() => { setAddOpen(false); setEditApplicant(null); }}
        applicant={editApplicant}
      />
    </div>
  );
}
