import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleProvider } from "@/components/layout/RoleProvider";
import Navbar from "@/components/layout/Navbar";
import type { Role, Semester, FundRole } from "@/lib/types/app.types";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, verticals, semester, fund_role")
    .eq("id", user.id)
    .single();

  // Cast needed because postgrest-js type inference doesn't resolve array columns correctly
  const profile = profileData as { role: Role; full_name: string | null; verticals: string[]; semester: Semester | null; fund_role: FundRole | null } | null;
  const role = profile?.role ?? "analyst";
  const fullName = profile?.full_name ?? user.email ?? "";
  const verticals = profile?.verticals ?? [];
  const semester = profile?.semester ?? null;
  const fundRole = profile?.fund_role ?? null;

  return (
    <RoleProvider role={role} userId={user.id} userEmail={user.email ?? ""} fullName={fullName} verticals={verticals} semester={semester} fundRole={fundRole}>
      <div className="min-h-screen bg-surface-subtle">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}
