"use client";

import { useState, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ApplicantsTab } from "@/components/recruitment/ApplicantsTab";
import { InterviewsTab } from "@/components/recruitment/InterviewsTab";
import { AIAnalysisTab } from "@/components/recruitment/AIAnalysisTab";
import { cn } from "@/lib/utils/cn";
import type { Applicant, InterviewRubric } from "@/lib/types/app.types";

interface Props {
  applicants: Applicant[];
  interviewApplicants: Applicant[];
  rubrics: InterviewRubric[];
}

const TAB_TRIGGER_CLASS = cn(
  "px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  "data-[state=active]:bg-white data-[state=active]:text-brand-600 data-[state=active]:shadow-sm"
);

export function RecruitmentTabs({ applicants, interviewApplicants, rubrics }: Props) {
  const [gradFilter, setGradFilter] = useState("all");
  const [verticalFilter, setVerticalFilter] = useState("all");

  // Derive unique filter options from the full applicant list
  const gradOptions = useMemo(() => {
    const vals = [...new Set(
      applicants.map((a) => a.expected_graduation).filter(Boolean)
    )].sort() as string[];
    return vals;
  }, [applicants]);

  const verticalOptions = useMemo(() => {
    const vals = [...new Set(
      applicants.map((a) => a.vertical_interest).filter(Boolean)
    )].sort() as string[];
    return vals;
  }, [applicants]);

  const hasFilter = gradFilter !== "all" || verticalFilter !== "all";

  function applyFilters(list: Applicant[]) {
    return list.filter((a) => {
      if (gradFilter !== "all" && a.expected_graduation !== gradFilter) return false;
      if (verticalFilter !== "all" && a.vertical_interest !== verticalFilter) return false;
      return true;
    });
  }

  const filteredApplicants = useMemo(() => applyFilters(applicants), [applicants, gradFilter, verticalFilter]);
  const filteredInterviewApplicants = useMemo(() => applyFilters(interviewApplicants), [interviewApplicants, gradFilter, verticalFilter]);

  // Only pass rubrics for the visible interview candidates
  const filteredInterviewIds = new Set(filteredInterviewApplicants.map((a) => a.id));
  const filteredRubrics = rubrics.filter((r) => filteredInterviewIds.has(r.applicant_id));

  return (
    <Tabs.Root defaultValue="applicants">
      {/* Tab bar + global filters — sticky below the navbar (h-16 = top-16) */}
      <div className="sticky top-16 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center gap-3">
        <Tabs.List className="bg-gray-100 rounded-xl p-1 inline-flex gap-1">
          <Tabs.Trigger value="applicants" className={TAB_TRIGGER_CLASS}>
            Applicants
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {filteredApplicants.length}
            </span>
          </Tabs.Trigger>
          <Tabs.Trigger value="interviews" className={TAB_TRIGGER_CLASS}>
            Interviews
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {filteredInterviewApplicants.length}
            </span>
          </Tabs.Trigger>
          <Tabs.Trigger value="ai-analysis" className={TAB_TRIGGER_CLASS}>
            Analysis
          </Tabs.Trigger>
        </Tabs.List>

        {/* Global filters */}
        <div className="flex items-center gap-2 ml-2">
          <select
            value={gradFilter}
            onChange={(e) => setGradFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All classes</option>
            {gradOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={verticalFilter}
            onChange={(e) => setVerticalFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All verticals</option>
            {verticalOptions.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          {hasFilter && (
            <button
              onClick={() => { setGradFilter("all"); setVerticalFilter("all"); }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <Tabs.Content value="applicants">
        <ApplicantsTab applicants={filteredApplicants} />
      </Tabs.Content>

      <Tabs.Content value="interviews">
        <InterviewsTab applicants={filteredInterviewApplicants} rubrics={filteredRubrics} />
      </Tabs.Content>

      <Tabs.Content value="ai-analysis">
        <AIAnalysisTab
          applicants={filteredApplicants}
          interviewApplicants={filteredInterviewApplicants}
          rubrics={filteredRubrics}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
