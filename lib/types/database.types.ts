// Auto-generated types for the Supabase database.
// Regenerate with: npx supabase gen types typescript --project-id pllvizrdntjbzapztxlg > lib/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "analyst";
          full_name: string | null;
          verticals: string[];
          semester: "1st" | "2nd" | "3rd" | null;
          fund_role: "recruitment_team" | "portfolio_team" | "modeling_team" | "relations_team" | "operations_team" | "chief_of_staff" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "analyst";
          full_name?: string | null;
          verticals?: string[];
          semester?: "1st" | "2nd" | "3rd" | null;
          fund_role?: "recruitment_team" | "portfolio_team" | "modeling_team" | "relations_team" | "operations_team" | "chief_of_staff" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "analyst";
          full_name?: string | null;
          verticals?: string[];
          semester?: "1st" | "2nd" | "3rd" | null;
          fund_role?: "recruitment_team" | "portfolio_team" | "modeling_team" | "relations_team" | "operations_team" | "chief_of_staff" | null;
          updated_at?: string;
        };
      };
      applicants: {
        Row: {
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
          status: "pending" | "interview" | "accepted" | "rejected";
          info_sessions: number;
          decision: "yes" | "no" | "maybe" | "no_class" | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          gpa?: number | null;
          major?: string | null;
          expected_graduation?: string | null;
          why_hillside?: string | null;
          contribution?: string | null;
          vertical_interest?: string | null;
          linkedin_url?: string | null;
          application_message?: string | null;
          resume_path?: string | null;
          status?: "pending" | "interview" | "accepted" | "rejected";
          info_sessions?: number;
          decision?: "yes" | "no" | "maybe" | "no_class" | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          gpa?: number | null;
          major?: string | null;
          expected_graduation?: string | null;
          why_hillside?: string | null;
          contribution?: string | null;
          vertical_interest?: string | null;
          linkedin_url?: string | null;
          application_message?: string | null;
          resume_path?: string | null;
          status?: "pending" | "interview" | "accepted" | "rejected";
          info_sessions?: number;
          decision?: "yes" | "no" | "maybe" | "no_class" | null;
          updated_at?: string;
        };
      };
      interview_rubrics: {
        Row: {
          id: string;
          applicant_id: string;
          template: Json;
          responses: Json;
          notes: Json;
          interviewers: Json;
          filled_by: string | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          applicant_id: string;
          template?: Json;
          responses?: Json;
          notes?: Json;
          interviewers?: Json;
          filled_by?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          template?: Json;
          responses?: Json;
          notes?: Json;
          interviewers?: Json;
          filled_by?: string | null;
          is_complete?: boolean;
          updated_at?: string;
        };
      };
      mid_semester_reports: {
        Row: {
          id: string;
          analyst_id: string;
          form_data: Json;
          submitted_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          analyst_id: string;
          form_data?: Json;
          submitted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          form_data?: Json;
          submitted_at?: string | null;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
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
          stage: string;
          tag: string | null;
          reason_for_killing: string | null;
          analysts: string | null;
          created_time: string | null;
          modified_time: string | null;
          last_activity_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          deal_name?: string | null;
          company_name?: string | null;
          deal_owner?: string | null;
          contact_name?: string | null;
          description?: string | null;
          sub_pipeline?: string | null;
          industry_vertical?: string | null;
          investment_cycle?: string | null;
          deal_source?: string | null;
          contact_status?: string | null;
          sourcing_analyst?: string | null;
          stage?: string;
          tag?: string | null;
          reason_for_killing?: string | null;
          analysts?: string | null;
          created_time?: string | null;
          modified_time?: string | null;
          last_activity_time?: string | null;
        };
        Update: {
          deal_name?: string | null;
          company_name?: string | null;
          deal_owner?: string | null;
          contact_name?: string | null;
          description?: string | null;
          sub_pipeline?: string | null;
          industry_vertical?: string | null;
          investment_cycle?: string | null;
          deal_source?: string | null;
          contact_status?: string | null;
          sourcing_analyst?: string | null;
          stage?: string;
          tag?: string | null;
          reason_for_killing?: string | null;
          analysts?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
