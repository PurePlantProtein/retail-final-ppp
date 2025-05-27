
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log('Index: Auth loaded, user exists:', !!user, 'isAdmin:', isAdmin);
      
      if (user) {
        const redirectPath = isAdmin ? '/admin' : '/products';
        console.log('Index: User authenticated, navigating to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        console.log('Index: No user, navigating to login');
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, navigate, isAdmin]);

  // Show loading while determining where to navigate
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Pure Plant Protein Wholesale</h1>
        <p className="text-xl text-gray-600 mb-4">
          {isLoading ? 'Loading...' : 'Redirecting...'}
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
