import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserCog, ShieldCheck, ShieldX, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  email: string;
  created_at: string;
  business_name: string;
  business_type: string;
  status: string;
  role: string;
};

const UsersManagement = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-users');

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
      
      // Fetch users from auth.users through the admin API
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select('*');

      if (authError) throw authError;

      if (authUsers) {
        // Combine with user profiles if needed
        const enrichedUsers = authUsers.map(profile => ({
          id: profile.id,
          email: '', // Email is not directly accessible in profiles
          created_at: profile.created_at,
          business_name: profile.business_name || 'Unknown',
          business_type: profile.business_type || 'Not specified',
          status: 'Active', // This would need to come from auth.users
          role: profile.id === user?.id ? 'admin' : 'retailer' // For demo purposes
        }));
        setUsers(enrichedUsers);
      }
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
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
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
              
                {/* Make sure TabsContent components are inside the Tabs component */}
                <TabsContent value="all-users" className="mt-4">
                  <UsersTable 
                    users={filteredUsers} 
                    updateUserRole={updateUserRole}
                    toggleUserStatus={toggleUserStatus}
                    currentUser={user}
                  />
                </TabsContent>
                <TabsContent value="retailers" className="mt-4">
                  <UsersTable 
                    users={filteredUsers} 
                    updateUserRole={updateUserRole}
                    toggleUserStatus={toggleUserStatus}
                    currentUser={user}
                  />
                </TabsContent>
                <TabsContent value="admins" className="mt-4">
                  <UsersTable 
                    users={filteredUsers} 
                    updateUserRole={updateUserRole}
                    toggleUserStatus={toggleUserStatus}
                    currentUser={user}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : null}
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
      </div>
    </Layout>
  );
};

interface UsersTableProps {
  users: User[];
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: string) => Promise<void>;
  currentUser: any;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  updateUserRole, 
  toggleUserStatus, 
  currentUser 
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>List of users in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Business Name</TableHead>
            <TableHead>Business Type</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.business_name}</TableCell>
              <TableCell>{user.business_type || 'Not specified'}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value) => updateUserRole(user.id, value)}
                  disabled={user.id === currentUser?.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="retailer">
                      <div className="flex items-center">
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Retailer</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleUserStatus(user.id, user.status)}
                  disabled={user.id === currentUser?.id}
                >
                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersManagement;
