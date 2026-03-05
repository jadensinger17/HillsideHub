"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { saveRubricResponses } from "@/app/(protected)/recruitment/actions";
import type { InterviewRubric, RubricField } from "@/lib/types/app.types";
import { toast } from "sonner";

interface Props {
  rubric: InterviewRubric;
  applicantName: string;
  onClose: () => void;
}

export function RubricForm({ rubric, applicantName, onClose }: Props) {
  const [responses, setResponses] = useState<Record<string, unknown>>(
    rubric.responses as Record<string, unknown>
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(key: string, value: unknown) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave(complete: boolean) {
    startTransition(async () => {
      try {
        await saveRubricResponses(rubric.id, responses, complete);
        toast.success(complete ? "Rubric completed" : "Draft saved");
        if (complete) onClose();
      } catch {
        toast.error("Failed to save rubric");
      }
    });
  }

  const hasTemplate =
    rubric.template &&
    typeof rubric.template === "object" &&
    "sections" in rubric.template &&
    Array.isArray((rubric.template as { sections: unknown[] }).sections) &&
    (rubric.template as { sections: unknown[] }).sections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Interview Rubric — {applicantName}</h3>
        {rubric.is_complete && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Completed
          </span>
        )}
      </div>

      {!hasTemplate ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Rubric template not yet configured. Update the <code>template</code> field in
          the <code>interview_rubrics</code> table to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {(rubric.template as { sections: { title: string; fields: RubricField[] }[] }).sections.map(
            (section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {section.title}
                </h4>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <RubricFieldInput
                      key={field.key}
                      field={field}
                      value={responses[field.key]}
                      onChange={(v) => handleChange(field.key, v)}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={() => handleSave(false)} disabled={isPending}>
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={isPending}>
          {isPending ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
          Mark Complete
        </Button>
      </div>
    </div>
  );
}

function RubricFieldInput({
  field,
  value,
  onChange,
}: {
  field: RubricField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{field.label}</label>

      {field.type === "rating" && (
        <div className="flex gap-2">
          {Array.from({ length: field.max ?? 5 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                value === n
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "border-gray-300 text-gray-600 hover:border-brand-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {field.type === "text" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      )}

      {field.type === "boolean" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-brand-500"
          />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      )}
    </div>
  );
}
