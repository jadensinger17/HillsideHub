"use client";

import { createContext, useContext } from "react";
import type { Role, Semester, FundRole } from "@/lib/types/app.types";

interface UserContextValue {
  role: Role;
  userId: string;
  userEmail: string;
  fullName: string;
  verticals: string[];
  semester: Semester | null;
  fundRole: FundRole | null;
}

const UserContext = createContext<UserContextValue | null>(null);

export function RoleProvider({
  children,
  role,
  userId,
  userEmail,
  fullName,
  verticals,
  semester,
  fundRole,
}: {
  children: React.ReactNode;
  role: Role;
  userId: string;
  userEmail: string;
  fullName: string;
  verticals: string[];
  semester: Semester | null;
  fundRole: FundRole | null;
}) {
  return (
    <UserContext.Provider value={{ role, userId, userEmail, fullName, verticals, semester, fundRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside RoleProvider");
  return ctx;
}
