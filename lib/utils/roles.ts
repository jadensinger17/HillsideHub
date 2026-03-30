import type { Role } from "@/lib/types/app.types";

export function isAdmin(role: string | null | undefined): role is "admin" {
  return role === "admin";
}

export function isAnalyst(role: string | null | undefined): role is "analyst" {
  return role === "analyst";
}

// 3rd-semester analysts get full admin-level access everywhere
export function hasFullAccess(profile: { role?: string | null; semester?: string | null } | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === "admin" || profile.semester === "3rd";
}

export async function getRole(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
): Promise<Role | null> {
  const { data } = await supabase.rpc("get_my_role");
  return (data as unknown as Role) ?? null;
}
