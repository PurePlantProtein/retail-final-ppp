
import React, { useEffect, useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import UsersTable from '@/components/admin/UsersTable';
import CreateUserDialog from '@/components/admin/CreateUserDialog';
import UserSearchAndFilter from '@/components/admin/users/UserSearchAndFilter';
import UserApprovalRequests from '@/components/admin/users/UserApprovalRequests';
import { useUsersManagement } from '@/hooks/useUsersManagement';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UsersManagement = () => {
  const { isAdmin, user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDeleteTestUsersDialogOpen, setIsDeleteTestUsersDialogOpen] = useState(false);
  
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
    deleteTestUsers,
    getFilteredUsers,
    users
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
    
    fetchUsers().catch(error => {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Using placeholder data instead.",
        variant: "destructive",
      });
    });
  }, [user, isAdmin, navigate, toast, fetchUsers]);

  const handleDeleteTestUsers = () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Your email is not available. Cannot proceed with deletion.",
        variant: "destructive",
      });
      return;
    }
    
    deleteTestUsers(user.email);
    setIsDeleteTestUsersDialogOpen(false);
  };

  const filteredUsers = getFilteredUsers();

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 text-left">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button 
              onClick={() => setIsCreateUserDialogOpen(true)} 
              className="flex items-center"
            >
              <Plus className="mr-1" /> Create User
            </Button>
            <Button
              variant="outline"
              className="flex items-center text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setIsDeleteTestUsersDialogOpen(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete Test Users
            </Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader className="text-left">
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

        {/* Delete Test Users Dialog */}
        <AlertDialog 
          open={isDeleteTestUsersDialogOpen} 
          onOpenChange={setIsDeleteTestUsersDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Test Users</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete all users except your account ({user?.email}). 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTestUsers}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete Test Users
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default UsersManagement;
