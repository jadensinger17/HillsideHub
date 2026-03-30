import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeNavbar } from "@/components/layout/HomeNavbar";

const TOOL_ICONS: Record<string, React.ReactNode> = {
  recruitment: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="6" r="3" />
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
    </svg>
  ),
  "mid-semester": (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M7 10h6M7 13h4" />
      <path d="M7 7h3" />
    </svg>
  ),
  paperboy: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <path d="M7 8h6M7 11h4" />
    </svg>
  ),
  pipeline: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4H4l4.5 5.5V15l3-1.5V9.5L16 4z" />
    </svg>
  ),
  admin: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.05 5.05l1.06 1.06M13.89 13.89l1.06 1.06M5.05 14.95l1.06-1.06M13.89 6.11l1.06-1.06" />
    </svg>
  ),
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  let verticals: string[] = [];
  let semester: string | null = null;
  let fullName: string | null = null;
  const userEmail = user?.email ?? null;

  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role, verticals, semester, full_name")
      .eq("id", user.id)
      .single();
    const profile = profileData as { role: string; verticals: string[]; semester: string | null; full_name: string | null } | null;
    role = profile?.role ?? "analyst";
    verticals = profile?.verticals ?? [];
    semester = profile?.semester ?? null;
    fullName = profile?.full_name ?? null;
    if (profile?.semester == null) redirect("/onboarding");
  }

  const isAdmin = role === "admin" || semester === "3rd";
  const hasPaperboy = isAdmin || verticals.includes("consumer_products");
  const firstName = fullName?.split(" ")[0] ?? null;

  const tools = [
    {
      key: "recruitment",
      href: "/recruitment",
      label: "Recruitment",
      description: "Review applicants, manage interviews, and make final decisions.",
    },
    {
      key: "mid-semester",
      href: "/mid-semester",
      label: "Mid-Semester",
      description: "Submit your mid-semester form or review all analyst reports.",
    },
    hasPaperboy && {
      key: "paperboy",
      href: "/paperboy",
      label: "Paperboy Deal Flow",
      description: "Browse Paperboy Ventures portfolio companies and generate one-pager reports.",
    },
    {
      key: "pipeline",
      href: "/pipeline",
      label: "Deal Pipeline",
      description: "Track sourced companies, deal stages, and investment progress.",
    },
    isAdmin && {
      key: "admin",
      href: "/admin",
      label: "Access Control",
      description: "Manage members, roles, teams, and platform access.",
    },
  ].filter(Boolean) as { key: string; href: string; label: string; description: string }[];

  return (
    <div className="min-h-dvh bg-surface-subtle">
      {user && (
        <HomeNavbar
          fullName={fullName}
          email={userEmail}
          role={role ?? "analyst"}
          semester={semester}
        />
      )}

      {/* Hero */}
      <div className="bg-navy-900 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-12">
          <p className="text-xs font-semibold text-brand-400 tracking-widest uppercase mb-3">
            Hillside Ventures
          </p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : "Hillside Hub"}
          </h1>
          <p className="text-white/45 mt-2 text-sm">
            {isAdmin ? "You have full access to all platform tools." : "Select a tool to get started."}
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.key}
                href={tool.href}
                className="group relative bg-white rounded-xl border border-surface-border shadow-card p-6
                           hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center mb-4 text-gray-500 group-hover:text-brand-500 group-hover:border-brand-100 group-hover:bg-brand-50 transition-all">
                  {TOOL_ICONS[tool.key]}
                </div>
                <h2 className="text-sm font-semibold text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors">
                  {tool.label}
                </h2>
                <p className="text-gray-400 mt-1.5 text-xs leading-relaxed">
                  {tool.description}
                </p>
                <div className="absolute top-5 right-5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 7h10M8 3l4 4-4 4" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all shadow-[0_1px_3px_rgba(0,119,181,0.3)] hover:shadow-[0_2px_8px_rgba(0,119,181,0.35)]"
          >
            Sign in to continue
          </Link>
        )}
      </div>
    </div>
  );
}
