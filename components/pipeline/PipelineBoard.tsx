"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { DealCard } from "./DealCard";
import { DealDetailModal } from "./DealDetailModal";
import { PipelineAnalytics } from "./PipelineAnalytics";
import type { Deal, DealStage } from "@/lib/types/app.types";

// ── Column config ─────────────────────────────────────────────────────────────

interface ColumnDef {
  stage: DealStage;
  label: string;
  color: string;        // header accent color
  headerBg: string;
}

const ACTIVE_COLUMNS: ColumnDef[] = [
  { stage: "Source",           label: "Source",           color: "text-gray-600",   headerBg: "bg-gray-100" },
  { stage: "Connect",          label: "Connect",          color: "text-blue-600",   headerBg: "bg-blue-50" },
  { stage: "Quick Screen",     label: "Quick Screen",     color: "text-indigo-600", headerBg: "bg-indigo-50" },
  { stage: "One Pager",        label: "One Pager",        color: "text-purple-600", headerBg: "bg-purple-50" },
  { stage: "Investment Memo",  label: "Investment Memo",  color: "text-amber-600",  headerBg: "bg-amber-50" },
  { stage: "Due Diligence",    label: "Due Diligence",    color: "text-orange-600", headerBg: "bg-orange-50" },
  { stage: "Close",            label: "Close",            color: "text-green-600",  headerBg: "bg-green-50" },
  { stage: "In Portfolio",     label: "In Portfolio",     color: "text-emerald-700",headerBg: "bg-emerald-50" },
];

// ── Filter helpers ────────────────────────────────────────────────────────────

const CYCLES = ["Fall 2023","Spring 2024","Fall 2024","Spring 2025","Fall 2025","Spring 2026"];
const SUB_PIPELINES = ["HV STEM","HV Genesis","Real Estate Investment Fund"];
const VERTICALS = [
  "SaaS","Healthcare","Financial Innovation","Manufacturing Technology",
  "Sustainability","Sports and Wellness","Human Development","Consumer","Consumer Products",
];

function matchesFilter(deal: Deal, filters: Filters): boolean {
  if (filters.cycle && deal.investment_cycle !== filters.cycle) return false;
  if (filters.subPipeline && deal.sub_pipeline !== filters.subPipeline) return false;
  if (filters.vertical && !deal.industry_vertical?.includes(filters.vertical)) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = [
      deal.company_name, deal.deal_name, deal.deal_owner,
      deal.sourcing_analyst, deal.analysts, deal.contact_name,
    ].join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

interface Filters {
  cycle: string;
  subPipeline: string;
  vertical: string;
  search: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  activeDeals: Deal[];
  inactiveDeals: Deal[];
}

const PAGE_SIZE = 25;

export function PipelineBoard({ activeDeals, inactiveDeals }: Props) {
  const [view, setView] = useState<"board" | "analytics">("board");
  const [filters, setFilters] = useState<Filters>({
    cycle: "", subPipeline: "", vertical: "", search: "",
  });
  const [selected, setSelected] = useState<Deal | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  // page limits per column: columnStage → count shown
  const [pageLimits, setPageLimits] = useState<Partial<Record<DealStage, number>>>({});
  const [localDeals, setLocalDeals] = useState<Deal[]>(activeDeals);
  const [localInactive, setLocalInactive] = useState<Deal[]>(inactiveDeals);

  function setFilter(key: keyof Filters, val: string) {
    setFilters((f) => ({ ...f, [key]: val }));
    setPageLimits({});
  }

  function clearFilters() {
    setFilters({ cycle: "", subPipeline: "", vertical: "", search: "" });
    setPageLimits({});
  }

  const hasFilters = Object.values(filters).some(Boolean);

  const filteredActive = useMemo(
    () => localDeals.filter((d) => matchesFilter(d, filters)),
    [localDeals, filters]
  );

  const filteredInactive = useMemo(
    () => localInactive.filter((d) => matchesFilter(d, filters)),
    [localInactive, filters]
  );

  const totalFiltered = filteredActive.length + (showInactive ? filteredInactive.length : 0);

  function handleUpdated(updated: Deal) {
    const isActive = !["Rejected", "On Hold", "Too Early"].includes(updated.stage);
    const wasActive = !["Rejected", "On Hold", "Too Early"].includes(selected?.stage ?? "");

    if (wasActive && isActive) {
      setLocalDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } else if (wasActive && !isActive) {
      setLocalDeals((prev) => prev.filter((d) => d.id !== updated.id));
      setLocalInactive((prev) => [updated, ...prev]);
    } else if (!wasActive && isActive) {
      setLocalInactive((prev) => prev.filter((d) => d.id !== updated.id));
      setLocalDeals((prev) => [updated, ...prev]);
    } else {
      setLocalInactive((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    }
    setSelected(updated);
  }

  return (
    <div className="flex flex-col gap-4 min-h-0">
      {/* ── View toggle + Filters bar ────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
        {/* Board / Analytics toggle */}
        <div className="bg-gray-100 rounded-lg p-0.5 inline-flex gap-0.5 shrink-0">
          <button
            onClick={() => setView("board")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "board"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Board
          </button>
          <button
            onClick={() => setView("analytics")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "analytics"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Analytics
          </button>
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 shrink-0" />
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search company, analyst, owner…"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <FilterSelect
          value={filters.cycle}
          onChange={(v) => setFilter("cycle", v)}
          placeholder="All Cycles"
          options={CYCLES}
        />
        <FilterSelect
          value={filters.subPipeline}
          onChange={(v) => setFilter("subPipeline", v)}
          placeholder="All Funds"
          options={SUB_PIPELINES}
        />
        <FilterSelect
          value={filters.vertical}
          onChange={(v) => setFilter("vertical", v)}
          placeholder="All Verticals"
          options={VERTICALS}
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded hover:bg-gray-100"
          >
            Clear filters
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {totalFiltered.toLocaleString()} deals
        </span>
      </div>

      {/* ── Analytics view ──────────────────────────────────────────────────── */}
      {view === "analytics" && (
        <PipelineAnalytics activeDeals={localDeals} inactiveDeals={localInactive} />
      )}

      {/* ── Kanban board ────────────────────────────────────────────────────── */}
      <div className={cn("overflow-x-auto pb-4", view !== "board" && "hidden")}>
        <div className="flex gap-3 min-w-max">
          {ACTIVE_COLUMNS.map((col) => {
            const cards = filteredActive.filter((d) => d.stage === col.stage);
            const limit = pageLimits[col.stage] ?? PAGE_SIZE;
            const visible = cards.slice(0, limit);
            const hasMore = cards.length > limit;

            return (
              <div key={col.stage} className="flex flex-col w-64 flex-shrink-0">
                {/* Column header */}
                <div className={cn("flex items-center justify-between px-3 py-2 rounded-lg mb-2", col.headerBg)}>
                  <span className={cn("text-sm font-semibold", col.color)}>
                    {col.label}
                  </span>
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/80", col.color)}>
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {visible.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => setSelected(deal)}
                    />
                  ))}

                  {hasMore && (
                    <button
                      onClick={() =>
                        setPageLimits((prev) => ({
                          ...prev,
                          [col.stage]: (prev[col.stage] ?? PAGE_SIZE) + PAGE_SIZE,
                        }))
                      }
                      className="text-xs text-gray-400 hover:text-brand-600 py-2 text-center transition-colors"
                    >
                      Show {Math.min(cards.length - limit, PAGE_SIZE)} more ({cards.length - limit} remaining)
                    </button>
                  )}

                  {cards.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-300">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Inactive deals (On Hold / Too Early / Rejected) ──────────────────── */}
      <div className={cn("border border-gray-200 rounded-xl overflow-hidden", view !== "board" && "hidden")}>
        <button
          onClick={() => setShowInactive((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">
            Rejected / On Hold / Too Early
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {filteredInactive.length.toLocaleString()} deals
            </span>
            <svg
              className={cn("w-4 h-4 text-gray-400 transition-transform", showInactive && "rotate-180")}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showInactive && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-2 font-medium">Company</th>
                  <th className="px-4 py-2 font-medium">Stage</th>
                  <th className="px-4 py-2 font-medium">Vertical</th>
                  <th className="px-4 py-2 font-medium">Cycle</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInactive.slice(0, 200).map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => setSelected(deal as Deal)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-800 max-w-48 truncate">
                      {deal.company_name || deal.deal_name || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StagePill stage={deal.stage} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-36 truncate">
                      {deal.industry_vertical?.split(";")[0] || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                      {deal.investment_cycle || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-36 truncate">
                      {deal.deal_owner || deal.sourcing_analyst || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        deal.contact_status === "Reached Out"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {deal.contact_status === "Reached Out" ? "Reached out" : "Not reached"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredInactive.length > 200 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-center text-xs text-gray-400">
                      Showing 200 of {filteredInactive.length.toLocaleString()} — use filters to narrow results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail modal ───────────────────────────────────────────────────── */}
      {selected && (
        <DealDetailModal
          deal={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-gray-700 bg-white"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

const STAGE_PILL: Partial<Record<DealStage, string>> = {
  "Rejected":     "bg-red-100 text-red-600",
  "On Hold":      "bg-yellow-100 text-yellow-700",
  "Too Early":    "bg-gray-100 text-gray-500",
  "Needs Attention": "bg-orange-100 text-orange-600",
};

function StagePill({ stage }: { stage: DealStage }) {
  return (
    <span className={cn("text-xs px-1.5 py-0.5 rounded-full", STAGE_PILL[stage] ?? "bg-gray-100 text-gray-500")}>
      {stage}
    </span>
  );
}
