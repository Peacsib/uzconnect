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

export const studentRegSchema = z.object({
  fullName: xssSafeString("Full name", 2, 100),
  email: z.string()
    .email("Invalid email address")
    .transform((val: string) => {
      const sanitized = validateEmail(val);
      if (!sanitized) throw new Error("Invalid email format");
      return sanitized;
    }),
  regNumber: z.string()
    .min(4, "Registration number is required (e.g. R2421428)")
    .max(20, "Registration number is too long")
    .transform((val) => val.trim().toUpperCase()),
  programmeId: z.coerce.number().min(1, "Please select your degree programme"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((d) => {
  const emailPrefix = d.email.split('@')[0].trim().toUpperCase();
  const reg = d.regNumber.trim().toUpperCase();
  return emailPrefix === reg;
}, {
  message: "Registration number must match your student email prefix (e.g. R2421428@uofzmail.uz.ac.zw)",
  path: ["regNumber"],
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
    .min(6, "Phone number is required")
    .transform((val: string) => {
      const sanitized = validatePhone(val);
      if (!sanitized) return val;
      return sanitized;
    }),
  company: xssSafeString("Company", 2, 200),
  jobTitle: xssSafeString("Job title", 2, 100),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  departmentId: z.coerce.number().min(1, "Department is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type StudentRegFormData = z.infer<typeof studentRegSchema>;
export type SupervisorRegFormData = z.infer<typeof supervisorRegSchema>;
export type LecturerRegFormData = z.infer<typeof lecturerRegSchema>;
