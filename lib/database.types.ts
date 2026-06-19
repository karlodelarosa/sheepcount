export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          address: string | null;
          created_at: string;
          id: string;
          image: string | null;
          name: string;
          phone: string | null;
          plan: string;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
          name: string;
          phone?: string | null;
          plan?: string;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          id?: string;
          image?: string | null;
          name?: string;
          phone?: string | null;
          plan?: string;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          first_name?: string;
          id: string;
          last_name?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      discipleship_enrollments: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_module: string;
          enrolled_date: string;
          id: string;
          mentor_person_id: string | null;
          person_id: string;
          role: string;
          status: string;
          track_id: string;
          updated_at: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_module?: string;
          enrolled_date?: string;
          id?: string;
          mentor_person_id?: string | null;
          person_id: string;
          role?: string;
          status?: string;
          track_id: string;
          updated_at?: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_module?: string;
          enrolled_date?: string;
          id?: string;
          mentor_person_id?: string | null;
          person_id?: string;
          role?: string;
          status?: string;
          track_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      discipleship_milestone_completions: {
        Row: {
          completed_at: string;
          completed_by_person_id: string | null;
          created_at: string;
          enrollment_id: string;
          id: string;
          milestone_id: string;
          notes: string;
        };
        Insert: {
          completed_at?: string;
          completed_by_person_id?: string | null;
          created_at?: string;
          enrollment_id: string;
          id?: string;
          milestone_id: string;
          notes?: string;
        };
        Update: {
          completed_at?: string;
          completed_by_person_id?: string | null;
          created_at?: string;
          enrollment_id?: string;
          id?: string;
          milestone_id?: string;
          notes?: string;
        };
        Relationships: [];
      };
      discipleship_milestones: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          sort_order: number;
          track_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          sort_order?: number;
          track_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          track_id?: string;
        };
        Relationships: [];
      };
      discipleship_tracks: {
        Row: {
          category: string;
          color: string;
          created_at: string;
          description: string;
          duration: string;
          id: string;
          is_active: boolean;
          is_default: boolean;
          leader_person_id: string | null;
          name: string;
          organization_id: string;
          schedule: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          color?: string;
          created_at?: string;
          description?: string;
          duration?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          leader_person_id?: string | null;
          name: string;
          organization_id: string;
          schedule?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          color?: string;
          created_at?: string;
          description?: string;
          duration?: string;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          leader_person_id?: string | null;
          name?: string;
          organization_id?: string;
          schedule?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          id: string;
          organization_id: string;
          plan: string;
          provider: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          organization_id: string;
          plan?: string;
          provider?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          organization_id?: string;
          plan?: string;
          provider?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_org_admin: { Args: { org_id: string }; Returns: boolean };
      is_org_member: { Args: { org_id: string }; Returns: boolean };
      setup_organization: {
        Args: { org_name: string; org_slug?: string };
        Returns: string;
      };
      seed_default_discipleship_tracks: {
        Args: { org_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
