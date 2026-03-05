export type Role = "admin" | "analyst";

export type ApplicantStatus = "pending" | "interview" | "accepted" | "rejected";
export type ApplicantDecision = "yes" | "no" | "maybe" | "no_class";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
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
  submitted_at: string;
  updated_at: string;
}

export interface InterviewRubric {
  id: string;
  applicant_id: string;
  template: RubricTemplate;
  responses: Record<string, unknown>;
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
}

export interface RubricTemplate {
  sections: RubricSection[];
}

export interface MidSemesterReport {
  id: string;
  analyst_id: string;
  form_data: Record<string, unknown>;
  submitted_at: string | null;
  updated_at: string;
  profiles?: Profile;
}
