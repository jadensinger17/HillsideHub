import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPaperboyCompanies } from "@/lib/utils/airtable";
import PaperboyDealFlow from "@/components/paperboy/PaperboyDealFlow";
import type { Role, Semester } from "@/lib/types/app.types";

export default async function PaperboyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, semester, verticals")
    .eq("id", user.id)
    .single();

  const profile = profileData as { role: Role; semester: Semester | null; verticals: string[] } | null;
  const isThirdSemester = profile?.role === "admin" || profile?.semester === "3rd";
  const hasAccess = isThirdSemester || (profile?.verticals ?? []).includes("consumer_products");

  if (!hasAccess) redirect("/");

  const companies = await fetchPaperboyCompanies();
  const columns = companies.length > 0 ? Object.keys(companies[0].fields) : [];

  // Fetch which record IDs already have a generated PDF in Supabase Storage
  const { data: pdfFiles } = await createAdminClient()
    .storage.from("one-pagers")
    .list("", { limit: 1000 });
  const generatedPdfIds = (pdfFiles ?? []).map((f) => f.name.replace(/\.pdf$/, ""));

  return (
    <PaperboyDealFlow
      companies={companies}
      columns={columns}
      generatedPdfIds={generatedPdfIds}
    />
  );
}
