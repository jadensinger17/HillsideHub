"use client";

import { cn } from "@/lib/utils/cn";
import type { Deal } from "@/lib/types/app.types";

const VERTICAL_COLORS: Record<string, string> = {
  "SaaS": "bg-blue-100 text-blue-700",
  "Healthcare": "bg-green-100 text-green-700",
  "Financial Innovation": "bg-yellow-100 text-yellow-700",
  "Manufacturing Technology": "bg-purple-100 text-purple-700",
  "Sustainability": "bg-emerald-100 text-emerald-700",
  "Sports and Wellness": "bg-orange-100 text-orange-700",
  "Human Development": "bg-pink-100 text-pink-700",
  "Consumer": "bg-red-100 text-red-700",
  "Consumer Products": "bg-rose-100 text-rose-700",
};

function verticalColor(vertical: string | null) {
  if (!vertical) return "bg-gray-100 text-gray-500";
  const base = vertical.split(";")[0].trim();
  return VERTICAL_COLORS[base] ?? "bg-gray-100 text-gray-600";
}

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const reachedOut = deal.contact_status === "Reached Out";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-brand-500 transition-all group"
    >
      {/* Company + deal name */}
      <div className="mb-1.5">
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1 group-hover:text-brand-600">
          {deal.company_name || deal.deal_name || "Unnamed Deal"}
        </p>
        {deal.deal_name && deal.company_name && deal.deal_name !== deal.company_name && (
          <p className="text-xs text-gray-400 line-clamp-1">{deal.deal_name}</p>
        )}
      </div>

      {/* Vertical badge */}
      {deal.industry_vertical && (
        <span
          className={cn(
            "inline-block text-xs px-1.5 py-0.5 rounded font-medium mb-2 max-w-full truncate",
            verticalColor(deal.industry_vertical)
          )}
        >
          {deal.industry_vertical.split(";")[0].trim()}
        </span>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between gap-1 mt-1">
        <span className="text-xs text-gray-400 truncate">
          {deal.deal_owner || deal.sourcing_analyst || "—"}
        </span>
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0",
            reachedOut
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {reachedOut ? "Reached out" : "Not reached"}
        </span>
      </div>

      {deal.investment_cycle && (
        <p className="text-xs text-gray-300 mt-1 truncate">{deal.investment_cycle}</p>
      )}
    </button>
  );
}
