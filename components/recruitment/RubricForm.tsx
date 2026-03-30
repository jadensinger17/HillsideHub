"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { saveRubricResponses } from "@/app/(protected)/(hub)/recruitment/actions";
import { RUBRIC_TEMPLATE } from "@/lib/utils/rubricTemplate";
import type { InterviewRubric, RubricField, RubricInterviewers } from "@/lib/types/app.types";
import { toast } from "sonner";

interface Props {
  rubric: InterviewRubric;
  applicantName: string;
  onClose: () => void;
}

type SaveStatus = "idle" | "saving" | "saved";

export function RubricForm({ rubric, applicantName, onClose }: Props) {
  const [responses, setResponses] = useState<Record<string, unknown>>(
    rubric.responses as Record<string, unknown>
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    (rubric.notes as Record<string, string>) ?? {}
  );
  const [interviewers, setInterviewers] = useState<RubricInterviewers>(
    rubric.interviewers ?? { behavioral: ["", ""], technical: ["", ""] }
  );
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Auto-save responses + notes + interviewers together on any change, debounced 600ms
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("saving");
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await saveRubricResponses(rubric.id, responses, notes, interviewers, rubric.is_complete);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
          toast.error("Auto-save failed");
        }
      });
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [responses, notes, interviewers]);

  function handleRatingChange(key: string, value: unknown) {
    setResponses((prev) => ({ ...prev, [key]: value }));
  }

  function handleNoteChange(key: string, value: string) {
    setNotes((prev) => ({ ...prev, [key]: value }));
  }

  function handleInterviewerChange(section: keyof RubricInterviewers, idx: 0 | 1, value: string) {
    setInterviewers((prev) => {
      const updated = [...prev[section]] as [string, string];
      updated[idx] = value;
      return { ...prev, [section]: updated };
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveRubricResponses(rubric.id, responses, notes, interviewers, rubric.is_complete);
        setSaveStatus("saved");
        toast.success("Saved");
      } catch {
        toast.error("Save failed");
      }
    });
  }

  function handleComplete() {
    startTransition(async () => {
      try {
        await saveRubricResponses(rubric.id, responses, notes, interviewers, true);
        toast.success("Rubric completed");
        onClose();
      } catch {
        toast.error("Failed to complete rubric");
      }
    });
  }

  // Always render from the canonical template
  const template = RUBRIC_TEMPLATE;

  // Score calculations — sched is boolean so excluded; all other behavioral fields are rated 1–5
  const behavioralKeys = [
    "g1","g2",
    "d1","d2","d3","d4",
    "tw1","tw2","tw3","tw4","tw5",
    "c1","c2","c3","c4",
    "i1","i2","i3","i4","i5","i6","i7","i8",
    "bal1","bal2","bal3","bal4","bal5",
    "div1","div2","div3","div4","div5",
    "f1","f2","f3","f4","f5","f6","f7",
  ];
  const technicalKeys  = ["t1a","t1b","t2","t3","t4","t5","qs1","qs2","qs3","qs3b","qs4","qs5","qs6","qs7","qs8","qs9"];
  const BEHAVIORAL_MAX = behavioralKeys.length * 5;
  const TECHNICAL_MAX  = technicalKeys.length * 5;
  function sumKeys(keys: string[]) {
    return keys.reduce((acc, k) => acc + (typeof responses[k] === "number" ? (responses[k] as number) : 0), 0);
  }

  const behavioralScore = sumKeys(behavioralKeys);
  const technicalScore  = sumKeys(technicalKeys);
  const pct = (n: number, max: number) => max === 0 ? "—" : `${((n / max) * 100).toFixed(1)}%`;

  // 50/50 weighted overall: each section normalized to 50 points regardless of raw max
  const behavioralWeighted = BEHAVIORAL_MAX > 0 ? (behavioralScore / BEHAVIORAL_MAX) * 50 : 0;
  const technicalWeighted  = TECHNICAL_MAX  > 0 ? (technicalScore  / TECHNICAL_MAX)  * 50 : 0;
  const weightedTotal      = behavioralWeighted + technicalWeighted;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Interview Rubric — {applicantName}</h3>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <LoadingSpinner className="h-3 w-3" /> Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600">Saved</span>
          )}
          {rubric.is_complete && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Completed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {(() => {
          const shownInterviewerTypes = new Set<keyof RubricInterviewers>();
          return template.sections.map((section) => {
          const isBehavioral = section.title.toLowerCase().includes("behavioral");
          const isConceptual = section.title.toLowerCase().includes("conceptual");
          const interviewerType: keyof RubricInterviewers | null =
            isBehavioral ? "behavioral" : isConceptual ? "technical" : null;
          const showInterviewerFields = !!interviewerType && !shownInterviewerTypes.has(interviewerType);
          if (showInterviewerFields && interviewerType) shownInterviewerTypes.add(interviewerType);
          const interviewerSection = showInterviewerFields ? interviewerType : null;

          return (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                {section.title}
              </h4>

              {/* Interviewer name fields — shown once per interview section */}
              {interviewerSection && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Interviewers</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([0, 1] as const).map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={interviewers[interviewerSection][idx]}
                        onChange={(e) => handleInterviewerChange(interviewerSection, idx, e.target.value)}
                        placeholder={`Interviewer ${idx + 1}`}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {section.fields.map((field) => (
                  <RubricFieldInput
                    key={field.key}
                    field={field}
                    value={responses[field.key]}
                    note={notes[field.key] ?? ""}
                    onRatingChange={(v) => handleRatingChange(field.key, v)}
                    onNoteChange={(v) => handleNoteChange(field.key, v)}
                  />
                ))}
              </div>
            </div>
          );
        });
        })()}
      </div>

      {/* Score summary — behavioral and technical each weighted 50% */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Behavioral</p>
          <p className="text-lg font-semibold text-gray-900">{behavioralScore}<span className="text-gray-400 font-normal text-sm">/{BEHAVIORAL_MAX}</span></p>
          <p className="text-xs text-brand-600 font-medium">{pct(behavioralScore, BEHAVIORAL_MAX)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Weight: {behavioralWeighted.toFixed(1)}/50</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Technical</p>
          <p className="text-lg font-semibold text-gray-900">{technicalScore}<span className="text-gray-400 font-normal text-sm">/{TECHNICAL_MAX}</span></p>
          <p className="text-xs text-brand-600 font-medium">{pct(technicalScore, TECHNICAL_MAX)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Weight: {technicalWeighted.toFixed(1)}/50</p>
        </div>
        <div className="border-l border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall Score</p>
          <p className="text-lg font-semibold text-gray-900">{weightedTotal.toFixed(1)}<span className="text-gray-400 font-normal text-sm">/100</span></p>
          <p className="text-xs text-brand-600 font-medium">{weightedTotal.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-0.5">50/50 weighted</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Close
        </Button>
        <Button variant="secondary" onClick={handleSave} disabled={isPending}>
          {isPending ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
          Save
        </Button>
        <Button onClick={handleComplete} disabled={isPending || rubric.is_complete}>
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
  note,
  onRatingChange,
  onNoteChange,
}: {
  field: RubricField;
  value: unknown;
  note: string;
  onRatingChange: (v: unknown) => void;
  onNoteChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
      {field.hint && (
        <p className="text-xs text-gray-400">{field.hint}</p>
      )}

      {field.type === "rating" && (
        <div className="flex gap-2">
          {Array.from({ length: field.max ?? 5 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRatingChange(n)}
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
          onChange={(e) => onRatingChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      )}

      {field.type === "boolean" && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) ?? false}
            onChange={(e) => onRatingChange(e.target.checked)}
            className="rounded border-gray-300 text-brand-500"
          />
          <span className="text-sm text-gray-600">Yes</span>
        </label>
      )}

      {/* Per-question notes text box */}
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add notes…"
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none bg-gray-50"
      />
    </div>
  );
}
