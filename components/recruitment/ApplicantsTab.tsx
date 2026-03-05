"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApplicantDetailPanel } from "@/components/recruitment/ApplicantDetailPanel";
import { updateDecision } from "@/app/(protected)/recruitment/actions";
import type { Applicant, ApplicantDecision } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
}

const DECISION_OPTIONS: { value: ApplicantDecision; label: string; color: string }[] = [
  { value: "yes",      label: "Yes",      color: "text-green-700 bg-green-50 border-green-200" },
  { value: "no",       label: "No",       color: "text-red-700 bg-red-50 border-red-200" },
  { value: "maybe",    label: "Maybe",    color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { value: "no_class", label: "No/Class", color: "text-gray-600 bg-gray-50 border-gray-200" },
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
      <option value="" disabled>Undecided</option>
      {DECISION_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function ApplicantsTab({ applicants }: Props) {
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  async function handleRowClick(applicant: Applicant) {
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

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Info Sessions</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applicants.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-12 text-gray-400">
                  No applicants yet
                </td>
              </tr>
            )}
            {applicants.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(a)}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-600 tabular-nums">{a.info_sessions}</td>
                <td className="px-4 py-3">
                  <DecisionDropdown applicant={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
