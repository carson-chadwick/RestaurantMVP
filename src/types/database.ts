export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      account_roles: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role: Database["public"]["Enums"]["account_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database["public"]["Enums"]["account_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      customer_profiles: {
        Row: {
          created_at: string;
          first_name: string;
          identity_disclosure_acknowledged_at: string;
          last_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          first_name: string;
          identity_disclosure_acknowledged_at: string;
          last_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          first_name?: string;
          identity_disclosure_acknowledged_at?: string;
          last_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      customer_ratings: {
        Row: {
          customer_user_id: string;
          rated_by_staff_user_id: string;
          restaurant_id: string;
          stars: number;
          submitted_at: string;
          visit_id: string;
        };
        Insert: {
          customer_user_id: string;
          rated_by_staff_user_id: string;
          restaurant_id: string;
          stars: number;
          submitted_at?: string;
          visit_id: string;
        };
        Update: {
          customer_user_id?: string;
          rated_by_staff_user_id?: string;
          restaurant_id?: string;
          stars?: number;
          submitted_at?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customer_ratings_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customer_ratings_visit_relationship";
            columns: ["visit_id", "customer_user_id", "restaurant_id"];
            isOneToOne: false;
            referencedRelation: "paid_visits";
            referencedColumns: ["id", "customer_user_id", "restaurant_id"];
          },
        ];
      };
      paid_visits: {
        Row: {
          customer_user_id: string;
          id: string;
          recorded_at: string;
          recorded_by_staff_user_id: string;
          restaurant_id: string;
        };
        Insert: {
          customer_user_id: string;
          id?: string;
          recorded_at?: string;
          recorded_by_staff_user_id: string;
          restaurant_id: string;
        };
        Update: {
          customer_user_id?: string;
          id?: string;
          recorded_at?: string;
          recorded_by_staff_user_id?: string;
          restaurant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "paid_visits_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_employees: {
        Row: {
          created_at: string;
          employee_user_id: string;
          restaurant_id: string;
        };
        Insert: {
          created_at?: string;
          employee_user_id: string;
          restaurant_id: string;
        };
        Update: {
          created_at?: string;
          employee_user_id?: string;
          restaurant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_employees_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_ratings: {
        Row: {
          customer_user_id: string;
          restaurant_id: string;
          stars: number;
          submitted_at: string;
          visit_id: string;
        };
        Insert: {
          customer_user_id: string;
          restaurant_id: string;
          stars: number;
          submitted_at?: string;
          visit_id: string;
        };
        Update: {
          customer_user_id?: string;
          restaurant_id?: string;
          stars?: number;
          submitted_at?: string;
          visit_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_ratings_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_ratings_visit_relationship";
            columns: ["visit_id", "customer_user_id", "restaurant_id"];
            isOneToOne: false;
            referencedRelation: "paid_visits";
            referencedColumns: ["id", "customer_user_id", "restaurant_id"];
          },
        ];
      };
      restaurants: {
        Row: {
          address: string | null;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          owner_user_id: string;
          phone: string | null;
          updated_at: string;
          weekly_hours: Json | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_user_id: string;
          phone?: string | null;
          updated_at?: string;
          weekly_hours?: Json | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_user_id?: string;
          phone?: string | null;
          updated_at?: string;
          weekly_hours?: Json | null;
        };
        Relationships: [];
      };
      staff_profiles: {
        Row: {
          created_at: string;
          first_name: string;
          last_name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          first_name: string;
          last_name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          first_name?: string;
          last_name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_access_restaurant: {
        Args: { target_restaurant_id: string };
        Returns: boolean;
      };
      can_manage_employee: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
      current_staff_restaurant_id: { Args: never; Returns: string };
      get_customer_rating_summary: {
        Args: never;
        Returns: {
          average_rating: number;
          rating_count: number;
        }[];
      };
      get_public_restaurant: {
        Args: { target_restaurant_id: string };
        Returns: {
          address: string;
          average_rating: number;
          description: string;
          id: string;
          name: string;
          phone: string;
          rating_count: number;
          weekly_hours: Json;
        }[];
      };
      grant_restaurant_employee_access: {
        Args: { employee_email: string };
        Returns: undefined;
      };
      is_valid_weekly_hours: { Args: { value: Json }; Returns: boolean };
      list_customer_rating_history: {
        Args: never;
        Returns: {
          recorded_at: string;
          restaurant_id: string;
          restaurant_name: string;
          stars: number;
          submitted_at: string;
          visit_id: string;
        }[];
      };
      list_customer_restaurant_visits: {
        Args: never;
        Returns: {
          recorded_at: string;
          restaurant_id: string;
          restaurant_name: string;
          stars: number;
          submitted_at: string;
          visit_id: string;
        }[];
      };
      list_customers_for_visit: {
        Args: {
          result_limit?: number;
          result_offset?: number;
          search_first_name?: string;
          search_last_name?: string;
        };
        Returns: {
          average_rating: number;
          email: string;
          first_name: string;
          last_name: string;
          rating_count: number;
          total_count: number;
          user_id: string;
        }[];
      };
      list_public_restaurants: {
        Args: {
          result_limit?: number;
          result_offset?: number;
          search_text?: string;
        };
        Returns: {
          address: string;
          average_rating: number;
          description: string;
          id: string;
          name: string;
          phone: string;
          rating_count: number;
          total_count: number;
          weekly_hours: Json;
        }[];
      };
      list_restaurant_employees: {
        Args: never;
        Returns: {
          email: string;
          first_name: string;
          last_name: string;
          user_id: string;
        }[];
      };
      list_staff_customer_rating_queue: {
        Args: { result_limit?: number; result_offset?: number };
        Returns: {
          average_rating: number;
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_user_id: string;
          rating_count: number;
          recorded_at: string;
          total_count: number;
          visit_id: string;
        }[];
      };
      list_staff_recent_visits: {
        Args: never;
        Returns: {
          customer_email: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_user_id: string;
          is_rated: boolean;
          rating_status: string;
          recorded_at: string;
          visit_id: string;
        }[];
      };
      record_paid_visit: {
        Args: { target_customer_user_id: string };
        Returns: string;
      };
      revoke_restaurant_employee_access: {
        Args: { target_employee_id: string };
        Returns: undefined;
      };
      submit_customer_rating: {
        Args: { rating_stars: number; target_visit_id: string };
        Returns: string;
      };
      submit_restaurant_rating: {
        Args: { rating_stars: number; target_visit_id: string };
        Returns: string;
      };
    };
    Enums: {
      account_role: "customer" | "restaurant_owner" | "restaurant_employee";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_role: ["customer", "restaurant_owner", "restaurant_employee"],
    },
  },
} as const;
