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
          business_address: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          business_address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_materials: {
        Row: {
          id: string
          title: string
          description: string
          file_url: string
          file_type: string
          created_at: string
          updated_at: string
          category: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          file_url: string
          file_type: string
          created_at?: string
          updated_at?: string
          category?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          file_url?: string
          file_type?: string
          created_at?: string
          updated_at?: string
          category?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    : never,
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
    Enums: {},
  },
} as const

export type Category = {
  id: string;
  name: string;
};

export interface AminoAcid {
  name: string;
  amount: string;
}

export interface NutritionalValue {
  name: string;
  perServing: string;
  per100g: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  description: string;
  estimatedDeliveryDays: number;
  carrier: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
  shippedDate?: string;
  estimatedDeliveryDate?: string;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  stock: number;
  image: string | null;
  category: Category | null;
  sku?: string | null;
  weight?: number | null;
  bagSize?: string | null;
  numberOfServings?: number | null;
  servingSize?: string | null;
  ingredients?: string | null;
  aminoAcidProfile?: AminoAcid[] | null;
  nutritionalInfo?: NutritionalValue[] | null;
  created_at?: string;
  updated_at?: string;
}

// Define a separate type to differentiate categories from products
export interface CategoryDisplay {
  id: string;
  name: string;
  description: string;
  image: string | null;
  isCategory: true; // Flag to identify as a category
}

export interface OrderItem {
  product: Product;
  quantity: number;
  // Optional manual line price used by admin-created or manually-updated orders
  // kept in snake_case to match server payloads
  unit_price?: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  notes?: string;
  invoiceUrl?: string;
  invoiceStatus?: InvoiceStatus;
  shippingOption?: ShippingOption;
  trackingInfo?: TrackingInfo;
  updatedAt: string; // Adding updatedAt as it's used in multiple places
}

export interface MarketingMaterial {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
