
import { UserProfile } from '@/types/auth';

// Mock data for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'retailer@example.com',
    created_at: new Date().toISOString(),
    business_name: 'Demo Retail Business',
    business_type: 'Health Store',
    business_address: '123 Demo St, Example City',
    phone: '555-123-4567',
    payment_terms: 14,
    status: 'Active',
    role: 'retailer'
  },
  {
    id: '2',
    email: 'admin@example.com',
    created_at: new Date().toISOString(),
    business_name: 'Admin Account',
    business_type: 'Administrator',
    business_address: 'Admin HQ',
    phone: '555-987-6543',
    payment_terms: 30,
    status: 'Active',
    role: 'admin'
  }
];

/**
 * Fetch all users
 */
export const fetchUsers = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real application, this would call an API endpoint
  return mockUsers;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, newRole: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`Updating user ${userId} role to ${newRole}`);
  
  // In a real application, this would call an API endpoint
  return {
    success: true,
    message: `User role updated to ${newRole}`
  };
};

/**
 * Toggle user status (active/inactive)
 */
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newStatus = isActive ? 'Active' : 'Inactive';
  console.log(`Setting user ${userId} status to ${newStatus}`);
  
  // In a real application, this would call an API endpoint
  return {
    success: true,
    status: newStatus
  };
};

/**
 * Update user details
 */
export const updateUserDetails = async (userId: string, userData: Partial<UserProfile>) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`Updating user ${userId} details:`, userData);
  
  // In a real application, this would call an API endpoint
  return {
    success: true,
    message: "User details updated successfully"
  };
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`Deleting user ${userId}`);
  
  // In a real application, this would call an API endpoint
  return {
    success: true,
    message: "User deleted successfully"
  };
};
