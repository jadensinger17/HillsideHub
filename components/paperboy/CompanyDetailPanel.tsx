"use client";

import { useState } from "react";
import type { AirtableRecord } from "@/lib/utils/airtable";
import ReportModal from "@/components/paperboy/ReportModal";

interface Props {
  company: AirtableRecord;
  columns: string[];
  onClose: () => void;
}

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Best-guess company name: look for a field named "Name", "Company", etc.
function getCompanyName(fields: Record<string, unknown>): string {
  for (const key of ["Name", "Company", "Company Name", "name", "company"]) {
    if (fields[key] && typeof fields[key] === "string") return fields[key] as string;
  }
  return "Company";
}

export default function CompanyDetailPanel({ company, columns, onClose }: Props) {
  const [showReport, setShowReport] = useState(false);
  const companyName = getCompanyName(company.fields);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl flex flex-col">
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{companyName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paperboy Ventures portfolio company</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReport(true)}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Generate Report
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Field list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <dl className="divide-y divide-gray-100">
            {columns.map((col) => {
              const val = cellValue(company.fields[col]);
              if (val === "—") return null;
              return (
                <div key={col} className="py-3">
                  <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    {col}
                  </dt>
                  <dd className="text-sm text-gray-800 break-words">{val}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <ReportModal
          company={company}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
