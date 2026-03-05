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

  // AUTH DISABLED FOR TESTING — mock admin role when not logged in
  // To re-enable: uncomment redirect, remove mock block, restore profile fetch
  const role = "admin" as Role;
  const fullName = user?.email ?? "Test Admin";
  const userId = user?.id ?? "test-user";
  const userEmail = user?.email ?? "test@hillside.com";

  return (
    <RoleProvider role={role} userId={userId} userEmail={userEmail} fullName={fullName}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}
