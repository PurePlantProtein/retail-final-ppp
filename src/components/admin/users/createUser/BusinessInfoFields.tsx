
import React from 'react';
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

interface BusinessInfoFieldsProps {
  control: Control<UserCreateFormData>;
}

const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ control }) => {
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
                  <SelectValue placeholder="Select type" />
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
    </div>
  );
};

export default BusinessInfoFields;
