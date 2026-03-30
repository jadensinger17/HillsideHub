"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AddApplicantModal } from "@/components/recruitment/AddApplicantModal";
import { RubricForm } from "@/components/recruitment/RubricForm";
import { Modal } from "@/components/ui/Modal";
import { formatGpa } from "@/lib/utils/format";
import { downloadExcel } from "@/lib/utils/export";
import { acceptApplicant, rejectApplicant } from "@/app/(protected)/(hub)/recruitment/actions";
import { toast } from "sonner";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
  rubrics: InterviewRubric[];
}

type SortKey = "name" | "gpa" | "major" | "expected_graduation" | "vertical_interest";

const BEHAVIORAL_KEYS = ["b1","b2","b3","b4","b5","b6","b7","b8","b9"];
const TECHNICAL_KEYS  = ["t1a","t1b","t2","t3","t4","t5","qs1","qs2","qs3"];

function rubricScore(responses: Record<string, unknown>, keys: string[]) {
  return keys.reduce((acc, k) => acc + (typeof responses[k] === "number" ? (responses[k] as number) : 0), 0);
}

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

export function InterviewsTab({ applicants, rubrics }: Props) {
  const [editApplicant, setEditApplicant] = useState<Applicant | null>(null);
  const [rubricApplicant, setRubricApplicant] = useState<Applicant | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleExport() {
    const headers = ["Name", "Email", "GPA", "Major", "Expected Graduation", "Vertical", "LinkedIn", "Rubric Complete"];
    const rows = sorted.map((a) => {
      const rubric = rubrics.find((r) => r.applicant_id === a.id);
      return [
        a.name,
        a.email ?? "",
        a.gpa != null && a.gpa > 0 ? formatGpa(a.gpa) : "",
        a.major ?? "",
        a.expected_graduation ?? "",
        a.vertical_interest ?? "",
        a.linkedin_url ?? "",
        rubric?.is_complete ? "Yes" : "No",
      ];
    });
    downloadExcel(headers, rows, "interviews.xlsx");
  }

  function handleRowClick(applicant: Applicant) {
    setEditApplicant(applicant);
  }

  const filtered = applicants.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") cmp = a.name.localeCompare(b.name);
        else if (sortKey === "gpa") cmp = (a.gpa ?? 0) - (b.gpa ?? 0);
        else if (sortKey === "major") cmp = (a.major ?? "").localeCompare(b.major ?? "");
        else if (sortKey === "expected_graduation") cmp = (a.expected_graduation ?? "").localeCompare(b.expected_graduation ?? "");
        else if (sortKey === "vertical_interest") cmp = (a.vertical_interest ?? "").localeCompare(b.vertical_interest ?? "");
        return sortDir === "asc" ? cmp : -cmp;
      })
    : filtered;

  const activeRubric = rubricApplicant
    ? rubrics.find((r) => r.applicant_id === rubricApplicant.id) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Search bar */}
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

        {search && (
          <button
            onClick={() => setSearch("")}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500 self-center">
          {filtered.length} of {applicants.length} interviewees
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
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button onClick={() => handleSort("name")} className="flex items-center hover:text-gray-900 transition-colors">
                  Name <SortIcon col="name" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button onClick={() => handleSort("gpa")} className="flex items-center hover:text-gray-900 transition-colors">
                  GPA <SortIcon col="gpa" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button onClick={() => handleSort("major")} className="flex items-center hover:text-gray-900 transition-colors">
                  Major <SortIcon col="major" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button onClick={() => handleSort("expected_graduation")} className="flex items-center hover:text-gray-900 transition-colors">
                  Graduation <SortIcon col="expected_graduation" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                <button onClick={() => handleSort("vertical_interest")} className="flex items-center hover:text-gray-900 transition-colors">
                  Vertical <SortIcon col="vertical_interest" current={sortKey} dir={sortDir} />
                </button>
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Behavioral</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Technical</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Overall</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">LinkedIn</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rubric</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-12 text-gray-400">
                  {applicants.length === 0 ? "No applicants in interviews yet" : "No applicants match the search"}
                </td>
              </tr>
            )}
            {sorted.map((a) => {
              const rubric = rubrics.find((r) => r.applicant_id === a.id);
              const responses = (rubric?.responses ?? {}) as Record<string, unknown>;
              const bScore = rubricScore(responses, BEHAVIORAL_KEYS);
              const tScore = rubricScore(responses, TECHNICAL_KEYS);
              const total  = bScore + tScore;
              const hasScores = total > 0;

              return (
                <tr
                  key={a.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(a)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{a.gpa != null ? formatGpa(a.gpa) : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.major ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.expected_graduation ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.vertical_interest ?? "—"}</td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {hasScores ? (
                      <span className="text-xs font-medium text-gray-800">
                        {bScore}<span className="text-gray-400">/45</span>
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {hasScores ? (
                      <span className="text-xs font-medium text-gray-800">
                        {tScore}<span className="text-gray-400">/45</span>
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {hasScores ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        total >= 72 ? "bg-green-50 text-green-700" :
                        total >= 54 ? "bg-yellow-50 text-yellow-700" :
                        "bg-red-50 text-red-700"
                      }`}>
                        {total}/90
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {rubric ? (
                      <button
                        onClick={() => setRubricApplicant(a)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
                          rubric.is_complete
                            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            : "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
                        }`}
                      >
                        {rubric.is_complete ? "Completed" : "Fill Rubric"}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionButtons applicant={a} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddApplicantModal
        open={!!editApplicant}
        onClose={() => setEditApplicant(null)}
        applicant={editApplicant}
      />

      <Modal
        open={!!rubricApplicant && !!activeRubric}
        onClose={() => setRubricApplicant(null)}
        className="max-w-2xl"
      >
        {rubricApplicant && activeRubric && (
          <RubricForm
            rubric={activeRubric}
            applicantName={rubricApplicant.name}
            onClose={() => setRubricApplicant(null)}
          />
        )}
      </Modal>
    </div>
  );
}
