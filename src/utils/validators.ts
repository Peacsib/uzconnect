import { z } from "zod";
import { sanitizeText, validateEmail, validatePhone, containsXssPatterns } from "@/lib/xssProtection";

// Custom Zod refinements for XSS protection
const xssSafeString = (fieldName: string, minLength: number, maxLength: number) => 
  z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
    .refine(
      (val) => !containsXssPatterns(val),
      { message: `${fieldName} contains invalid characters` }
    )
    .transform((val: string) => sanitizeText(val));

export const loginSchema = z.object({
  email: z.string().min(1, "Username is required (registration number or email)"),
  password: z.string().min(1, "Password is required"),
});

export const supervisorRegSchema = z.object({
  fullName: xssSafeString("Name", 2, 100),
  email: z.string()
    .email("Invalid email address")
    .transform((val: string) => {
      const sanitized = validateEmail(val);
      if (!sanitized) throw new Error("Invalid email format");
      return sanitized;
    }),
  phone: z.string()
    .min(8, "Phone number is required")
    .transform((val: string) => {
      const sanitized = validatePhone(val);
      if (!sanitized) throw new Error("Invalid phone number format");
      return sanitized;
    }),
  company: xssSafeString("Company", 2, 200),
  jobTitle: xssSafeString("Job title", 2, 100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const lecturerRegSchema = z.object({
  fullName: xssSafeString("Name", 2, 100),
  email: z.string()
    .email("Invalid email")
    .transform((val: string) => {
      const sanitized = validateEmail(val);
      if (!sanitized) throw new Error("Invalid email format");
      return sanitized;
    }),
  department: xssSafeString("Department", 1, 200),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SupervisorRegFormData = z.infer<typeof supervisorRegSchema>;
export type LecturerRegFormData = z.infer<typeof lecturerRegSchema>;
