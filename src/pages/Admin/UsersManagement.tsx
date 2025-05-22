
import React, { useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';
import UsersTable from '@/components/admin/UsersTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import UserSearchAndFilter from '@/components/admin/users/UserSearchAndFilter';
import UserApprovalRequests from '@/components/admin/users/UserApprovalRequests';
import { useUsersManagement } from '@/hooks/useUsersManagement';

const UsersManagement = () => {
  const { isAdmin, user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    activeTab,
    setActiveTab,
    isCreateUserDialogOpen,
    setIsCreateUserDialogOpen,
    fetchUsers,
    updateUserRole,
    toggleUserStatus,
    updateUserDetails,
    deleteUser,
    getFilteredUsers
  } = useUsersManagement();

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
  }, [user, isAdmin, navigate, toast, fetchUsers]);

  const filteredUsers = getFilteredUsers();

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
            <UserSearchAndFilter 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            
            <UsersTable 
              users={filteredUsers} 
              updateUserRole={updateUserRole}
              toggleUserStatus={toggleUserStatus}
              updateUserDetails={updateUserDetails}
              deleteUser={deleteUser}
              currentUser={user}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <UserApprovalRequests />

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
