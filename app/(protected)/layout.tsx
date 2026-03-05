import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoleProvider } from "@/components/layout/RoleProvider";
import Navbar from "@/components/layout/Navbar";
import type { Role } from "@/lib/types/app.types";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "analyst") as Role;
  const fullName = profile?.full_name ?? user.email ?? "";

  return (
    <RoleProvider role={role} userId={user.id} userEmail={user.email ?? ""} fullName={fullName}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}
