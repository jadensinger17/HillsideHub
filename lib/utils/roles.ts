import type { Role } from "@/lib/types/app.types";

export function isAdmin(role: string | null | undefined): role is "admin" {
  return role === "admin";
}

export function isAnalyst(role: string | null | undefined): role is "analyst" {
  return role === "analyst";
}

export async function getRole(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>
): Promise<Role | null> {
  const { data } = await supabase.rpc("get_my_role");
  return (data as unknown as Role) ?? null;
}
