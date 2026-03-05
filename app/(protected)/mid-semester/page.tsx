import { createClient } from "@/lib/supabase/server";
import { AnalystReportForm } from "@/components/mid-semester/AnalystReportForm";
import { AdminReportsTable } from "@/components/mid-semester/AdminReportsTable";
import type { MidSemesterReport, Profile } from "@/lib/types/app.types";

export default async function MidSemesterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const role = profile?.role;

  if (role === "admin") {
    // Admin view: fetch all reports with analyst profiles
    const { data: reports } = await supabase
      .from("mid_semester_reports")
      .select("*, profiles(*)")
      .order("submitted_at", { ascending: false });

    return (
      <AdminReportsTable
        reports={(reports ?? []) as (MidSemesterReport & { profiles: Profile })[]}
      />
    );
  }

  // Analyst view: fetch their own report (if any)
  const { data: existingReport } = await supabase
    .from("mid_semester_reports")
    .select("*")
    .eq("analyst_id", user!.id)
    .single();

  return <AnalystReportForm existingReport={existingReport as MidSemesterReport | null} />;
}
