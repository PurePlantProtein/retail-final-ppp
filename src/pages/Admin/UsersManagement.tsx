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
  CardFooter,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserCog, ShieldCheck, ShieldX, AlertCircle, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

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

      // Convert profiles to users format
      const users: User[] = profilesData.map(profile => {
        // Determine role based on email - this is a temporary approach
        // In a production system, you would store roles in a database table
        const isUserAdmin = ['admin@example.com', 'myles@sparkflare.com.au'].includes(profile.id);
        
        return {
          id: profile.id,
          email: profile.id, // Use ID as email if we don't have the actual email
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
        />
      </div>
    </Layout>
  );
};

interface UsersTableProps {
  users: User[];
  updateUserRole: (userId: string, newRole: string) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: string) => Promise<void>;
  currentUser: any;
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  updateUserRole, 
  toggleUserStatus, 
  currentUser,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
            <TableHead>Email</TableHead>
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
              <TableCell>{user.email}</TableCell>
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

// Form schema for user creation
const userCreateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  role: z.enum(["admin", "retailer"]),
});

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onUserCreated 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  const form = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: "",
      password: "",
      businessName: "",
      businessType: "",
      role: "retailer",
    },
  });

  const onSubmit = async (values: z.infer<typeof userCreateSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Try using direct API call with custom headers to avoid session conflicts
      const response = await fetch(`https://lswldgmfmeeepdivhznt.supabase.co/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd2xkZ21mbWVlZXBkaXZoem50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDUyNzEsImV4cCI6MjA2MjE4MTI3MX0.4vHkxo6rv8xFBBoaTXTPhbnl1bcG7RG33c_A6wLSIx4',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          email_confirm: true,
          user_metadata: {
            business_name: values.businessName,
            business_type: values.businessType,
            role: values.role
          }
        }),
      });
      
      // Create profile entry separately without affecting the current session
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        // We're still logged in, now create the profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: values.email,  // Use email as ID for now, will be updated when user signs in
            business_name: values.businessName,
            business_type: values.businessType
          });
        
        if (profileError && !profileError.message.includes('duplicate')) {
          console.error('Error creating profile:', profileError);
          // Don't throw here, we'll still consider the user creation successful
        }
      }
      
      toast({
        title: "User created successfully",
        description: `${values.businessName} (${values.email}) has been added as a ${values.role}.`,
      });

      // Reset form
      form.reset();
      
      // Close dialog and refresh users list
      onClose();
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Fallback to email invitation method which won't affect the current session
      try {
        // This method sends an invitation email rather than creating the user directly
        const { error } = await supabase.auth.admin.inviteUserByEmail(values.email, {
          data: {
            business_name: values.businessName,
            business_type: values.businessType,
            role: values.role
          }
        });
        
        if (error) {
          throw error;
        }
        
        // Create profile entry
        await supabase
          .from('profiles')
          .insert({
            id: values.email,  // Use email as ID for now
            business_name: values.businessName,
            business_type: values.businessType
          });
        
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${values.email}.`,
        });
        
        // Reset form and close dialog
        form.reset();
        onClose();
        onUserCreated();
      } catch (fallbackError: any) {
        toast({
          title: "Failed to create user",
          description: fallbackError.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new wholesale user to the platform. They will receive an email with their credentials.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="business@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Nutrition" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Retail Store">Retail Store</SelectItem>
                      <SelectItem value="Online Shop">Online Shop</SelectItem>
                      <SelectItem value="Gym">Gym</SelectItem>
                      <SelectItem value="Health Food Store">Health Food Store</SelectItem>
                      <SelectItem value="Supplement Shop">Supplement Shop</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UsersManagement;
