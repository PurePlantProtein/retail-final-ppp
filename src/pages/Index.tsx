
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          console.log('Index: User authenticated, navigating to products');
          navigate('/products', { replace: true });
        } else {
          console.log('Index: No user, navigating to login');
          navigate('/login', { replace: true });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isLoading, navigate, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Pure Plant Protein Wholesale</h1>
          <p className="text-xl text-gray-600">Loading...</p>
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Pure Plant Protein Wholesale</h1>
        <p className="text-xl text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
