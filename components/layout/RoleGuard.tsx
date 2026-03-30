"use client";

import { useUser } from "@/components/layout/RoleProvider";
import type { Role } from "@/lib/types/app.types";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { role, semester } = useUser();
  const isFullAccess = semester === "3rd";
  if (!allowedRoles.includes(role) && !isFullAccess) return <>{fallback}</>;
  return <>{children}</>;
}
