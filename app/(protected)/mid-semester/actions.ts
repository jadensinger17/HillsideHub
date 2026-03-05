"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitMidSemesterReport(formData: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  // Verify the user is an analyst (analysts submit their own report)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "analyst") throw new Error("Forbidden");

  const { error: upsertError } = await supabase
    .from("mid_semester_reports")
    .upsert(
      {
        analyst_id: user.id,
        form_data: formData,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "analyst_id" }
    );

  if (upsertError) throw new Error(upsertError.message);
  revalidatePath("/mid-semester");
}
