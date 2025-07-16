import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * A custom React hook to manage business types from Supabase.
 *
 * Provides CRUD operations and handles loading & error states.
 *
 * @returns An object with:
 * - `businessTypes`: the list of business types
 * - `loading`: whether data is being fetched
 * - `error`: any Supabase error message
 * - `fetchBusinessTypes`: function to fetch business types
 * - `addBusinessType`: function to insert a new business type
 * - `updateBusinessType`: function to update a business type by ID
 * - `deleteBusinessType`: function to delete a business type by ID
 */
export const useBusinessTypes = () => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all business types from Supabase and stores them in state.
   */
  const fetchBusinessTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("business_types").select("*");
    if (error) setError(error.message);
    else setBusinessTypes(data || []);
    setLoading(false);
  };

  /**
   * Inserts a new business type with the given name.
   * @param name - The name of the new business type.
   * @returns The inserted business type, or null if there was an error.
   */
  const addBusinessType = async (name: string) => {
    const { data, error } = await supabase
      .from("business_types")
      .insert([{ name }])
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setBusinessTypes((prev) => [...prev, data]);
    return data;
  };

  /**
   * Updates the name of a business type by ID.
   * @param id - The ID of the business type to update.
   * @param name - The new name to set.
   * @returns The updated business type, or null if there was an error.
   */
  const updateBusinessType = async (id: string, name: string) => {
    const { data, error } = await supabase
      .from("business_types")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return null;
    }
    setBusinessTypes((prev) => prev.map((bt) => (bt.id === id ? data : bt)));
    return data;
  };

  /**
   * Deletes a business type by ID.
   * @param id - The ID of the business type to delete.
   * @returns True if deleted successfully, otherwise false.
   */
  const deleteBusinessType = async (id: string) => {
    const { error } = await supabase
      .from("business_types")
      .delete()
      .eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setBusinessTypes((prev) => prev.filter((bt) => bt.id !== id));
    return true;
  };

  // Fetch business types on first mount
  useEffect(() => {
    fetchBusinessTypes();
  }, []);

  return {
    businessTypes,
    loading,
    error,
    fetchBusinessTypes,
    addBusinessType,
    updateBusinessType,
    deleteBusinessType,
  };
};
