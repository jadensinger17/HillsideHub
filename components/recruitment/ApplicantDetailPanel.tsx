"use client";

import { useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDate, statusLabel, statusColor } from "@/lib/utils/format";
import { moveToInterview } from "@/app/(protected)/recruitment/actions";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { Applicant } from "@/lib/types/app.types";
import { toast } from "sonner";

interface Props {
  applicant: Applicant;
  resumeSignedUrl: string | null;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function LongTextSection({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    </div>
  );
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
        {/* Quick-glance header */}
        <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
          <InfoRow label="GPA" value={applicant.gpa != null ? applicant.gpa.toFixed(2) : null} />
          <InfoRow label="Major" value={applicant.major} />
          <InfoRow label="Expected Graduation" value={applicant.expected_graduation} />
          <InfoRow label="Vertical of Interest" value={applicant.vertical_interest} />
          {applicant.email && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
              <a href={`mailto:${applicant.email}`} className="text-sm text-blue-600 hover:underline">
                {applicant.email}
              </a>
            </div>
          )}
          {applicant.linkedin_url && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">LinkedIn</p>
              <a
                href={applicant.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Profile
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Status</p>
            <Badge className={statusColor(applicant.status)}>{statusLabel(applicant.status)}</Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Applied</p>
            <p className="text-sm text-gray-700">{formatDate(applicant.submitted_at)}</p>
          </div>
        </div>

        {/* Long-form responses */}
        <LongTextSection title="Why Hillside Ventures?" text={applicant.why_hillside} />
        <LongTextSection title="How can you contribute to the Genesis Fund?" text={applicant.contribution} />
        {/* Fallback for older records that used application_message */}
        {!applicant.why_hillside && !applicant.contribution && (
          <LongTextSection title="Application Message" text={applicant.application_message} />
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
