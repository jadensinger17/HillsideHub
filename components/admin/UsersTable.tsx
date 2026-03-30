"use client";

import { useState } from "react";
import { EditUserModal } from "@/components/admin/EditUserModal";
import type { Profile } from "@/lib/types/app.types";

const VERTICAL_LABELS: Record<string, string> = {
  financial_technology: "FinTech",
  sustainability: "Sustainability",
  consumer_products: "Consumer",
  sports_wellness: "Sports & Wellness",
};

const FUND_ROLE_LABELS: Record<string, string> = {
  recruitment_team: "Recruitment",
  portfolio_team: "Portfolio",
  modeling_team: "Modeling",
  relations_team: "Relations",
  operations_team: "Operations",
  chief_of_staff: "Chief of Staff",
};

function hasFullAccess(p: Profile) {
  return p.role === "admin" || p.semester === "3rd";
}

interface Props {
  profiles: Profile[];
}

export function UsersTable({ profiles }: Props) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "analyst">("all");
  const [filterSemester, setFilterSemester] = useState<"all" | "1st" | "2nd" | "3rd">("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [editing, setEditing] = useState<Profile | null>(null);
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(profiles);

  const filtered = localProfiles.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !(p.full_name ?? "").toLowerCase().includes(q) &&
        !p.email.toLowerCase().includes(q)
      ) return false;
    }
    if (filterRole !== "all" && p.role !== filterRole) return false;
    if (filterSemester !== "all" && p.semester !== filterSemester) return false;
    if (filterTeam !== "all" && p.fund_role !== filterTeam) return false;
    return true;
  });

  function handleSaved(updated: Profile) {
    setLocalProfiles((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditing(null);
  }

  // Stats
  const fullAccessCount = localProfiles.filter(hasFullAccess).length;
  const byTeam = Object.entries(FUND_ROLE_LABELS).map(([key, label]) => ({
    key,
    label,
    count: localProfiles.filter((p) => p.fund_role === key).length,
  })).filter((t) => t.count > 0);

  const hasFilters = filterRole !== "all" || filterSemester !== "all" || filterTeam !== "all" || search;

  return (
    <>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{localProfiles.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Full Access</p>
          <p className="text-2xl font-bold text-purple-700">{fullAccessCount}</p>
          <p className="text-xs text-gray-400">admin + 3rd semester</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">3rd Semester</p>
          <p className="text-2xl font-bold text-gray-900">
            {localProfiles.filter((p) => p.semester === "3rd").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Teams Active</p>
          <p className="text-2xl font-bold text-gray-900">{byTeam.length}</p>
          <p className="text-xs text-gray-400 truncate">
            {byTeam.map((t) => t.label).join(", ") || "—"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 bg-gray-50 rounded-xl p-3 mb-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-56 bg-white"
          />
        </div>

        {/* Role filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
        </select>

        {/* Semester filter */}
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value as typeof filterSemester)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
        >
          <option value="all">All Semesters</option>
          <option value="1st">1st Semester</option>
          <option value="2nd">2nd Semester</option>
          <option value="3rd">3rd Semester</option>
        </select>

        {/* Team filter */}
        <select
          value={filterTeam}
          onChange={(e) => setFilterTeam(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
        >
          <option value="all">All Teams</option>
          {Object.entries(FUND_ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterRole("all"); setFilterSemester("all"); setFilterTeam("all"); }}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500 self-center">
          {filtered.length} of {localProfiles.length} users
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Member</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Access</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Team</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Verticals</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Semester</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No users match the current filters
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const full = hasFullAccess(p);
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {/* Member */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {p.full_name ?? <span className="text-gray-400 font-normal italic">No name</span>}
                    </p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </td>

                  {/* Access level */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {p.role}
                      </span>
                      {full && (
                        <span className="inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          full access
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Team */}
                  <td className="px-4 py-3 text-gray-600">
                    {p.fund_role
                      ? (FUND_ROLE_LABELS[p.fund_role] ?? p.fund_role)
                      : <span className="text-gray-400">—</span>}
                  </td>

                  {/* Verticals */}
                  <td className="px-4 py-3">
                    {p.verticals.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {p.verticals.map((v) => (
                          <span key={v} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {VERTICAL_LABELS[v] ?? v}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Semester */}
                  <td className="px-4 py-3">
                    {p.semester ? (
                      <span className={`text-sm font-medium ${p.semester === "3rd" ? "text-amber-700" : "text-gray-600"}`}>
                        {p.semester}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Edit */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditUserModal
        profile={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
