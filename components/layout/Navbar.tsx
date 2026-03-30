"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/components/layout/RoleProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface NavLink {
  href: string;
  label: string;
  adminOnly: boolean;
  requiredVerticals?: string[];
}

export default function Navbar() {
  const { role, fullName, verticals, semester } = useUser();
  const isFullAccess = role === "admin" || semester === "3rd";
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navLinks: NavLink[] = [
    { href: "/recruitment",  label: "Recruitment",        adminOnly: false },
    { href: "/mid-semester", label: "Mid-Semester",       adminOnly: false },
    { href: "/paperboy",     label: "Paperboy",           adminOnly: false, requiredVerticals: ["consumer_products"] },
    { href: "/pipeline",     label: "Deal Pipeline",      adminOnly: false },
    { href: "/admin",        label: "Admin",              adminOnly: true },
  ];

  const firstName = fullName?.split(" ")[0];

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo + nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                Hillside Hub
              </span>
            </Link>

            <nav className="flex items-center gap-0.5">
              {navLinks.map((link) => {
                if (link.adminOnly && !isFullAccess) return null;
                if (
                  link.requiredVerticals &&
                  !isFullAccess &&
                  !link.requiredVerticals.some((v) => verticals.includes(v))
                ) return null;

                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[13px] font-medium transition-all",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            {firstName && (
              <span className="text-[13px] text-white/50 hidden sm:block">{firstName}</span>
            )}
            <span className="text-[11px] font-medium bg-white/10 text-white/60 px-2 py-0.5 rounded capitalize">
              {role}
            </span>
            <button
              onClick={handleLogout}
              className="text-[13px] text-white/40 hover:text-white/80 transition-colors"
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
