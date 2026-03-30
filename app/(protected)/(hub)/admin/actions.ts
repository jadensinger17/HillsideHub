"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role, FundRole, Semester } from "@/lib/types/app.types";
import { hasFullAccess } from "@/lib/utils/roles";

async function getAdminOrThrow() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, semester")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(profile)) throw new Error("Forbidden");
}

export async function updateUserProfile(
  userId: string,
  updates: {
    role: Role;
    verticals: string[];
    fund_role: FundRole | null;
    semester: Semester | null;
  }
) {
  await getAdminOrThrow();

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({
      role: updates.role,
      verticals: updates.verticals,
      fund_role: updates.fund_role,
      semester: updates.semester,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
