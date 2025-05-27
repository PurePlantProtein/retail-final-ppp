
import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  role: z.enum(["admin", "retailer"]),
  // Contact details
  contactName: z.string().min(1, "Contact name is required"),
  phone: z.string().min(1, "Phone number is required"),
  // Shipping address
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(4, "Postal code must be at least 4 digits"),
  // Email options
  emailCredentials: z.boolean().default(false),
});

export type UserCreateFormData = z.infer<typeof userCreateSchema>;
