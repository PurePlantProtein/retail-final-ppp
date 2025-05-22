
import { User, Session } from '@supabase/supabase-js';

export type UserProfile = {
  id: string;
  business_name: string;
  business_address?: string;
  phone?: string;
  business_type?: string;
  email?: string;
  role: 'admin' | 'retailer';
};

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, businessName: string, businessType?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  session: Session | null;
  refreshProfile: () => Promise<void>;
};
