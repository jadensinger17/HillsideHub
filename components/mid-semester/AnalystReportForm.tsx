"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { submitMidSemesterReport } from "@/app/(protected)/mid-semester/actions";
import type { MidSemesterReport } from "@/lib/types/app.types";
import { toast } from "sonner";

// Form fields — update this array when the actual fields are provided
const FORM_FIELDS: {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox";
  placeholder?: string;
}[] = [
  {
    key: "projects_worked_on",
    label: "Projects worked on this semester",
    type: "textarea",
    placeholder: "Describe the projects and deals you contributed to…",
  },
  {
    key: "hours_per_week",
    label: "Average hours per week",
    type: "number",
    placeholder: "e.g. 10",
  },
  {
    key: "goals_met",
    label: "Did you meet your goals for this semester?",
    type: "checkbox",
  },
  {
    key: "feedback",
    label: "Feedback / comments for leadership",
    type: "textarea",
    placeholder: "Any suggestions, concerns, or feedback…",
  },
];

interface Props {
  existingReport: MidSemesterReport | null;
}

export function AnalystReportForm({ existingReport }: Props) {
  const existing = (existingReport?.form_data ?? {}) as Record<string, unknown>;
  const [values, setValues] = useState<Record<string, unknown>>(existing);
  const [isPending, startTransition] = useTransition();
  const alreadySubmitted = !!existingReport?.submitted_at;

  function handleChange(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await submitMidSemesterReport(values);
        toast.success("Report submitted successfully");
      } catch {
        toast.error("Failed to submit report");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mid-Semester Report</h2>
        {alreadySubmitted && (
          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
            <span>✓</span> Submitted — you can resubmit to update your response.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
        {FORM_FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={field.key}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
            </label>

            {field.type === "textarea" && (
              <textarea
                id={field.key}
                value={(values[field.key] as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={4}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            )}

            {field.type === "text" && (
              <input
                id={field.key}
                type="text"
                value={(values[field.key] as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}

            {field.type === "number" && (
              <input
                id={field.key}
                type="number"
                value={(values[field.key] as string) ?? ""}
                onChange={(e) => handleChange(field.key, e.target.valueAsNumber)}
                placeholder={field.placeholder}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}

            {field.type === "checkbox" && (
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  id={field.key}
                  type="checkbox"
                  checked={(values[field.key] as boolean) ?? false}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="rounded border-gray-300 text-brand-500 w-4 h-4"
                />
                <span className="text-sm text-gray-600">Yes</span>
              </label>
            )}
          </div>
        ))}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button type="submit" disabled={isPending}>
            {isPending && <LoadingSpinner className="h-4 w-4 mr-2" />}
            {alreadySubmitted ? "Resubmit" : "Submit Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
