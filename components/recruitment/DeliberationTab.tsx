"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApplicantDetailPanel } from "@/components/recruitment/ApplicantDetailPanel";
import { acceptApplicant, rejectApplicant } from "@/app/(protected)/(hub)/recruitment/actions";
import { formatGpa } from "@/lib/utils/format";
import type { Applicant } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
}

function ActionButtons({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAccept(e: React.MouseEvent) {
    e.stopPropagation();
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

  function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
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
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="text-xs font-medium px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        Reject
      </button>
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="text-xs font-medium px-2.5 py-1 rounded-md border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
      >
        Accept
      </button>
    </div>
  );
}

export function DeliberationTab({ applicants }: Props) {
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = applicants.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="space-y-4">
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
          {filtered.length} of {applicants.length} candidates
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">GPA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Major</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Graduation</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vertical</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  {applicants.length === 0
                    ? "No candidates in deliberation yet"
                    : "No candidates match the search"}
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(a)}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 font-mono text-gray-700">
                  {a.gpa != null ? formatGpa(a.gpa) : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{a.major ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.expected_graduation ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{a.vertical_interest ?? "—"}</td>
                <td className="px-4 py-3">
                  <ActionButtons applicant={a} />
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
