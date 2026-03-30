"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { updateUserProfile } from "@/app/(protected)/(hub)/admin/actions";
import type { Profile, Role, FundRole, Semester } from "@/lib/types/app.types";

const VERTICALS: { value: string; label: string }[] = [
  { value: "financial_technology", label: "Financial Technology" },
  { value: "sustainability", label: "Sustainability" },
  { value: "consumer_products", label: "Consumer Products" },
  { value: "sports_wellness", label: "Sports & Wellness" },
];

const FUND_ROLES: { value: FundRole; label: string }[] = [
  { value: "recruitment_team", label: "Recruitment" },
  { value: "portfolio_team", label: "Portfolio" },
  { value: "modeling_team", label: "Modeling" },
  { value: "relations_team", label: "Relations" },
  { value: "operations_team", label: "Operations" },
  { value: "chief_of_staff", label: "Chief of Staff" },
];

const SEMESTERS: { value: Semester; label: string }[] = [
  { value: "1st", label: "1st Semester" },
  { value: "2nd", label: "2nd Semester" },
  { value: "3rd", label: "3rd Semester" },
];

interface Props {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}

export function EditUserModal({ profile, open, onClose, onSaved }: Props) {
  const [role, setRole] = useState<Role>("analyst");
  const [verticals, setVerticals] = useState<string[]>([]);
  const [fundRole, setFundRole] = useState<FundRole | "">("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [isPending, startTransition] = useTransition();

  // Sync state when a new profile is opened
  useEffect(() => {
    if (profile) {
      setRole(profile.role);
      setVerticals(profile.verticals ?? []);
      setFundRole(profile.fund_role ?? "");
      setSemester(profile.semester ?? "");
    }
  }, [profile]);

  function toggleVertical(v: string) {
    setVerticals((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function handleSave() {
    if (!profile) return;
    startTransition(async () => {
      try {
        await updateUserProfile(profile.id, {
          role,
          verticals,
          fund_role: fundRole || null,
          semester: (semester as Semester) || null,
        });
        toast.success("User updated");
        onSaved({
          ...profile,
          role,
          verticals,
          fund_role: (fundRole as FundRole) || null,
          semester: (semester as Semester) || null,
        });
      } catch {
        toast.error("Failed to update user");
      }
    });
  }

  const effectiveFull = role === "admin" || semester === "3rd";

  const ACCESS_GRANTS: { label: string; granted: boolean }[] = [
    { label: "Recruitment — view applicants & manage interviews", granted: effectiveFull },
    { label: "Admin panel — manage users & roles", granted: effectiveFull },
    { label: "Mid-Semester — view all analyst reports", granted: effectiveFull },
    { label: "Paperboy Deal Flow", granted: effectiveFull || verticals.includes("consumer_products") },
    { label: "Mid-Semester — submit own report", granted: true },
  ];

  if (!profile) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {profile.full_name ?? profile.email}
          </h3>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        {/* System Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">System Role</label>
          <div className="flex gap-3">
            {(["analyst", "admin"] as Role[]).map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="text-brand-500"
                />
                <span className={`text-sm font-medium capitalize px-2 py-0.5 rounded-full ${
                  r === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {r}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Verticals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Verticals</label>
          <div className="grid grid-cols-2 gap-2">
            {VERTICALS.map((v) => (
              <label key={v.value} className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={verticals.includes(v.value)}
                  onChange={() => toggleVertical(v.value)}
                  className="rounded border-gray-300 text-brand-500"
                />
                <span className="text-sm text-gray-700">{v.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fund Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fund Role</label>
          <select
            value={fundRole}
            onChange={(e) => setFundRole(e.target.value as FundRole | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="">— None —</option>
            {FUND_ROLES.map((fr) => (
              <option key={fr.value} value={fr.value}>{fr.label}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value as Semester | "")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="">— None —</option>
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Effective Access Preview */}
        <div className={`rounded-lg border px-4 py-3 ${effectiveFull ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${effectiveFull ? "text-amber-700" : "text-gray-500"}`}>
            Effective Access
            {effectiveFull && (
              <span className="ml-2 normal-case font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Full Access
              </span>
            )}
          </p>
          <ul className="space-y-1">
            {ACCESS_GRANTS.map((a) => (
              <li key={a.label} className="flex items-center gap-2 text-xs">
                <span className={a.granted ? "text-green-600" : "text-gray-300"}>
                  {a.granted ? "✓" : "✕"}
                </span>
                <span className={a.granted ? "text-gray-700" : "text-gray-400"}>{a.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <LoadingSpinner className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
