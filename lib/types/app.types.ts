export type Role = "admin" | "analyst";

export type Semester = "1st" | "2nd" | "3rd";

export type FundRole =
  | "recruitment_team"
  | "portfolio_team"
  | "modeling_team"
  | "relations_team"
  | "operations_team"
  | "chief_of_staff";

export type Vertical = "financial_technology" | "sustainability" | "consumer_products" | "sports_wellness";

export type ApplicantStatus = "pending" | "interview" | "deliberation" | "accepted" | "rejected";
export type ApplicantDecision = "yes" | "no" | "maybe" | "no_class";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  verticals: string[];
  semester: Semester | null;
  fund_role: FundRole | null;
  created_at: string;
  updated_at: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string | null;
  gpa: number | null;
  major: string | null;
  expected_graduation: string | null;
  why_hillside: string | null;
  contribution: string | null;
  vertical_interest: string | null;
  linkedin_url: string | null;
  application_message: string | null;
  resume_path: string | null;
  status: ApplicantStatus;
  info_sessions: number;
  decision: ApplicantDecision | null;
  deliberation_started_at: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface RubricInterviewers {
  behavioral: [string, string];
  technical: [string, string];
}

export interface InterviewRubric {
  id: string;
  applicant_id: string;
  template: RubricTemplate;
  responses: Record<string, unknown>;
  notes: Record<string, string>;
  interviewers: RubricInterviewers;
  filled_by: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface RubricSection {
  title: string;
  fields: RubricField[];
}

export interface RubricField {
  key: string;
  label: string;
  type: "rating" | "text" | "boolean";
  max?: number;
  hint?: string;
}

export interface RubricTemplate {
  sections: RubricSection[];
}

export type DealStage =
  | 'Source'
  | 'Connect'
  | 'Quick Screen'
  | 'One Pager'
  | 'Investment Memo'
  | 'Due Diligence'
  | 'Close'
  | 'In Portfolio'
  | 'On Hold'
  | 'Too Early'
  | 'Rejected'
  | 'Needs Attention';

export interface Deal {
  id: string;
  deal_name: string | null;
  company_name: string | null;
  deal_owner: string | null;
  contact_name: string | null;
  description: string | null;
  sub_pipeline: string | null;
  industry_vertical: string | null;
  investment_cycle: string | null;
  deal_source: string | null;
  contact_status: string | null;
  sourcing_analyst: string | null;
  stage: DealStage;
  tag: string | null;
  reason_for_killing: string | null;
  analysts: string | null;
  created_time: string | null;
  modified_time: string | null;
  last_activity_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface MidSemesterReport {
  id: string;
  analyst_id: string;
  form_data: Record<string, unknown>;
  submitted_at: string | null;
  updated_at: string;
  profiles?: Profile;
}
