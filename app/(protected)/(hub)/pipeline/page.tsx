import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import type { Deal } from "@/lib/types/app.types";

export default async function PipelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all active deals (exclude Rejected/On Hold/Too Early by default for payload size)
  // Rejected/On Hold deals are fetched separately for the summary counts
  const { data: activeDeals } = await supabase
    .from("deals")
    .select("*")
    .not("stage", "in", '("Rejected","On Hold","Too Early")')
    .order("modified_time", { ascending: false });

  const { data: inactiveDeals } = await supabase
    .from("deals")
    .select(
      "id, deal_name, company_name, stage, industry_vertical, investment_cycle, sub_pipeline, deal_owner, sourcing_analyst, analysts, contact_status, updated_at"
    )
    .in("stage", ["Rejected", "On Hold", "Too Early"])
    .order("modified_time", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {((activeDeals?.length ?? 0) + (inactiveDeals?.length ?? 0)).toLocaleString()} total deals ·{" "}
          {activeDeals?.length ?? 0} active
        </p>
      </div>

      <PipelineBoard
        activeDeals={(activeDeals ?? []) as Deal[]}
        inactiveDeals={(inactiveDeals ?? []) as Deal[]}
      />
    </div>
  );
}
