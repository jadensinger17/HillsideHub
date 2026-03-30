"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RUBRIC_TEMPLATE } from "@/lib/utils/rubricTemplate";
import type { RubricInterviewers } from "@/lib/types/app.types";

// Verify the caller is authenticated, then use the service-role client for all
// DB writes so they bypass RLS regardless of the user's role in profiles.
async function getAuthAndAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { admin: createAdminClient(), user };
}

export async function createApplicant(formData: {
  name: string;
  email?: string;
  gpa?: string;
  major?: string;
  expected_graduation?: string;
  vertical_interest?: string;
  linkedin_url?: string;
  why_hillside?: string;
  contribution?: string;
  application_message?: string;
  info_sessions?: string;
}) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin.from("applicants").insert({
    name: formData.name.trim(),
    email: formData.email?.trim() || null,
    gpa: formData.gpa ? parseFloat(formData.gpa) : null,
    major: formData.major?.trim() || null,
    expected_graduation: formData.expected_graduation?.trim() || null,
    vertical_interest: formData.vertical_interest?.trim() || null,
    linkedin_url: formData.linkedin_url?.trim() || null,
    why_hillside: formData.why_hillside?.trim() || null,
    contribution: formData.contribution?.trim() || null,
    application_message: formData.application_message?.trim() || null,
    info_sessions: formData.info_sessions ? parseInt(formData.info_sessions) : 0,
    status: "pending",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function updateApplicant(id: string, formData: {
  name: string;
  email?: string;
  gpa?: string;
  major?: string;
  expected_graduation?: string;
  vertical_interest?: string;
  linkedin_url?: string;
  why_hillside?: string;
  contribution?: string;
  application_message?: string;
  info_sessions?: string;
}) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({
      name: formData.name.trim(),
      email: formData.email?.trim() || null,
      gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      major: formData.major?.trim() || null,
      expected_graduation: formData.expected_graduation?.trim() || null,
      vertical_interest: formData.vertical_interest?.trim() || null,
      linkedin_url: formData.linkedin_url?.trim() || null,
      why_hillside: formData.why_hillside?.trim() || null,
      contribution: formData.contribution?.trim() || null,
      application_message: formData.application_message?.trim() || null,
      info_sessions: formData.info_sessions ? parseInt(formData.info_sessions) : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function moveToInterview(applicantId: string) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({ status: "interview", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);

  await admin.from("interview_rubrics").upsert(
    { applicant_id: applicantId, template: RUBRIC_TEMPLATE, responses: {}, is_complete: false },
    { onConflict: "applicant_id" }
  );

  revalidatePath("/recruitment");
}

export async function moveToDeliberation(applicantId: string) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({
      status: "deliberation",
      deliberation_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function acceptApplicant(applicantId: string) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function rejectApplicant(applicantId: string) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function saveRubricResponses(
  rubricId: string,
  responses: Record<string, unknown>,
  notes: Record<string, string>,
  interviewers: RubricInterviewers,
  isComplete: boolean
) {
  const { admin, user } = await getAuthAndAdmin();

  const { error } = await admin
    .from("interview_rubrics")
    .update({
      responses,
      notes,
      interviewers,
      is_complete: isComplete,
      filled_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rubricId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function updateDecision(
  applicantId: string,
  decision: "yes" | "no" | "maybe" | "no_class"
) {
  const { admin } = await getAuthAndAdmin();

  const newStatus = decision === "yes" ? "interview" : "pending";

  const { error } = await admin
    .from("applicants")
    .update({ decision, status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);

  if (decision === "yes") {
    await admin.from("interview_rubrics").upsert(
      { applicant_id: applicantId, template: RUBRIC_TEMPLATE, responses: {}, is_complete: false },
      { onConflict: "applicant_id" }
    );
  }

  revalidatePath("/recruitment");
}

export async function updateResumePathAction(applicantId: string, resumePath: string) {
  const { admin } = await getAuthAndAdmin();

  const { error } = await admin
    .from("applicants")
    .update({ resume_path: resumePath, updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}
