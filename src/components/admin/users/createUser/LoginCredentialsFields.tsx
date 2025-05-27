
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCreateFormData } from './userCreateSchema';

interface LoginCredentialsFieldsProps {
  control: Control<UserCreateFormData>;
}

const LoginCredentialsFields: React.FC<LoginCredentialsFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="business@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="emailCredentials"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Email temporary password to retailer
              </FormLabel>
              <FormDescription>
                Send login credentials with a temporary password. The retailer can reset their password after first login.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default LoginCredentialsFields;
