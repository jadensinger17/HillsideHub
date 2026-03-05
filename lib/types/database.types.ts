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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "analyst";
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "analyst";
          full_name?: string | null;
          updated_at?: string;
        };
      };
      applicants: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          gpa: number;
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
          gpa?: number;
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
          gpa?: number;
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
          filled_by?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          template?: Json;
          responses?: Json;
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
