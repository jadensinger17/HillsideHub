"use client";

import { useEffect, useState } from "react";
import type { AirtableRecord } from "@/lib/utils/airtable";

interface Props {
  company: AirtableRecord;
  onClose: () => void;
}

type Status = "running" | "success" | "error";

const STAGES = [
  { label: "Fetching from Airtable", match: "Fetching record" },
  { label: "Researching company",    match: "[2/3]" },
  { label: "Generating PDF",         match: "[3/3]" },
  { label: "Uploading to Airtable",  match: "[4/4]" },
];

// Progress % per active stage index (-1 = not started yet)
const STAGE_PROGRESS = [5, 25, 50, 75, 92];

function getCompanyName(fields: Record<string, unknown>): string {
  for (const key of ["Company", "Name", "Company Name", "name", "company"]) {
    if (fields[key] && typeof fields[key] === "string") return fields[key] as string;
  }
  return "Company";
}

export default function ReportModal({ company, onClose }: Props) {
  const [currentStage, setCurrentStage] = useState(-1);
  const [latestMessage, setLatestMessage] = useState("Starting…");
  const [status, setStatus] = useState<Status>("running");
  const companyName = getCompanyName(company.fields);

  useEffect(() => {
    const es = new EventSource(`/api/paperboy-generate/${company.id}`);

    es.onmessage = (e) => {
      const msg: string = e.data;

      if (msg === "DONE_SUCCESS") {
        setStatus("success");
        setCurrentStage(STAGES.length);
        es.close();
        return;
      }
      if (msg === "DONE_ERROR") {
        setStatus("error");
        es.close();
        return;
      }

      const stageIdx = STAGES.findIndex((s) => msg.includes(s.match));
      if (stageIdx >= 0) setCurrentStage(stageIdx);

      setLatestMessage(msg);
    };

    es.onerror = () => {
      setLatestMessage("Connection lost. Check that npm run dev is running.");
      setStatus("error");
      es.close();
    };

    return () => es.close();
  }, [company.id]);

  const progress =
    status === "success"
      ? 100
      : STAGE_PROGRESS[currentStage + 1] ?? STAGE_PROGRESS[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={status !== "running" ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
                  Generating One-Pager
                </p>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {companyName}
                </h2>
              </div>
              {status !== "running" && (
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-gray-500 transition-colors text-2xl leading-none mt-0.5 flex-shrink-0"
                  aria-label="Close"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-5">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  status === "error" ? "bg-red-400" : "bg-brand-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage list */}
          <div className="px-6 pb-5 space-y-3.5">
            {STAGES.map((stage, i) => {
              const isDone    = status === "success" || i < currentStage;
              const isActive  = i === currentStage && status === "running";
              const isError   = i === currentStage && status === "error";

              return (
                <div key={stage.label} className="flex items-center gap-3">
                  {/* Step icon */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                      isDone
                        ? "bg-green-500"
                        : isError
                        ? "bg-red-400"
                        : isActive
                        ? "bg-brand-500"
                        : "bg-gray-100"
                    }`}
                  >
                    {isDone ? (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : isError ? (
                      <span className="text-white text-xs font-bold leading-none">!</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={`text-sm transition-colors duration-200 ${
                      isDone
                        ? "text-gray-400"
                        : isActive
                        ? "text-gray-900 font-semibold"
                        : isError
                        ? "text-red-600 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4">
            {status === "running" && (
              <p className="text-xs text-gray-400 truncate">{latestMessage}</p>
            )}
            {status === "success" && (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-600">One-pager ready!</p>
                <button
                  onClick={onClose}
                  className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-red-500 truncate">{latestMessage}</p>
                <button
                  onClick={onClose}
                  className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  Close
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
