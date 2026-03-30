"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateDeal } from "@/app/(protected)/(hub)/pipeline/actions";
import type { Deal, DealStage } from "@/lib/types/app.types";

const STAGES: DealStage[] = [
  "Source",
  "Connect",
  "Quick Screen",
  "One Pager",
  "Investment Memo",
  "Due Diligence",
  "Close",
  "In Portfolio",
  "On Hold",
  "Too Early",
  "Rejected",
];

const VERTICALS = [
  "SaaS",
  "Healthcare",
  "Financial Innovation",
  "Manufacturing Technology",
  "Sustainability",
  "Sports and Wellness",
  "Human Development",
  "Consumer",
  "Consumer Products",
];

const SUB_PIPELINES = [
  "HV STEM",
  "HV Genesis",
  "Real Estate Investment Fund",
];

const CYCLES = [
  "Fall 2023",
  "Spring 2024",
  "Fall 2024",
  "Spring 2025",
  "Fall 2025",
  "Spring 2026",
];

interface Props {
  deal: Deal;
  onClose: () => void;
  onUpdated: (updated: Deal) => void;
}

export function DealDetailModal({ deal, onClose, onUpdated }: Props) {
  const [form, setForm] = useState({ ...deal });
  const [isPending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  function set(field: keyof Deal, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const updated = await updateDeal(deal.id, {
          stage: form.stage,
          contact_status: form.contact_status,
          description: form.description,
          deal_owner: form.deal_owner,
          sourcing_analyst: form.sourcing_analyst,
          deal_source: form.deal_source,
          contact_name: form.contact_name,
          analysts: form.analysts,
          industry_vertical: form.industry_vertical,
          investment_cycle: form.investment_cycle,
          sub_pipeline: form.sub_pipeline,
          tag: form.tag,
          reason_for_killing: form.reason_for_killing,
          deal_name: form.deal_name,
          company_name: form.company_name,
        });
        onUpdated(updated);
        toast.success("Deal updated");
        setDirty(false);
      } catch {
        toast.error("Failed to save deal");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="min-w-0 flex-1 pr-4">
            <h2 className="text-lg font-semibold text-gray-900 leading-snug">
              {form.company_name || form.deal_name || "Deal Details"}
            </h2>
            {form.deal_name && form.company_name && form.deal_name !== form.company_name && (
              <p className="text-sm text-gray-400 mt-0.5">{form.deal_name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Row: Stage + Sub-Pipeline */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stage">
              <select
                value={form.stage ?? ""}
                onChange={(e) => set("stage", e.target.value as DealStage)}
                className="input-field"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Sub-Pipeline">
              <select
                value={form.sub_pipeline ?? ""}
                onChange={(e) => set("sub_pipeline", e.target.value)}
                className="input-field"
              >
                <option value="">— None —</option>
                {SUB_PIPELINES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row: Vertical + Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Industry Vertical">
              <select
                value={form.industry_vertical ?? ""}
                onChange={(e) => set("industry_vertical", e.target.value)}
                className="input-field"
              >
                <option value="">— None —</option>
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Investment Cycle">
              <select
                value={form.investment_cycle ?? ""}
                onChange={(e) => set("investment_cycle", e.target.value)}
                className="input-field"
              >
                <option value="">— None —</option>
                {CYCLES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row: Contact Status */}
          <Field label="Contact Status">
            <select
              value={form.contact_status ?? ""}
              onChange={(e) => set("contact_status", e.target.value)}
              className="input-field"
            >
              <option value="">— None —</option>
              <option value="Reached Out">Reached Out</option>
              <option value="Have not Reached out">Have not Reached out</option>
            </select>
          </Field>

          {/* Row: Company + Deal Name */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name">
              <input
                type="text"
                value={form.company_name ?? ""}
                onChange={(e) => set("company_name", e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Deal Name">
              <input
                type="text"
                value={form.deal_name ?? ""}
                onChange={(e) => set("deal_name", e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          {/* Row: Deal Owner + Sourcing Analyst */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Deal Owner">
              <input
                type="text"
                value={form.deal_owner ?? ""}
                onChange={(e) => set("deal_owner", e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Sourcing Analyst">
              <input
                type="text"
                value={form.sourcing_analyst ?? ""}
                onChange={(e) => set("sourcing_analyst", e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          {/* Row: Contact Name + Deal Source */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact Name">
              <input
                type="text"
                value={form.contact_name ?? ""}
                onChange={(e) => set("contact_name", e.target.value)}
                className="input-field"
              />
            </Field>
            <Field label="Deal Source">
              <input
                type="text"
                value={form.deal_source ?? ""}
                onChange={(e) => set("deal_source", e.target.value)}
                className="input-field"
              />
            </Field>
          </div>

          {/* Analysts */}
          <Field label="Analysts">
            <input
              type="text"
              value={form.analysts ?? ""}
              onChange={(e) => set("analysts", e.target.value)}
              placeholder="Comma-separated names"
              className="input-field"
            />
          </Field>

          {/* Tag */}
          <Field label="Tag">
            <input
              type="text"
              value={form.tag ?? ""}
              onChange={(e) => set("tag", e.target.value)}
              className="input-field"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="input-field resize-none"
            />
          </Field>

          {/* Reason for Killing */}
          <Field label="Reason for Killing">
            <textarea
              value={form.reason_for_killing ?? ""}
              onChange={(e) => set("reason_for_killing", e.target.value)}
              rows={2}
              className="input-field resize-none"
            />
          </Field>

          {/* Timestamps (read-only) */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <ReadField label="Created" value={fmt(deal.created_time)} />
            <ReadField label="Last Modified" value={fmt(deal.modified_time)} />
            <ReadField label="Last Activity" value={fmt(deal.last_activity_time)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || isPending}
            className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs text-gray-600 mt-0.5">{value}</p>
    </div>
  );
}

function fmt(ts: string | null) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return ts;
  }
}
