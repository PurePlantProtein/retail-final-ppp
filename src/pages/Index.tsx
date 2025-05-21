
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to products page if authenticated, otherwise to login
    if (user) {
      navigate('/products');
    } else {
      navigate('/login');
    }
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to PP Protein Wholesale</h1>
        <p className="text-xl text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
