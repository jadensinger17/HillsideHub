import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Profile } from "@/lib/types/app.types";
import { hasFullAccess } from "@/lib/utils/roles";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, semester")
    .eq("id", user.id)
    .single();

  if (!hasFullAccess(profile)) redirect("/");

  const adminClient = createAdminClient();
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage roles, teams, verticals, and semester standing for all members.
          Changes take effect immediately across the entire platform.
        </p>
      </div>

      <UsersTable profiles={(profiles ?? []) as Profile[]} />
    </div>
  );
}
