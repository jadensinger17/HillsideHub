"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  semester: z.enum(["1st", "2nd", "3rd"]),
  vertical: z.enum([
    "financial_technology",
    "consumer_products",
    "sustainability",
    "sports_wellness",
  ]),
  fund_role: z.enum([
    "recruitment_team",
    "portfolio_team",
    "modeling_team",
    "relations_team",
    "operations_team",
    "chief_of_staff",
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function submitOnboarding(input: OnboardingInput) {
  // Always independently verify — never trust client
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  // Validate all fields server-side (client validation is UX only)
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { full_name, semester, vertical, fund_role } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      semester,
      verticals: [vertical],
      fund_role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  // redirect() throws a special Next.js error — must be outside try/catch
  redirect("/");
}
