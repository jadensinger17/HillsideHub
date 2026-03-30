import { createClient } from "@/lib/supabase/server";
import { RecruitmentTabs } from "@/components/recruitment/RecruitmentTabs";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";
import { RUBRIC_TEMPLATE } from "@/lib/utils/rubricTemplate";

export default async function RecruitmentPage() {
  const supabase = await createClient();

  // AUTH DISABLED FOR TESTING — role check skipped

  // Fetch all applicants
  const { data: applicants } = await supabase
    .from("applicants")
    .select("*")
    .order("submitted_at", { ascending: false });

  // Fetch applicants in interview stage
  const interviewApplicants = (applicants ?? []).filter(
    (a) => a.status === "interview"
  );

  // Fetch rubrics for interview applicants
  const interviewIds = interviewApplicants.map((a) => a.id);
  let { data: rubrics } = interviewIds.length
    ? await supabase
        .from("interview_rubrics")
        .select("*")
        .in("applicant_id", interviewIds)
    : { data: [] };

  // Backfill: create or fix rubric records for interview applicants missing a proper template
  if (interviewIds.length) {
    const needsTemplate = interviewIds.filter((id) => {
      const rubric = (rubrics ?? []).find((r) => r.applicant_id === id);
      if (!rubric) return true;
      const t = rubric.template as { sections?: unknown[] } | null;
      return !t || !Array.isArray(t?.sections) || t.sections.length === 0;
    });
    if (needsTemplate.length) {
      await supabase.from("interview_rubrics").upsert(
        needsTemplate.map((applicant_id) => {
          const existing = (rubrics ?? []).find((r) => r.applicant_id === applicant_id);
          return {
            applicant_id,
            template: RUBRIC_TEMPLATE,
            responses: existing?.responses ?? {},
            is_complete: existing?.is_complete ?? false,
          };
        }),
        { onConflict: "applicant_id" }
      );
      const { data: refreshed } = await supabase
        .from("interview_rubrics")
        .select("*")
        .in("applicant_id", interviewIds);
      rubrics = refreshed;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {applicants?.length ?? 0} total applicants · {interviewApplicants.length} in interviews
        </p>
      </div>

      <RecruitmentTabs
        applicants={(applicants ?? []) as Applicant[]}
        interviewApplicants={interviewApplicants as Applicant[]}
        rubrics={(rubrics ?? []) as InterviewRubric[]}
      />
    </div>
  );
}
