"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatGpa, formatDate, statusLabel, statusColor } from "@/lib/utils/format";
import { moveToInterview } from "@/app/(protected)/recruitment/actions";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Applicant } from "@/lib/types/app.types";
import { toast } from "sonner";

interface Props {
  applicant: Applicant;
  resumeSignedUrl: string | null;
  onClose: () => void;
}

export function ApplicantDetailPanel({ applicant, resumeSignedUrl, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const { upload, uploading } = useFileUpload();

  function handleMoveToInterview() {
    startTransition(async () => {
      try {
        await moveToInterview(applicant.id);
        toast.success(`${applicant.name} moved to interviews`);
        onClose();
      } catch {
        toast.error("Failed to move applicant");
      }
    });
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(applicant.id, file);
    if (result.success) {
      toast.success("Resume uploaded");
    } else {
      toast.error("Upload failed");
    }
  }

  return (
    <Modal open onClose={onClose} title={applicant.name} className="max-w-3xl">
      <div className="space-y-6">
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">GPA</p>
            <p className="text-2xl font-bold text-gray-900">{formatGpa(applicant.gpa)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
            <Badge className={statusColor(applicant.status)}>
              {statusLabel(applicant.status)}
            </Badge>
          </div>
          {applicant.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-sm text-gray-700">{applicant.email}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Applied</p>
            <p className="text-sm text-gray-700">{formatDate(applicant.submitted_at)}</p>
          </div>
        </div>

        {/* Application message */}
        {applicant.application_message && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Application Message</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {applicant.application_message}
            </div>
          </div>
        )}

        {/* Resume */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Resume</h3>
          {resumeSignedUrl ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={resumeSignedUrl}
                className="w-full h-96"
                title={`${applicant.name}'s resume`}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">No resume uploaded yet</p>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                {uploading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    Uploading…
                  </>
                ) : (
                  "Upload PDF"
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  onChange={handleResumeUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Action */}
        {applicant.status === "pending" && (
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <Button onClick={handleMoveToInterview} disabled={isPending}>
              {isPending ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
              Move to Interview
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
