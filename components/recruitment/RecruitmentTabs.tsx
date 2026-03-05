"use client";

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
  return (
    <Tabs.Root defaultValue="applicants">
      <Tabs.List className="bg-gray-100 rounded-xl p-1 inline-flex gap-1 mb-6">
        <Tabs.Trigger value="applicants" className={TAB_TRIGGER_CLASS}>
          Applicants
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {applicants.length}
          </span>
        </Tabs.Trigger>
        <Tabs.Trigger value="interviews" className={TAB_TRIGGER_CLASS}>
          Interviews
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {interviewApplicants.length}
          </span>
        </Tabs.Trigger>
        <Tabs.Trigger value="ai-analysis" className={TAB_TRIGGER_CLASS}>
          AI Analysis
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="applicants">
        <ApplicantsTab applicants={applicants} />
      </Tabs.Content>

      <Tabs.Content value="interviews">
        <InterviewsTab applicants={interviewApplicants} rubrics={rubrics} />
      </Tabs.Content>

      <Tabs.Content value="ai-analysis">
        <AIAnalysisTab applicants={applicants} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
