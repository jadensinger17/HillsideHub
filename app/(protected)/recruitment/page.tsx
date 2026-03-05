import { createClient } from "@/lib/supabase/server";
import { RecruitmentTabs } from "@/components/recruitment/RecruitmentTabs";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

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
  const { data: rubrics } = interviewIds.length
    ? await supabase
        .from("interview_rubrics")
        .select("*")
        .in("applicant_id", interviewIds)
    : { data: [] };

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
