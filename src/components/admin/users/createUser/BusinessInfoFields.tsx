
import React from 'react';
import { useBusinessTypes } from '@/hooks/users/useBusinessTypes';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCreateFormData } from './userCreateSchema';
import { BusinessType } from '@/types/user';

interface BusinessInfoFieldsProps {
  control: Control<UserCreateFormData>;
}

const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ control }) => {
  const { businessTypes, loading, error } = useBusinessTypes();
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
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
        control={control}
        name="businessType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select type"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>Error loading types</SelectItem>
                ) : businessTypes.length === 0 ? (
                  <SelectItem value="no-types" disabled>No types found</SelectItem>
                ) : (
                  businessTypes.map((bt: BusinessType) => (
                    <SelectItem key={bt.id} value={bt.name}>{bt.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BusinessInfoFields;
