
// This file now simply re-exports from the AuthProvider to avoid circular dependencies
export { AuthProvider, useAuth } from '@/providers/AuthProvider';
export type { AuthContextType, UserProfile } from '@/types/auth';
