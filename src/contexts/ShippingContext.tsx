import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ShippingAddress } from '@/types/product';
import { supabase } from "@/integrations/supabase/client";

type ShippingContextType = {
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (address: ShippingAddress, userId?: string) => Promise<void>;
  clearShippingAddress: () => void;
  isLoading: boolean;
};

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Load shipping address from Supabase
  useEffect(() => {
    const fetchShipping = async () => {
      if (!user) return;

      try {
        const cached = localStorage.getItem(`shipping_address_${user.id}`);
        if (cached) {
          setShippingAddressState(JSON.parse(cached));
        } else {
          const { data, error } = await supabase
            .from("shipping_addresses")
            .select("*")
            .eq("user_id", user.id)
            .single(); // or .maybeSingle() if not always guaranteed

          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching shipping from Supabase:", error);
          }

      if (data) {
            const address: ShippingAddress = {
              name: data.name,
              street: data.street,
              city: data.city,
              state: data.state,
              postalCode: data.postal_code,
              country: data.country,
        phone: (data as any).phone || '',
            };

            setShippingAddressState(address);
            localStorage.setItem(`shipping_address_${user.id}`, JSON.stringify(address));
          }
        }
      } catch (error) {
        console.error("Shipping load error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipping();
  }, [user]);

  // Function to update shipping address
  const setShippingAddress = async (address: ShippingAddress, userId?: string) => {
    setShippingAddressState(address);
    const uid = userId || user?.id;
    if (!uid) return;

    try {
      const { error } = await supabase
        .from("shipping_addresses")
        .upsert([
          {
          user_id: uid,
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.postalCode,
          country: address.country,
          phone: address.phone,
        }
        ], {
          onConflict: 'user_id',
        });

      if (error) {
        console.error("Supabase upsert error (shipping):", error);
      } else {
  localStorage.setItem(`shipping_address_${uid}`, JSON.stringify(address));
      }
    } catch (err) {
      console.error("Failed to upsert shipping address:", err);
    }
  };

  // Function to clear shipping address
  const clearShippingAddress = async () => {
    setShippingAddressState(null);

    if (!user) return;

    const { error } = await supabase
      .from("shipping_addresses")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Error clearing shipping address:", error);
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
