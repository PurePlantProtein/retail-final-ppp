export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leadgen: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      marketing_materials: {
        Row: {
          category: string | null
          created_at: string
          description: string
          file_type: string
          file_url: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          file_type: string
          file_url: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          file_type?: string
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_prices: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          tier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          tier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          tier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "pricing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          amino_acid_profile: Json | null
          bag_size: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          image: string | null
          ingredients: string | null
          min_quantity: number
          name: string
          number_of_servings: number | null
          nutritional_info: Json | null
          price: number
          serving_size: string | null
          stock: number
          updated_at: string
          weight: number | null
        }
        Insert: {
          amino_acid_profile?: Json | null
          bag_size?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          image?: string | null
          ingredients?: string | null
          min_quantity?: number
          name: string
          number_of_servings?: number | null
          nutritional_info?: Json | null
          price: number
          serving_size?: string | null
          stock?: number
          updated_at?: string
          weight?: number | null
        }
        Update: {
          amino_acid_profile?: Json | null
          bag_size?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          image?: string | null
          ingredients?: string | null
          min_quantity?: number
          name?: string
          number_of_servings?: number | null
          nutritional_info?: Json | null
          price?: number
          serving_size?: string | null
          stock?: number
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          business_address: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          email: string | null
          id: string
          payment_terms: number
          phone: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          id: string
          payment_terms?: number
          phone?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          payment_terms?: number
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_pricing_tiers: {
        Row: {
          created_at: string
          id: string
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pricing_tiers_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "pricing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          user_name: string
          email: string
          items: Record<string, any>[] // Adjust the shape based on your item schema
          total: number
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at: string
          updated_at: string
          payment_method: string
          shipping_address: Record<string, any> // Adjust with strict types if desired
          invoice_status: 'draft' | 'issued' | 'paid' | 'cancelled'
          shipping_option: Record<string, any> // or define ShippingOption type
        }
        Insert: {
          id?: string
          user_id?: string
          user_name?: string
          email?: string
          items: Record<string, any>[] // Required field
          total: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string
          updated_at?: string
          payment_method?: string
          shipping_address?: Record<string, any>
          invoice_status?: 'draft' | 'issued' | 'paid' | 'cancelled'
          shipping_option?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          email?: string
          items?: Record<string, any>[]
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          created_at?: string
          updated_at?: string
          payment_method?: string
          shipping_address?: Record<string, any>
          invoice_status?: 'draft' | 'issued' | 'paid' | 'cancelled'
          shipping_option?: Record<string, any>
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users" // or your auth.users if linked
            referencedColumns: ["id"]
          }
        ]
      }
      tracking_info: {
        Row: {
          id: string;
          order_id: string;
          tracking_number: string;
          carrier: string;
          tracking_url: string;
          shipped_date: string;
          estimated_delivery_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          tracking_number: string;
          carrier: string;
          tracking_url: string;
          shipped_date: string;
          estimated_delivery_date: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          tracking_number?: string;
          carrier?: string;
          tracking_url?: string;
          shipped_date?: string;
          estimated_delivery_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tracking_info_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_approved: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "distributor" | "retailer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "distributor", "retailer"],
    },
  },
} as const
