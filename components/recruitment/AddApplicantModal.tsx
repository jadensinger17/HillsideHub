"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createApplicant, updateApplicant } from "@/app/(protected)/(hub)/recruitment/actions";
import { toast } from "sonner";
import type { Applicant } from "@/lib/types/app.types";

const VERTICALS = [
  "Financial Technology",
  "Consumer Products",
  "Sports & Wellness",
  "Sustainability",
];

const GRAD_YEARS = [
  "Spring 2025", "Fall 2025", "Spring 2026", "Fall 2026",
  "Spring 2027", "Fall 2027", "Spring 2028", "Fall 2028",
];

type FormState = {
  name: string;
  email: string;
  gpa: string;
  major: string;
  expected_graduation: string;
  vertical_interest: string;
  linkedin_url: string;
  why_hillside: string;
  contribution: string;
  application_message: string;
  info_sessions: string;
};

const EMPTY_FORM: FormState = {
  name: "", email: "", gpa: "", major: "", expected_graduation: "",
  vertical_interest: "", linkedin_url: "", why_hillside: "",
  contribution: "", application_message: "", info_sessions: "",
};

function applicantToForm(a: Applicant): FormState {
  return {
    name: a.name ?? "",
    email: a.email ?? "",
    gpa: a.gpa != null && a.gpa > 0 ? a.gpa.toFixed(2) : "",
    major: a.major ?? "",
    expected_graduation: a.expected_graduation ?? "",
    vertical_interest: a.vertical_interest ?? "",
    linkedin_url: a.linkedin_url ?? "",
    why_hillside: a.why_hillside ?? "",
    contribution: a.contribution ?? "",
    application_message: a.application_message ?? "",
    info_sessions: a.info_sessions != null ? String(a.info_sessions) : "",
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** If provided, the modal is in edit mode and pre-populates with this applicant's data. */
  applicant?: Applicant | null;
}

export function AddApplicantModal({ open, onClose, applicant }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!applicant;

  const [form, setForm] = useState<FormState>(
    applicant ? applicantToForm(applicant) : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Re-populate form whenever the applicant changes (e.g. opening a different row)
  useEffect(() => {
    setForm(applicant ? applicantToForm(applicant) : EMPTY_FORM);
    setErrors({});
  }, [applicant]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (form.gpa && (isNaN(parseFloat(form.gpa)) || parseFloat(form.gpa) < 0 || parseFloat(form.gpa) > 4.0)) {
      next.gpa = "GPA must be between 0 and 4.0";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    startTransition(async () => {
      try {
        if (isEdit && applicant) {
          await updateApplicant(applicant.id, form);
          toast.success(`${form.name} updated`);
        } else {
          await createApplicant(form);
          toast.success(`${form.name} added`);
        }
        router.refresh();
        handleClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleClose() {
    setForm(applicant ? applicantToForm(applicant) : EMPTY_FORM);
    setErrors({});
    onClose();
  }

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? `Edit — ${applicant?.name}` : "Add Applicant"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Name + Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Smith"
              className={inputClass("name")}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@university.edu"
              className={inputClass("email")}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Row 2: GPA + Major */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">GPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={form.gpa}
              onChange={(e) => set("gpa", e.target.value)}
              placeholder="3.75"
              className={inputClass("gpa")}
            />
            {errors.gpa && <p className="text-xs text-red-500 mt-1">{errors.gpa}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Major</label>
            <input
              type="text"
              value={form.major}
              onChange={(e) => set("major", e.target.value)}
              placeholder="Computer Science"
              className={inputClass("major")}
            />
          </div>
        </div>

        {/* Row 3: Graduation + Vertical */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expected Graduation</label>
            <select
              value={form.expected_graduation}
              onChange={(e) => set("expected_graduation", e.target.value)}
              className={inputClass("expected_graduation")}
            >
              <option value="">Select…</option>
              {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Interest</label>
            <select
              value={form.vertical_interest}
              onChange={(e) => set("vertical_interest", e.target.value)}
              className={inputClass("vertical_interest")}
            >
              <option value="">Select…</option>
              {VERTICALS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: LinkedIn + Info Sessions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) => set("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/janesmith"
              className={inputClass("linkedin_url")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Info Sessions Attended</label>
            <input
              type="number"
              min="0"
              value={form.info_sessions}
              onChange={(e) => set("info_sessions", e.target.value)}
              placeholder="0"
              className={inputClass("info_sessions")}
            />
          </div>
        </div>

        {/* Why Hillside */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Why Hillside?</label>
          <textarea
            value={form.why_hillside}
            onChange={(e) => set("why_hillside", e.target.value)}
            rows={2}
            placeholder="Why are they interested in Hillside Ventures?"
            className={`${inputClass("why_hillside")} resize-none`}
          />
        </div>

        {/* Contribution */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contribution</label>
          <textarea
            value={form.contribution}
            onChange={(e) => set("contribution", e.target.value)}
            rows={2}
            placeholder="What would they contribute to the fund?"
            className={`${inputClass("contribution")} resize-none`}
          />
        </div>

        {/* Application Message */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Application Message</label>
          <textarea
            value={form.application_message}
            onChange={(e) => set("application_message", e.target.value)}
            rows={3}
            placeholder="Additional application notes…"
            className={`${inputClass("application_message")} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <LoadingSpinner className="h-4 w-4 mr-2" />}
            {isEdit ? "Save Changes" : "Add Applicant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
