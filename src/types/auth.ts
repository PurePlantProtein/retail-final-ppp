
import { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'distributor' | 'retailer';

export type UserProfile = {
  id: string;
  business_name: string;
  business_address?: string;
  phone?: string;
  business_type?: string;
  email?: string;
  payment_terms?: number;
};

export type UserWithRoles = UserProfile & {
  roles: AppRole[];
};

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, businessName: string, businessType?: string, phone?:string, businessAddress?:string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isDistributor: boolean;
  isRetailer: boolean;
  hasRole: (role: AppRole) => boolean;
  roles: AppRole[];
  session: Session | null;
  refreshProfile: () => Promise<void>;
};
