"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAdminOrThrow() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { supabase, user };
}

export async function moveToInterview(applicantId: string) {
  const { supabase } = await getAdminOrThrow();

  const { error } = await supabase
    .from("applicants")
    .update({ status: "interview", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);

  // Create an empty rubric record for this applicant
  await supabase.from("interview_rubrics").upsert(
    { applicant_id: applicantId, template: {}, responses: {}, is_complete: false },
    { onConflict: "applicant_id" }
  );

  revalidatePath("/recruitment");
}

export async function acceptApplicant(applicantId: string) {
  const { supabase } = await getAdminOrThrow();

  const { error } = await supabase
    .from("applicants")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function rejectApplicant(applicantId: string) {
  const { supabase } = await getAdminOrThrow();

  const { error } = await supabase
    .from("applicants")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}

export async function saveRubricResponses(
  rubricId: string,
  responses: Record<string, unknown>,
  isComplete: boolean
) {
  const { supabase, user } = await getAdminOrThrow();

  const { error } = await supabase
    .from("interview_rubrics")
    .update({
      responses,
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
  const { supabase } = await getAdminOrThrow();

  const newStatus = decision === "yes" ? "interview" : "pending";

  const { error } = await supabase
    .from("applicants")
    .update({ decision, status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);

  // Auto-create rubric when moving to interview
  if (decision === "yes") {
    await supabase.from("interview_rubrics").upsert(
      { applicant_id: applicantId, template: {}, responses: {}, is_complete: false },
      { onConflict: "applicant_id" }
    );
  }

  revalidatePath("/recruitment");
}

export async function updateResumePathAction(applicantId: string, resumePath: string) {
  const { supabase } = await getAdminOrThrow();

  const { error } = await supabase
    .from("applicants")
    .update({ resume_path: resumePath, updated_at: new Date().toISOString() })
    .eq("id", applicantId);

  if (error) throw new Error(error.message);
  revalidatePath("/recruitment");
}
