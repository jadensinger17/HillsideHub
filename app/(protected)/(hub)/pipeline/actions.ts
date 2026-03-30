"use server";

import { createClient } from "@/lib/supabase/server";
import { hasFullAccess } from "@/lib/utils/roles";
import { redirect } from "next/navigation";
import type { Deal } from "@/lib/types/app.types";

async function getAuthorizedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, semester")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(profile)) throw new Error("Forbidden");
  return { supabase, user };
}

export async function updateDeal(
  id: string,
  updates: Partial<
    Pick<
      Deal,
      | "stage"
      | "contact_status"
      | "description"
      | "deal_owner"
      | "sourcing_analyst"
      | "deal_source"
      | "contact_name"
      | "analysts"
      | "industry_vertical"
      | "investment_cycle"
      | "sub_pipeline"
      | "tag"
      | "reason_for_killing"
      | "deal_name"
      | "company_name"
    >
  >
) {
  const { supabase } = await getAuthorizedUser();

  const { data, error } = await supabase
    .from("deals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Deal;
}
