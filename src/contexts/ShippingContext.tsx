
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ShippingAddress } from '@/types/product';

type ShippingContextType = {
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress) => void;
  clearShippingAddress: () => void;
  isLoading: boolean;
};

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Load shipping address from localStorage when component mounts
  useEffect(() => {
    if (user) {
      try {
        const savedAddress = localStorage.getItem(`shipping_address_${user.id}`);
        if (savedAddress) {
          setShippingAddressState(JSON.parse(savedAddress));
        }
      } catch (error) {
        console.error('Failed to load shipping address from localStorage', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Function to update shipping address
  const setShippingAddress = (address: ShippingAddress) => {
    setShippingAddressState(address);
    
    // Save to localStorage if user is logged in
    if (user) {
      localStorage.setItem(`shipping_address_${user.id}`, JSON.stringify(address));
    }
  };

  // Function to clear shipping address
  const clearShippingAddress = () => {
    setShippingAddressState(null);
    
    // Remove from localStorage if user is logged in
    if (user) {
      localStorage.removeItem(`shipping_address_${user.id}`);
    }
  };

  return (
    <ShippingContext.Provider 
      value={{ 
        shippingAddress, 
        setShippingAddress, 
        clearShippingAddress, 
        isLoading 
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = (): ShippingContextType => {
  const context = useContext(ShippingContext);
  if (context === undefined) {
    throw new Error('useShipping must be used within a ShippingProvider');
  }
  return context;
};
