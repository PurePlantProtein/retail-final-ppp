
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UsersTable, { User } from '@/components/admin/UsersTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';

const UsersManagement = () => {
  const { isAdmin, user, session, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-users');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    } else if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/products');
      return;
    }
    
    fetchUsers();
  }, [user, isAdmin, navigate, toast]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // First, get all profiles from profiles table as our primary data source
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Raw profiles data:', profilesData);
      
      // Also fetch auth users if possible (will work if user has admin rights)
      let authUsersData: any[] = [];
      try {
        // This might fail due to permissions, but we'll try anyway
        const { data: authUsers, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
          console.log('Could not fetch auth users using admin API:', error);
        } else if (authUsers && authUsers.users && Array.isArray(authUsers.users)) {
          authUsersData = authUsers.users;
          console.log('Auth users data:', authUsersData);
        }
      } catch (err) {
        console.log('Could not fetch auth users, using profiles only:', err);
      }

      // Convert profiles to users format
      const users: User[] = profilesData.map(profile => {
        // Find matching auth user if available
        const matchingAuthUser = authUsersData.find(au => au.id === profile.id);
        
        // Determine role based on email - this is a temporary approach
        // In a production system, you would store roles in a database table
        const isUserAdmin = ['admin@example.com', 'myles@sparkflare.com.au'].includes(profile.email || '');
        
        return {
          id: profile.id,
          // Use the email from the profiles table, fallback to id if not available
          email: profile.email || profile.id,
          created_at: profile.created_at,
          business_name: profile.business_name || 'Unknown',
          business_type: profile.business_type || 'Not specified',
          status: 'Active',
          role: isUserAdmin ? 'admin' : 'retailer'
        };
      });
      
      console.log('Fetched users from profiles:', users);
      setUsers(users);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      toast({
        title: "Feature Coming Soon",
        description: `User role update functionality will be available in a future update.`,
      });
      
      // In a real implementation, we would update the role in the database
      // For demo purposes, we'll just update it in the frontend
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      
      toast({
        title: "Feature Coming Soon",
        description: `User status update functionality will be available in a future update.`,
      });
      
      // In a real implementation, we would update the status in the database
      // For demo purposes, we'll just update it in the frontend
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search term and active tab
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all-users') return matchesSearch;
    if (activeTab === 'retailers') return matchesSearch && user.role === 'retailer';
    if (activeTab === 'admins') return matchesSearch && user.role === 'admin';
    return matchesSearch;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button 
            onClick={() => setIsCreateUserDialogOpen(true)} 
            className="mt-4 sm:mt-0"
          >
            <Plus className="mr-1" /> Create User
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
                  <TabsTrigger value="all-users">All Users</TabsTrigger>
                  <TabsTrigger value="retailers">Retailers</TabsTrigger>
                  <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <UsersTable 
              users={filteredUsers} 
              updateUserRole={updateUserRole}
              toggleUserStatus={toggleUserStatus}
              currentUser={user}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Approval Requests</CardTitle>
            <CardDescription>
              New retailer accounts requiring approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6 text-center">
              <div>
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No pending approval requests</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New signup requests will appear here for your approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <CreateUserDialog
          isOpen={isCreateUserDialogOpen}
          onClose={() => setIsCreateUserDialogOpen(false)}
          onUserCreated={fetchUsers}
          session={session}
        />
      </div>
    </Layout>
  );
};

export default UsersManagement;
