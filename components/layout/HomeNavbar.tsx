"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Props {
  fullName: string | null;
  email: string | null;
  role: string;
  semester: string | null;
}

export function HomeNavbar({ fullName, email, role, semester }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const firstName = fullName?.split(" ")[0] ?? email?.split("@")[0] ?? "User";
  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (email?.[0] ?? "U").toUpperCase();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-base font-semibold text-white tracking-tight">
            Hillside Hub
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.07] transition-colors"
            >
              {/* Avatar */}
              <span className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-300 shrink-0">
                {initials}
              </span>
              <span className="text-sm text-white/75 hidden sm:block">{firstName}</span>
              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-surface-border shadow-modal z-50 overflow-hidden">
                {/* Profile header */}
                <div className="px-4 py-4 border-b border-surface-border">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-[13px] font-semibold text-brand-600 shrink-0">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{fullName ?? "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{email ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[11px] font-medium bg-surface-subtle border border-surface-border text-gray-600 px-2 py-0.5 rounded capitalize">
                      {role}
                    </span>
                    {semester && (
                      <span className="text-[11px] font-medium bg-surface-subtle border border-surface-border text-gray-600 px-2 py-0.5 rounded">
                        {semester} semester
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
