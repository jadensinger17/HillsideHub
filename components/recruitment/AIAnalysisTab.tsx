"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatGpa, formatDate, statusLabel, statusColor } from "@/lib/utils/format";
import { acceptApplicant, rejectApplicant } from "@/app/(protected)/recruitment/actions";
import type { Applicant, ApplicantStatus } from "@/lib/types/app.types";
import { toast } from "sonner";

interface Props {
  applicants: Applicant[];
}

const STATUS_OPTIONS: { value: ApplicantStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function AIAnalysisTab({ applicants }: Props) {
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "all">("all");
  const [minGpa, setMinGpa] = useState("");
  const [maxGpa, setMaxGpa] = useState("");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = applicants.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (minGpa && a.gpa < parseFloat(minGpa)) return false;
    if (maxGpa && a.gpa > parseFloat(maxGpa)) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleAccept(id: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await acceptApplicant(id);
        toast.success("Applicant accepted");
      } catch {
        toast.error("Failed to accept applicant");
      } finally {
        setPendingId(null);
      }
    });
  }

  function handleReject(id: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await rejectApplicant(id);
        toast.success("Applicant rejected");
      } catch {
        toast.error("Failed to reject applicant");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 bg-gray-50 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | "all")}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">GPA:</span>
          <input
            type="number"
            placeholder="Min"
            value={minGpa}
            onChange={(e) => setMinGpa(e.target.value)}
            min={0}
            max={4}
            step={0.1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-20"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxGpa}
            onChange={(e) => setMaxGpa(e.target.value)}
            min={0}
            max={4}
            step={0.1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-20"
          />
        </div>

        <span className="ml-auto text-sm text-gray-500 self-center">
          {filtered.length} of {applicants.length} applicants
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">GPA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No applicants match the filters
                </td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.email ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-gray-700">{formatGpa(a.gpa)}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColor(a.status)}>{statusLabel(a.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(a.submitted_at)}</td>
                <td className="px-4 py-3 text-right">
                  {a.status === "accepted" || a.status === "rejected" ? (
                    <span className="text-xs text-gray-400 italic">
                      {a.status === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(a.id)}
                        disabled={pendingId === a.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {pendingId === a.id ? (
                          <LoadingSpinner className="h-3 w-3" />
                        ) : (
                          "Accept"
                        )}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(a.id)}
                        disabled={pendingId === a.id}
                      >
                        {pendingId === a.id ? (
                          <LoadingSpinner className="h-3 w-3" />
                        ) : (
                          "Reject"
                        )}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
