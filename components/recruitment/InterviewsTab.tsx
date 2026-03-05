"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RubricForm } from "@/components/recruitment/RubricForm";
import { formatGpa, formatDate } from "@/lib/utils/format";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
  rubrics: InterviewRubric[];
}

export function InterviewsTab({ applicants, rubrics }: Props) {
  const [selectedRubric, setSelectedRubric] = useState<{
    rubric: InterviewRubric;
    applicant: Applicant;
  } | null>(null);

  const rubricByApplicantId = new Map(rubrics.map((r) => [r.applicant_id, r]));

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">GPA</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rubric</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applicants.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No applicants in interviews yet
                </td>
              </tr>
            )}
            {applicants.map((a) => {
              const rubric = rubricByApplicantId.get(a.id);
              return (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-gray-700">{formatGpa(a.gpa)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(a.submitted_at)}</td>
                  <td className="px-4 py-3">
                    {rubric?.is_complete ? (
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Not filled</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {rubric && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedRubric({ rubric, applicant: a })}
                      >
                        {rubric.is_complete ? "View Rubric" : "Fill Rubric"}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRubric && (
        <Modal
          open
          onClose={() => setSelectedRubric(null)}
          className="max-w-2xl"
        >
          <RubricForm
            rubric={selectedRubric.rubric}
            applicantName={selectedRubric.applicant.name}
            onClose={() => setSelectedRubric(null)}
          />
        </Modal>
      )}
    </div>
  );
}
