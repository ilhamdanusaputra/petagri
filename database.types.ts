export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          created_at: string | null
          driver_code: string
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string | null
          vehicle_plate_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          driver_code: string
          id: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          vehicle_plate_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          driver_code?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
          vehicle_plate_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_ha: number
          commodity: string
          created_at: string
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area_ha: number
          commodity: string
          created_at?: string
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area_ha?: number
          commodity?: string
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mitra_toko: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          handphone: string | null
          id: string
          name: string
          owner_name: string | null
          province: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          handphone?: string | null
          id: string
          name: string
          owner_name?: string | null
          province?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          handphone?: string | null
          id?: string
          name?: string
          owner_name?: string | null
          province?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mitra_toko_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mitra_toko_id_fkey1"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          brand: string | null
          category: string | null
          created_at: string | null
          description: string | null
          dosage: string | null
          id: string
          mitra_id: string
          name: string
          note: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dosage?: string | null
          id?: string
          mitra_id: string
          name: string
          note?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dosage?: string | null
          id?: string
          mitra_id?: string
          name?: string
          note?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_mitra_id_fkey"
            columns: ["mitra_id"]
            isOneToOne: false
            referencedRelation: "mitra_toko"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          roles: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          roles?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          roles?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tender_approve_products: {
        Row: {
          created_at: string | null
          id: string
          tender_approve_id: string
          tender_offering_product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tender_approve_id: string
          tender_offering_product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tender_approve_id?: string
          tender_offering_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_approve_product_approve"
            columns: ["tender_approve_id"]
            isOneToOne: false
            referencedRelation: "tender_approves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tender_approve_product_offering_product"
            columns: ["tender_offering_product_id"]
            isOneToOne: false
            referencedRelation: "tender_offerings_products"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_approves: {
        Row: {
          created_at: string | null
          id: string
          tender_offering_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tender_offering_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tender_offering_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_approves_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "tender_assigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_approves_tender_offering_id_fkey"
            columns: ["tender_offering_id"]
            isOneToOne: false
            referencedRelation: "tender_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_assign_products: {
        Row: {
          created_at: string | null
          dosage: string | null
          id: string
          note: string | null
          price: number | null
          product_name: string
          qty: number
          tender_assign_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          note?: string | null
          price?: number | null
          product_name: string
          qty?: number
          tender_assign_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          note?: string | null
          price?: number | null
          product_name?: string
          qty?: number
          tender_assign_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_assign_product_assign"
            columns: ["tender_assign_id"]
            isOneToOne: false
            referencedRelation: "tender_assigns"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_assigns: {
        Row: {
          assigned_by: string
          created_at: string | null
          deadline: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["tender_assign_status"]
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          assigned_by: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["tender_assign_status"]
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          assigned_by?: string
          created_at?: string | null
          deadline?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["tender_assign_status"]
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_assign_visit"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_assigns_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_offerings: {
        Row: {
          created_at: string | null
          id: string
          offered_by: string
          tender_assign_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          offered_by: string
          tender_assign_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          offered_by?: string
          tender_assign_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_offering_assign"
            columns: ["tender_assign_id"]
            isOneToOne: false
            referencedRelation: "tender_assigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tender_offering_user"
            columns: ["offered_by"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_offerings_products: {
        Row: {
          created_at: string | null
          dosage: string | null
          id: string
          note: string | null
          price: number
          product_name: string
          qty: number
          tender_offering_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          note?: string | null
          price: number
          product_name: string
          qty?: number
          tender_offering_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          id?: string
          note?: string | null
          price?: number
          product_name?: string
          qty?: number
          tender_offering_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_offering_product_offering"
            columns: ["tender_offering_id"]
            isOneToOne: false
            referencedRelation: "tender_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_recommendations: {
        Row: {
          alternative_products: string | null
          created_at: string | null
          dosage: string
          estimated_qty: string
          function: string
          id: string
          product_name: string
          urgency: string
          visit_report_id: string | null
        }
        Insert: {
          alternative_products?: string | null
          created_at?: string | null
          dosage: string
          estimated_qty: string
          function: string
          id?: string
          product_name: string
          urgency: string
          visit_report_id?: string | null
        }
        Update: {
          alternative_products?: string | null
          created_at?: string | null
          dosage?: string
          estimated_qty?: string
          function?: string
          id?: string
          product_name?: string
          urgency?: string
          visit_report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_recommendations_visit_report_id_fkey"
            columns: ["visit_report_id"]
            isOneToOne: false
            referencedRelation: "visit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_reports: {
        Row: {
          created_at: string | null
          field_photo_url: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          land_area: number
          plant_age: string
          plant_type: string
          problems: string
          visit_id: string | null
          weather_notes: string | null
        }
        Insert: {
          created_at?: string | null
          field_photo_url?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          land_area: number
          plant_age: string
          plant_type: string
          problems: string
          visit_id?: string | null
          weather_notes?: string | null
        }
        Update: {
          created_at?: string | null
          field_photo_url?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          land_area?: number
          plant_age?: string
          plant_type?: string
          problems?: string
          visit_id?: string | null
          weather_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visit_reports_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          consultant_id: string | null
          created_at: string | null
          farm_id: string | null
          id: string
          scheduled_date: string
          status: string
        }
        Insert: {
          consultant_id?: string | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          scheduled_date: string
          status: string
        }
        Update: {
          consultant_id?: string | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          scheduled_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          roles: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bid_status: "draft" | "submitted" | "withdrawn" | "accepted" | "rejected"
      tender_assign_status: "open" | "closed" | "draft"
      tender_status:
        | "draft"
        | "open"
        | "closed"
        | "locked"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bid_status: ["draft", "submitted", "withdrawn", "accepted", "rejected"],
      tender_assign_status: ["open", "closed", "draft"],
      tender_status: [
        "draft",
        "open",
        "closed",
        "locked",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
