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
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by_user_id: string | null;
          created_at: string;
          current_period_end: string;
          current_period_start: string;
          features_override: Json;
          id: string;
          module_overrides: Json;
          organization_id: string;
          override_max_admin_seats: number | null;
          override_max_attendance_sessions: number | null;
          override_max_member_seats: number | null;
          override_max_people: number | null;
          plan: string;
          plan_key: string;
          provider: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by_user_id?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          features_override?: Json;
          id?: string;
          module_overrides?: Json;
          organization_id: string;
          override_max_admin_seats?: number | null;
          override_max_attendance_sessions?: number | null;
          override_max_member_seats?: number | null;
          override_max_people?: number | null;
          plan?: string;
          plan_key?: string;
          provider?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by_user_id?: string | null;
          created_at?: string;
          current_period_end?: string;
          current_period_start?: string;
          features_override?: Json;
          id?: string;
          module_overrides?: Json;
          organization_id?: string;
          override_max_admin_seats?: number | null;
          override_max_attendance_sessions?: number | null;
          override_max_member_seats?: number | null;
          override_max_people?: number | null;
          plan?: string;
          plan_key?: string;
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
          {
            foreignKeyName: "subscriptions_plan_key_fkey";
            columns: ["plan_key"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["key"];
          },
        ];
      };
      subscription_plans: {
        Row: {
          created_at: string;
          features: Json;
          id: string;
          is_active: boolean;
          key: string;
          max_admin_seats: number;
          max_attendance_sessions: number;
          max_member_seats: number;
          max_people: number;
          modules: Json;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          key: string;
          max_admin_seats?: number;
          max_attendance_sessions?: number;
          max_member_seats?: number;
          max_people?: number;
          modules?: Json;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          key?: string;
          max_admin_seats?: number;
          max_attendance_sessions?: number;
          max_member_seats?: number;
          max_people?: number;
          modules?: Json;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      church_monthly_themes: {
        Row: {
          content: string;
          created_at: string;
          description: string;
          id: string;
          month: number;
          organization_id: string;
          title: string;
          updated_at: string;
          year: number;
        };
        Insert: {
          content?: string;
          created_at?: string;
          description?: string;
          id?: string;
          month: number;
          organization_id: string;
          title?: string;
          updated_at?: string;
          year: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          description?: string;
          id?: string;
          month?: number;
          organization_id?: string;
          title?: string;
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "church_monthly_themes_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      church_yearly_goal_objectives: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          is_completed: boolean;
          sort_order: number;
          text: string;
          yearly_goal_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          sort_order?: number;
          text: string;
          yearly_goal_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          sort_order?: number;
          text?: string;
          yearly_goal_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "church_yearly_goal_objectives_yearly_goal_id_fkey";
            columns: ["yearly_goal_id"];
            isOneToOne: false;
            referencedRelation: "church_yearly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      church_yearly_goal_retrospective_items: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          sort_order: number;
          text: string;
          yearly_goal_id: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          text: string;
          yearly_goal_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          sort_order?: number;
          text?: string;
          yearly_goal_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "church_yearly_goal_retrospective_items_yearly_goal_id_fkey";
            columns: ["yearly_goal_id"];
            isOneToOne: false;
            referencedRelation: "church_yearly_goals";
            referencedColumns: ["id"];
          },
        ];
      };
      church_yearly_goals: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          organization_id: string;
          theme: string;
          title: string;
          updated_at: string;
          vision: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          organization_id: string;
          theme?: string;
          title?: string;
          updated_at?: string;
          vision?: string;
          year: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          organization_id?: string;
          theme?: string;
          title?: string;
          updated_at?: string;
          vision?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: "church_yearly_goals_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
          organization_id: string;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          organization_id: string;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
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
      get_org_entitlements: { Args: { p_org_id: string }; Returns: Json };
      is_org_admin: { Args: { org_id: string }; Returns: boolean };
      is_org_member: { Args: { org_id: string }; Returns: boolean };
      setup_organization: {
        Args: { org_name: string; org_slug?: string };
        Returns: string;
      };
      cancel_organization_subscription: {
        Args: { p_organization_id: string; p_reason: string };
        Returns: undefined;
      };
      upgrade_organization_subscription: {
        Args: { p_organization_id: string; p_plan_key: string };
        Returns: undefined;
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
