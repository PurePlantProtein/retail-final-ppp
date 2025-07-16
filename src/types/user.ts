
import { AppRole } from '@/types/auth';

export interface User {
  id: string;
  email: string;
  created_at: string;
  business_name: string;
  business_type: string;
  status: string;
  role: string;
  roles: AppRole[]; // Made required
  business_address?: string;
  phone?: string;
  payment_terms?: number;
  pricing_tier_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
}

export interface BusinessType {
  id: string;
  name: string;
}
