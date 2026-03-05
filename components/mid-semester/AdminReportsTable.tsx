"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import type { MidSemesterReport, Profile } from "@/lib/types/app.types";

interface ReportWithProfile extends MidSemesterReport {
  profiles: Profile;
}

interface Props {
  reports: ReportWithProfile[];
}

export function AdminReportsTable({ reports }: Props) {
  const [selected, setSelected] = useState<ReportWithProfile | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mid-Semester Reports</h2>
        <p className="text-gray-500 text-sm mt-1">
          {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Analyst</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No reports submitted yet
                </td>
              </tr>
            )}
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {r.profiles?.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.profiles?.email}</td>
                <td className="px-4 py-3 text-gray-500">
                  {r.submitted_at ? formatDate(r.submitted_at) : "Draft"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="secondary" size="sm" onClick={() => setSelected(r)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={`Report — ${selected.profiles?.full_name ?? "Analyst"}`}
          className="max-w-xl"
        >
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Submitted: {selected.submitted_at ? formatDate(selected.submitted_at) : "Not yet"}
            </div>
            <div className="space-y-3">
              {Object.entries(selected.form_data as Record<string, unknown>).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {typeof value === "boolean"
                      ? value ? "Yes" : "No"
                      : String(value ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
