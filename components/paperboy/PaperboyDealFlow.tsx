"use client";

import { useState, useMemo } from "react";
import type { AirtableRecord } from "@/lib/utils/airtable";
import CompanyDetailPanel from "@/components/paperboy/CompanyDetailPanel";

interface Props {
  companies: AirtableRecord[];
  columns: string[];
  generatedPdfIds: string[];
}

// How many columns to show in the table (rest visible in detail panel)
const TABLE_COLUMN_LIMIT = 6;

function getCompanyName(fields: Record<string, unknown>): string {
  for (const key of ["Company", "Name", "Company Name", "name", "company"]) {
    if (fields[key] && typeof fields[key] === "string") return fields[key] as string;
  }
  return "Company";
}

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function PaperboyDealFlow({ companies, columns, generatedPdfIds }: Props) {
  const generatedPdfs = useMemo(() => new Set(generatedPdfIds), [generatedPdfIds]);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>("Priority");
  const [sortAsc, setSortAsc] = useState(false); // descending by default
  const [selected, setSelected] = useState<AirtableRecord | null>(null);

  const visibleColumns = columns.slice(0, TABLE_COLUMN_LIMIT);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter((c) =>
      Object.values(c.fields).some((v) =>
        cellValue(v).toLowerCase().includes(q)
      )
    );
  }, [companies, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = cellValue(a.fields[sortCol]);
      const bv = cellValue(b.fields[sortCol]);
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortCol, sortAsc]);

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortAsc((prev) => !prev);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paperboy Deal Flow</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companies.length} companies · Paperboy Ventures portfolio
          </p>
        </div>
        <input
          type="search"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
                  >
                    {col}
                    {sortCol === col && (
                      <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  One-Pager
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 2}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No companies found.
                  </td>
                </tr>
              ) : (
                sorted.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setSelected(company)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {visibleColumns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 text-gray-700 max-w-[200px] truncate"
                        title={cellValue(company.fields[col])}
                      >
                        {cellValue(company.fields[col])}
                      </td>
                    ))}
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {generatedPdfs.has(company.id) ? (
                        <a
                          href={`/api/paperboy-pdf/${company.id}?name=${encodeURIComponent(getCompanyName(company.fields))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                        >
                          ↓ PDF
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-right">→</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <CompanyDetailPanel
          company={selected}
          columns={columns}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
